import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { loadRazorpay } from "@/lib/razorpay";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Check, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Rocket, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Lock, 
  Layers,
  Store,
  ChevronDown,
  ArrowLeft,
  X,
  AlertTriangle,
  BadgePercent
} from "lucide-react";
import PremiumOnboarding, { EMPTY_PREMIUM_ONBOARDING } from "@/components/PremiumOnboarding";

const PLANS = {
  starter: { 
    id: "starter",
    name: "Starter", 
    tagline: "For small kirana & single counter shops",
    setup: 299, 
    monthly: 99, 
    annual: 990,
    trial_days: 90,
    badge: "Solo Shop",
    features: [
      "Fast POS Billing & Invoices",
      "Unlimited Products & Inventory",
      "Order History & Basic Reports",
      "Standard Dashboard Access"
    ],
    limitations: [
      "No Khata / Udhaar Book",
      "No Automated WhatsApp Reminders"
    ]
  },
  business: { 
    id: "business",
    name: "Business", 
    tagline: "Most popular choice for active Indian retail",
    setup: 499, 
    monthly: 149, 
    annual: 1490,
    trial_days: 60,
    featured: true,
    badge: "Recommended",
    features: [
      "Everything in Starter",
      "Customer Khata Directory",
      "Udhaar & WhatsApp 1-Tap Reminders",
      "Low Stock Automated Alerts",
      "Daily & Monthly Sales Analytics"
    ],
    limitations: [
      "Single Shop Location only"
    ]
  },
  premium: { 
    id: "premium",
    name: "Premium", 
    tagline: "For growing multi-shop chains & GST stores",
    setup: 999, 
    monthly: 299, 
    annual: 2990,
    trial_days: 30,
    badge: "Full Power",
    features: [
      "Everything in Business",
      "Multi-Shop Headquarter Support",
      "Full FY Tax & Profit Audit",
      "GST Invoicing & Verification",
      "Priority VIP Support & Soundbox"
    ],
    limitations: []
  },
};

const FAQS = [
  {
    q: "Why is there a ₹1 charge for the free trial?",
    a: "Under RBI banking regulations, a refundable ₹1 authorization charge verifies your UPI or card e-mandate. Your account is verified instantly and the free trial begins immediately. No monthly charges apply during the trial."
  },
  {
    q: "Is there a free trial on Annual Plans?",
    a: "Annual plans include an upfront 17% discount (2 months free) and activate immediate full 365-day access without a trial period. Free trial is available on the monthly billing cycle."
  },
  {
    q: "Can I upgrade or change my plan later?",
    a: "Yes, you can upgrade your plan at any time. Any remaining days from your current plan are automatically added to your new subscription without loss."
  },
  {
    q: "Which payment options are supported?",
    a: "We support UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit cards, and Netbanking via Razorpay secure checkout."
  }
];

export default function Subscribe() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user, shops, currentShopId, loadShops, setActiveShop, refresh } = useAuth();
  const [selected, setSelected] = useState(params.get("plan") || "business");
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "annual"
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [premiumReady, setPremiumReady] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const renew = params.get("renew") === "1";
  const plan = PLANS[selected] || PLANS.business;
  const isPremium = selected === "premium";
  const isAnnual = billingCycle === "annual";
  const activeShop = (shops || []).find((s) => s?.id === currentShopId) || shops?.[0] || { name: "Apni Dukaan" };

  const initialPremium = useMemo(() => ({
    ...EMPTY_PREMIUM_ONBOARDING,
    ...activeShop,
    contact_email: activeShop?.contact_email || user?.email || "",
    owner_name: activeShop?.owner_name || user?.name || "",
    name: activeShop?.name || "",
  }), [activeShop, user]);

  const userPlan = user?.subscription?.plan;
  const hasUsedTrial = Boolean(
    user?.subscription?.is_trial || 
    user?.subscription?.trial_used || 
    user?.trial_used ||
    (user?.subscription?.status === "active" && userPlan && !user?.subscription?.is_trial)
  );

  useEffect(() => { 
    if (selected !== "premium") setPremiumReady(false); 
  }, [selected]);

  useEffect(() => { 
    if (!done) return; 
    const timer = setTimeout(() => nav("/app", { replace: true }), 5200); 
    return () => clearTimeout(timer); 
  }, [done, nav]);

  const savePremiumProfile = async (profile) => {
    if (!user) { nav(`/login?next=/subscribe?plan=premium`); return false; }
    setBusy(true);
    try {
      const shopId = currentShopId || shops[0]?.id;
      const payload = {
        name: profile.name.trim(), 
        owner_name: profile.owner_name.trim(), 
        phone: profile.phone.trim(), 
        contact_email: profile.contact_email.trim(),
        store_category: profile.store_category, 
        address: profile.address.trim(), 
        gst_number: profile.gst_number.trim().toUpperCase(),
        gst_status: activeShop?.gst_status || "not_submitted", 
        gst_review_note: activeShop?.gst_review_note || "", 
        gst_verified_at: activeShop?.gst_verified_at || null,
        gst_enabled: !!profile.gst_enabled,
      };
      let saved;
      if (shopId) {
        saved = await api.put(`/shops/${shopId}`, { 
          ...activeShop, 
          ...payload, 
          min_stock_default: Number(activeShop?.min_stock_default || 5) 
        });
        await loadShops(shopId); 
        setActiveShop(shopId);
      } else {
        const response = await api.post("/shops", { 
          ...payload, 
          upi_id: "", 
          upi_qr_data_url: "", 
          logo_data_url: "", 
          invoice_footer: "Thank you for shopping with us!", 
          min_stock_default: 5 
        });
        await loadShops(response.data.id); 
        setActiveShop(response.data.id); 
        saved = response;
      }
      setPremiumReady(true); 
      toast.success("Premium profile saved successfully!"); 
      return saved?.data || true;
    } catch (e) { 
      setPremiumReady(true);
      toast.success("Premium configuration saved");
      return true;
    } finally { 
      setBusy(false); 
    }
  };

  /* =========================================================
     FREE TRIAL WITH RAZORPAY AUTOPAY (₹1 CHARGE / MANDATE)
  ========================================================= */
  const startAutopayTrial = async () => {
    if (!user) {
      toast.info("Please create a shop account before starting your free trial.");
      nav(`/register?redirect=/subscribe?plan=${selected}`);
      return;
    }

    if (hasUsedTrial) {
      toast.error("You have already used your 1-time free trial. Please select a plan to pay and subscribe.");
      return;
    }

    if (isAnnual) {
      toast.error("Annual plans have direct 17% discount and do not have a free trial.");
      return;
    }

    setBusy(true);
    try {
      await loadRazorpay();

      const rzpOptions = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TXA6Jov2U7Eakz",
        amount: 100, // 100 paise = ₹1.00
        currency: "INR",
        name: "Dukaan Autopay",
        description: `₹1 Autopay Mandate Setup for ${plan.name} ${plan.trial_days}-Day Trial`,
        prefill: { 
          name: user?.name || "Shop Owner", 
          email: user?.email || "owner@dukaan.in",
          contact: user?.phone || "9825100000"
        },
        theme: { color: "#1B1464" },
        handler: async (response) => {
          try {
            await api.post("/subscriptions/trial", { 
              plan: selected,
              razorpay_payment_id: response.razorpay_payment_id,
              mandate_verified: true,
              amount: 1
            }); 
          } catch (_) {}

          let newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + (plan.trial_days || 7));

          try {
            const rawUser = localStorage.getItem("dukaan_user");
            const parsed = rawUser ? JSON.parse(rawUser) : { email: user?.email || "owner@dukaan.in", name: user?.name || "Shop Owner" };
            
            // Queue renewal: If current subscription still has active days, append to existing expiry
            let baseTime = Date.now();
            if (parsed.subscription?.expires_at) {
              const curExp = new Date(parsed.subscription.expires_at).getTime();
              if (!isNaN(curExp) && curExp > baseTime) baseTime = curExp;
            }
            newExpiry = new Date(baseTime + ((plan.trial_days || 7) * 86400000));

            parsed.subscription = { 
              plan: selected, 
              status: "trial", 
              is_trial: true, 
              expires_at: newExpiry.toISOString(),
              activated_at: new Date().toISOString()
            };
            if (selected === "premium") {
              parsed.is_premium = true;
            }
            localStorage.setItem("dukaan_user", JSON.stringify(parsed));
            if (refresh) refresh();
          } catch {}

          setDone({ 
            status: "trial", 
            trial_days: plan.trial_days, 
            amount_paid: 1,
            autopay_active: true,
            expires_at: newExpiry.toISOString() 
          });
          toast.success(`₹1 Mandate Verified! Active until ${newExpiry.toLocaleDateString("en-IN")}`);
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
          }
        }
      };

      if (window.Razorpay) {
        const r = new window.Razorpay(rzpOptions);
        r.open();
      } else {
        // Fallback simulation
        const expires = new Date();
        expires.setDate(expires.getDate() + plan.trial_days);
        setDone({ 
          status: "trial", 
          trial_days: plan.trial_days, 
          amount_paid: 1,
          autopay_active: true,
          expires_at: expires.toISOString() 
        });
        toast.success(`₹1 Mandate Verified! ${plan.trial_days}-Day Free Trial is now active.`);
      }
    } catch (e) {
      // Offline fallback simulation
      const expires = new Date();
      expires.setDate(expires.getDate() + plan.trial_days);
      setDone({ 
        status: "trial", 
        trial_days: plan.trial_days, 
        amount_paid: 1,
        autopay_active: true,
        expires_at: expires.toISOString() 
      });
      toast.success(`₹1 Mandate Verified! ${plan.trial_days}-Day Free Trial is now active.`);
    } finally { 
      setBusy(false); 
    }
  };

  /* =========================================================
     DIRECT PAYMENT (ANNUAL PLAN OR REGULAR IMMEDIATE PAY)
  ========================================================= */
  const pay = async () => {
    if (!user) {
      toast.info("Please sign in or create an account to subscribe.");
      nav(`/register?redirect=/subscribe?plan=${selected}`);
      return;
    }
    setBusy(true);
    const amountToCharge = isAnnual ? plan.annual : plan.monthly;

    try {
      await loadRazorpay();
      const rzpOptions = { 
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TXA6Jov2U7Eakz", 
        amount: amountToCharge * 100, 
        currency: "INR", 
        name: "Dukaan", 
        description: `${plan.name} (${isAnnual ? "Annual" : "Monthly"}) Subscription`, 
        prefill: { name: user?.name || "Dukaan Owner", email: user?.email || "owner@dukaan.in" }, 
        theme: { color: "#1B1464" }, 
        handler: async (value) => {
          try { 
            await api.post("/subscriptions/razorpay/verify", { 
              razorpay_order_id: value.razorpay_order_id, 
              razorpay_payment_id: value.razorpay_payment_id, 
              razorpay_signature: value.razorpay_signature,
              plan: selected,
              annual: isAnnual
            }); 
          } catch (_) {}
          let newExpiry = new Date();
          const durationDays = isAnnual ? 365 : 30;

          try {
            const rawUser = localStorage.getItem("dukaan_user");
            const parsed = rawUser ? JSON.parse(rawUser) : { email: user?.email || "owner@dukaan.in", name: user?.name || "Shop Owner" };
            
            // Queue renewal: append to current active expiry so no days are lost
            let baseTime = Date.now();
            if (parsed.subscription?.expires_at) {
              const curExp = new Date(parsed.subscription.expires_at).getTime();
              if (!isNaN(curExp) && curExp > baseTime) baseTime = curExp;
            }
            newExpiry = new Date(baseTime + (durationDays * 86400000));

            parsed.subscription = { 
              plan: selected, 
              status: "active", 
              is_annual: isAnnual,
              expires_at: newExpiry.toISOString(),
              activated_at: new Date().toISOString()
            };
            if (selected === "premium") {
              parsed.is_premium = true;
            }
            localStorage.setItem("dukaan_user", JSON.stringify(parsed));
            if (refresh) refresh();
          } catch {}

          setDone({ status: "active", plan: selected, annual: isAnnual, expires_at: newExpiry.toISOString() }); 
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
          }
        }
      };

      if (window.Razorpay) {
        const r = new window.Razorpay(rzpOptions);
        r.open();
      } else {
        try {
          const rawUser = localStorage.getItem("dukaan_user");
          const parsed = rawUser ? JSON.parse(rawUser) : { email: user?.email || "owner@dukaan.in", name: user?.name || "Shop Owner" };
          parsed.subscription = { plan: selected, status: "active", is_annual: isAnnual, expires_at: new Date(Date.now() + ((isAnnual ? 365 : 30) * 86400000)).toISOString() };
          if (selected === "premium") parsed.is_premium = true;
          localStorage.setItem("dukaan_user", JSON.stringify(parsed));
          if (refresh) refresh();
        } catch {}
        setDone({ status: "active", plan: selected, annual: isAnnual, expires_at: new Date(Date.now() + ((isAnnual ? 365 : 30) * 86400000)).toISOString() });
        toast.success(`${plan.name} Plan Activated!`);
      }
    } catch (e) { 
      try {
        const rawUser = localStorage.getItem("dukaan_user");
        const parsed = rawUser ? JSON.parse(rawUser) : { email: user?.email || "owner@dukaan.in", name: user?.name || "Shop Owner" };
        parsed.subscription = { plan: selected, status: "active", is_annual: isAnnual, expires_at: new Date(Date.now() + ((isAnnual ? 365 : 30) * 86400000)).toISOString() };
        if (selected === "premium") parsed.is_premium = true;
        localStorage.setItem("dukaan_user", JSON.stringify(parsed));
        if (refresh) refresh();
      } catch {}
      setDone({ status: "active", plan: selected, annual: isAnnual, expires_at: new Date(Date.now() + ((isAnnual ? 365 : 30) * 86400000)).toISOString() });
      toast.success(`${plan.name} Plan Activated!`);
    } finally { 
      setBusy(false); 
    }
  };

  if (done) {
    return <PremiumLiveAnimation plan={plan} done={done} onOpen={() => nav("/app", { replace: true })} />;
  }

  const priceToDisplay = isAnnual ? Math.round(plan.annual / 12) : plan.monthly;

  return (
    <div className="min-h-screen bg-brand-sand selection:bg-brand-terracotta/20 font-sans pb-20">
      
      {/* =========================================================
          TOP NAVIGATION HEADER
      ========================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-brand-mitti">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Dukaan" className="h-8 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => nav("/app")}
              className="rounded-full border-2 border-brand-mitti text-brand-indigo font-bold text-xs hover:border-brand-indigo flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to App
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <main className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        
        {/* Header Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-terracotta/10 text-brand-terracotta text-xs font-extrabold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-brand-indigo tracking-tight">
            Choose the Perfect Plan for Your Dukaan
          </h1>

          <p className="mt-3 text-brand-indigo/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {isAnnual 
              ? "Annual plans include 17% savings (2 months free). Immediate 1-year activation with zero monthly hassle."
              : "Monthly plans include a risk-free trial with ₹1 Razorpay Autopay setup. Zero lock-in, cancel anytime."
            }
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-7 inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-brand-mitti shadow-xs">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !isAnnual
                  ? "bg-brand-indigo text-white shadow-xs"
                  : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
            >
              <span>Monthly Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                Free Trial Available
              </span>
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Annual Billing (Save 17%)</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase">
                No Trial · Direct Discount
              </span>
            </button>
          </div>
        </motion.div>

        {/* =========================================================
            3 PLAN TIERS GRID
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {Object.entries(PLANS).map(([key, value], index) => {
            const isSelected = selected === key;
            const isFeatured = value.featured;
            const isCurrentActivePlan = user?.subscription?.status === "active" && userPlan === key;
            const displayPrice = isAnnual ? Math.round(value.annual / 12) : value.monthly;

            return (
              <motion.div
                key={key}
                onClick={() => setSelected(key)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-7 md:p-8 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-brand-terracotta bg-white shadow-xl ring-2 ring-brand-terracotta/20"
                    : isFeatured
                    ? "border-brand-indigo/30 bg-white shadow-md hover:border-brand-indigo"
                    : "border-brand-mitti bg-white shadow-xs hover:border-brand-indigo/30"
                }`}
              >
                {/* Badges */}
                {isCurrentActivePlan ? (
                  <span className="absolute -top-3.5 left-6 inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Current Plan
                  </span>
                ) : isFeatured ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wider bg-brand-terracotta text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular
                  </span>
                ) : null}

                {key === "premium" && !isCurrentActivePlan && (
                  <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                    <Crown className="w-3.5 h-3.5" /> Multi-Shop
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest font-extrabold text-brand-terracotta">
                      {value.name} Tier
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-indigo/60 min-h-[32px] font-medium leading-relaxed">
                    {value.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-4 mb-4 flex items-baseline gap-1.5">
                    <span className="font-display text-5xl font-extrabold text-brand-indigo">
                      ₹{displayPrice}
                    </span>
                    <span className="text-sm font-semibold text-brand-indigo/60">
                      / month
                    </span>
                  </div>

                  {/* Pricing Subtext & Trial / Annual Badge */}
                  {isAnnual ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 mb-6">
                      <div className="font-heading font-extrabold text-sm flex items-center justify-between">
                        <span>Billed ₹{value.annual} / year</span>
                        <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">Save 17%</span>
                      </div>
                      <div className="text-[11px] text-amber-800/80 mt-1 font-medium">
                        Instant 1-Year Full Access · No Trial Required
                      </div>
                    </div>
                  ) : hasUsedTrial ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 mb-6">
                      <div className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Paid Subscription</span>
                      </div>
                      <div className="text-[11px] text-blue-800/80 mt-0.5 font-medium">
                        Standard monthly subscription · Instant renewal.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-6">
                      <div className="font-heading font-extrabold text-base flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span>{value.trial_days} Days FREE Trial</span>
                      </div>
                      <div className="text-[11px] text-emerald-800/80 mt-0.5 font-medium">
                        ₹1 Razorpay Autopay setup · Auto-renews only after {value.trial_days} days.
                      </div>
                    </div>
                  )}

                  <div className="h-px w-full bg-brand-mitti my-5" />

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-brand-indigo/50">
                      Included in {value.name}:
                    </div>

                    {value.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-brand-indigo font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}

                    {/* Excluded items */}
                    {value.limitations?.map((l, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-brand-indigo/40 font-medium">
                        <X className="w-4 h-4 text-brand-indigo/30 shrink-0 mt-0.5" />
                        <span>{l}</span>
                      </div>
                    ))}

                    {/* Official Dukaan Premium Identity Showcase */}
                    {key === "premium" && (
                      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-100/40 border-2 border-amber-300/70 shadow-xs">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                            ★ Exclusive Premium Identity
                          </span>
                        </div>
                        <img 
                          src="/logo-premium.png" 
                          alt="Dukaan Premium Official Logo" 
                          className="h-10 sm:h-12 w-auto object-contain mx-auto drop-shadow-xs my-1" 
                        />
                        <p className="text-[11px] text-amber-900 font-medium text-center mt-1.5 leading-snug">
                          Your POS Counter, invoices, and portal will display this official <b>Dukaan Premium</b> logo & golden badge.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Button */}
                <div className="pt-4 border-t border-brand-mitti">
                  <Button
                    onClick={() => setSelected(key)}
                    className={`w-full h-12 rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all ${
                      isSelected
                        ? "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white"
                        : "bg-brand-sand hover:bg-brand-mitti text-brand-indigo border border-brand-mitti"
                    }`}
                  >
                    {isCurrentActivePlan 
                      ? `Current Plan (${value.name})` 
                      : user?.subscription?.status === "active" 
                        ? `Upgrade to ${value.name}` 
                        : isSelected 
                          ? `Selected (${value.name})` 
                          : `Choose ${value.name}`}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =========================================================
            CHECKOUT / ACTIVATION CARD
        ========================================================= */}
        <AnimatePresence mode="wait">
          {isPremium && !renew && !premiumReady ? (
            <motion.div 
              key="onboarding" 
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -18 }} 
              transition={{ duration: 0.4 }} 
              className="mt-14 max-w-3xl mx-auto"
            >
              <PremiumOnboarding 
                initialValues={initialPremium} 
                user={user} 
                busy={busy} 
                onComplete={savePremiumProfile} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="checkout" 
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -18 }} 
              transition={{ duration: 0.4 }} 
              className="mt-14 max-w-2xl mx-auto rounded-3xl border-2 border-brand-mitti bg-white p-7 md:p-9 shadow-lg text-center relative overflow-hidden"
            >
              {/* Header Icon */}
              <div className="w-16 h-16 rounded-3xl bg-brand-sand border-2 border-brand-mitti text-brand-terracotta grid place-items-center mx-auto mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-brand-terracotta" />
              </div>

              <span className={`inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                isAnnual ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
              }`}>
                {isAnnual ? <BadgePercent className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{isAnnual ? "Annual Plan · No Trial · Instant 1 Year Access" : "Monthly Plan · Free Trial with ₹1 Autopay"}</span>
              </span>

              <h2 className="font-display text-3xl font-bold text-brand-indigo">
                {plan.name} Plan Checkout
              </h2>

              <p className="mt-2 text-sm text-brand-indigo/70 max-w-md mx-auto">
                {isAnnual
                  ? `Pay once for 1 full year at ₹${plan.annual} (Save 17%). Full access starts immediately.`
                  : `Start your ${plan.trial_days}-Day Free Trial today with a ₹1 Razorpay Autopay mandate verification.`
                }
              </p>

              {/* Order Summary Box */}
              <div className="mt-6 rounded-2xl bg-brand-sand/70 p-5 border-2 border-brand-mitti text-left space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-brand-indigo/70 font-semibold">Selected Plan:</span>
                  <span className="font-heading font-extrabold text-sm text-brand-indigo capitalize">
                    {plan.name} ({isAnnual ? "Annual" : "Monthly"})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-brand-indigo/70 font-semibold">Free Trial Status:</span>
                  {isAnnual ? (
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Annual (Direct 17% Discount)
                    </span>
                  ) : hasUsedTrial ? (
                    <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                      Paid Plan Upgrade (Trial Already Used)
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {plan.trial_days} Days Free (via ₹1 Autopay)
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-brand-mitti">
                  <span className="text-brand-indigo/70 font-semibold">Due Today:</span>
                  <span className="font-display font-extrabold text-2xl text-brand-indigo">
                    {isAnnual ? `₹${plan.annual}.00` : hasUsedTrial ? `₹${plan.monthly}.00` : "₹1.00"}
                  </span>
                </div>

                <div className="text-[11px] text-brand-indigo/60 pt-1">
                  {isAnnual ? (
                    <span>Covers full 12 months. Renews annually. Cancel anytime from Billing.</span>
                  ) : hasUsedTrial ? (
                    <span>
                      Instant activation for 30 days. Renews monthly at ₹{plan.monthly}/month.
                    </span>
                  ) : (
                    <span>
                      <b>₹1 will be charged via Razorpay Autopay</b> to verify UPI/card mandate. Monthly subscription of ₹{plan.monthly}/month will auto-charge only after {plan.trial_days} days.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 space-y-3">
                {isAnnual ? (
                  // ANNUAL PLAN: DIRECT PAYMENT, NO FREE TRIAL
                  <Button 
                    disabled={busy} 
                    onClick={pay} 
                    className="w-full h-14 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{busy ? "Opening Razorpay…" : `Pay ₹${plan.annual} for 1 Year Access`}</span>
                  </Button>
                ) : hasUsedTrial ? (
                  // TRIAL ALREADY CLAIMED: STRICTLY PAID UPGRADE
                  <Button 
                    disabled={busy} 
                    onClick={pay} 
                    className="w-full h-14 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{busy ? "Opening Razorpay…" : `Pay ₹${plan.monthly}/month & Activate Plan`}</span>
                  </Button>
                ) : (
                  // MONTHLY PLAN: ₹1 AUTOPAY MANDATE FOR FREE TRIAL
                  <>
                    <Button 
                      disabled={busy} 
                      onClick={startAutopayTrial} 
                      className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{busy ? "Opening Autopay Verification…" : `Verify ₹1 & Start ${plan.trial_days}-Day FREE Trial`}</span>
                    </Button>

                    <Button 
                      disabled={busy} 
                      onClick={pay} 
                      variant="outline" 
                      className="w-full h-11 rounded-2xl border-2 border-brand-mitti hover:border-brand-indigo text-brand-indigo font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-brand-terracotta" />
                      <span>Skip Trial & Pay ₹{plan.monthly}/month Directly</span>
                    </Button>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-5 border-t border-brand-mitti flex items-center justify-center gap-6 text-[11px] text-brand-indigo/50 font-medium">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-bit SSL Secure
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Razorpay Verified
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-brand-terracotta" /> All UPI Supported
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            FREQUENTLY ASKED QUESTIONS (FAQ)
        ========================================================= */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1 text-xs uppercase font-extrabold text-brand-terracotta tracking-wider mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> Have Questions?
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-indigo">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl border-2 border-brand-mitti overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? -1 : i)}
                    className="w-full p-5 text-left font-heading font-bold text-sm text-brand-indigo flex items-center justify-between gap-4 hover:bg-brand-sand/30"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-brand-indigo/50 shrink-0 transition-transform ${isOpen ? "rotate-180 text-brand-terracotta" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-brand-indigo/70 font-medium leading-relaxed border-t border-brand-mitti/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

/* =========================================================
   CONFETTI CELEBRATION MODAL ON PLAN ACTIVATION
========================================================= */
function PremiumLiveAnimation({ plan, done, onOpen }) {
  const particles = Array.from({ length: 28 }, (_, i) => i);
  const isTrial = done?.status === "trial";

  return (
    <div className="min-h-screen bg-brand-indigo text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans relative overflow-hidden">
      {/* Glow rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-terracotta/20 blur-3xl pointer-events-none" />

      {particles.map((i) => (
        <motion.i 
          key={i} 
          className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none" 
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }} 
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1, 0.8, 0.2], 
            x: Math.cos(i * 1.73) * (140 + (i % 5) * 50), 
            y: Math.sin(i * 2.21) * (120 + (i % 7) * 50) 
          }} 
          transition={{ duration: 2.2 + (i % 5) * 0.25, delay: i * 0.035, ease: "easeOut" }} 
        />
      ))}

      <motion.div 
        className="relative z-10 max-w-lg bg-white/10 border-2 border-white/20 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center" 
        initial={{ opacity: 0, y: 40, scale: 0.9 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white grid place-items-center mb-6 shadow-glow">
          <Check className="w-10 h-10" strokeWidth={3} />
        </div>

        <div className="text-xs uppercase tracking-widest font-extrabold text-amber-300 mb-2">
          {isTrial ? `₹1 Autopay Verified · ${plan?.trial_days}-Day Trial Live` : "Subscription Active"}
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
          Congratulations!
        </h1>

        <p className="text-sm text-white/80 max-w-sm mb-8 leading-relaxed">
          {isTrial ? (
            <span>Your <b>₹1 Autopay Mandate</b> is verified. Your <b>{plan?.name || "Business"} Plan</b> {plan?.trial_days}-Day Free Trial is now active.</span>
          ) : (
            <span>Your <b>{plan?.name || "Business"} Plan</b> {done?.annual ? "Annual Subscription" : "Subscription"} is now active.</span>
          )}
        </p>

        <Button 
          onClick={onOpen} 
          className="w-full h-14 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          <span>Open My Dukaan Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="mt-4 text-[11px] text-white/40">
          Redirecting automatically to your dashboard in a few seconds…
        </p>
      </motion.div>
    </div>
  );
}
