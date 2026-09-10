import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { useAuth, getPersistentSubscription, getPersistentUpcomingSubscription } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  CreditCard, 
  Crown, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Receipt,
  ExternalLink,
  Download,
  AlertCircle,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Check
} from "lucide-react";

export const PLAN_RANK = {
  starter: 1,
  business: 2,
  cafe: 2.5,
  premium: 3,
  pro: 4,
};

const TIER_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 79,
    originalPrice: 99,
    discount: "20% OFF",
    setup: 299,
    badge: "Solo Shop",
    features: [
      "Fast POS Billing & Invoices",
      "Unlimited Products & Inventory",
      "Order History & Basic Reports",
      "Standard Dashboard Access",
    ]
  },
  {
    id: "business",
    name: "Business",
    price: 119,
    originalPrice: 149,
    discount: "20% OFF",
    setup: 499,
    featured: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "Customer Khata Directory",
      "Udhaar & WhatsApp 1-Tap Reminders",
      "Low Stock Automated Alerts",
      "Daily & Monthly Sales Analytics"
    ]
  },
  {
    id: "cafe",
    name: "Cafe Plan",
    price: 149,
    originalPrice: 199,
    discount: "Save 25%",
    setup: 0,
    badge: "NexoraOS",
    is_cafe: true,
    features: [
      "POS & Quick Table Billing",
      "Table Management & Status",
      "Kitchen Order Tickets (KOT)",
      "Digital Menu & QR Ordering",
      "Basic Stock & Recipe Inventory",
      "Staff Accounts & Waiter Roles",
      "Sales & Food Cost Reports",
      "Powered by NexoraOS (by PEAN)"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 239,
    originalPrice: 299,
    discount: "20% OFF",
    setup: 999,
    badge: "Full Power",
    features: [
      "Everything in Business",
      "Multi-Shop Headquarter Support",
      "Full FY Tax & Profit Audit",
      "GST Invoicing & Verification",
      "Priority Support & Soundbox"
    ]
  },
  {
    id: "pro",
    name: "Dukaan Pro",
    price: 499,
    originalPrice: null,
    offerBadge: "1+1 Month Free",
    setup: 0,
    is_pro: true,
    badge: "Flagship Plan",
    features: [
      "Everything in Premium",
      "Custom Billing & Invoices",
      "Custom Dashboard & Widgets",
      "Customize Everything",
      "Early Access to New Updates",
      "24/7 Dedicated Support"
    ]
  }
];

export default function Billing() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();
  
  // 1. Current Running Plan State
  const [sub, setSub] = useState(() => {
    let localSub = user?.subscription || null;
    if (!localSub) {
      try {
        const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
        localSub = u?.subscription || null;
      } catch {}
    }
    if (!localSub && user?.email) {
      localSub = getPersistentSubscription(user.email);
    }
    return localSub;
  });

  // 2. Upcoming / Queued Plan State
  const [upcomingSub, setUpcomingSub] = useState(() => {
    let localUpcoming = user?.upcoming_subscription || null;
    if (!localUpcoming) {
      try {
        const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
        localUpcoming = u?.upcoming_subscription || null;
      } catch {}
    }
    if (!localUpcoming && user?.email) {
      try {
        const allQueued = JSON.parse(localStorage.getItem("dukaan_upcoming_subscriptions") || "{}");
        localUpcoming = allQueued[user.email.toLowerCase().trim()] || null;
      } catch {}
    }
    return localUpcoming;
  });

  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    let localSub = user?.subscription || null;
    let localUpcoming = user?.upcoming_subscription || null;
    if (!localSub) {
      try {
        const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
        localSub = u?.subscription || null;
        if (!localUpcoming) localUpcoming = u?.upcoming_subscription || null;
      } catch {}
    }
    if (localSub) setSub(localSub);
    if (localUpcoming) setUpcomingSub(localUpcoming);

    const syncSub = () => {
      api.get("/subscriptions/me")
        .then(r => { 
          if (r.data?.active) {
            const serverActive = r.data.active;
            setSub(prevSub => {
              const prevExp = prevSub?.expires_at ? new Date(prevSub.expires_at).getTime() : 0;
              const serverExp = serverActive?.expires_at ? new Date(serverActive.expires_at).getTime() : 0;
              if (prevExp > serverExp) {
                return prevSub;
              }
              return serverActive;
            });

            const stored = localStorage.getItem("dukaan_user");
            if (stored) {
              try {
                const u = JSON.parse(stored);
                const localExp = u.subscription?.expires_at ? new Date(u.subscription.expires_at).getTime() : 0;
                const serverExp = serverActive?.expires_at ? new Date(serverActive.expires_at).getTime() : 0;

                if (serverExp >= localExp) {
                  u.subscription = serverActive;
                  if (serverActive.plan === "premium" || serverActive.plan === "pro") u.is_premium = true;
                  if (serverActive.plan === "pro") u.is_pro = true;
                }
                if (r.data?.upcoming || r.data?.queued) {
                  const queuedSub = r.data.upcoming || r.data.queued;
                  u.upcoming_subscription = queuedSub;
                  setUpcomingSub(queuedSub);
                }
                localStorage.setItem("dukaan_user", JSON.stringify(u));
                if (u.email) {
                  const allSubs = JSON.parse(localStorage.getItem("dukaan_all_subscriptions") || "{}");
                  allSubs[u.email.toLowerCase().trim()] = u.subscription;
                  localStorage.setItem("dukaan_all_subscriptions", JSON.stringify(allSubs));
                }
              } catch {}
            }
          }

          if (r.data?.upcoming || r.data?.queued) {
            const queuedSub = r.data.upcoming || r.data.queued;
            setUpcomingSub(queuedSub);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    syncSub();
    const interval = setInterval(syncSub, 5000);
    window.addEventListener("focus", syncSub);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncSub);
    };
  }, [user?.subscription, user?.upcoming_subscription]);

  // Instant Activation Handler
  const handleActivateNow = async (skipConfirm = false) => {
    if (!upcomingSub) return;
    const planName = upcomingSub.plan_name || upcomingSub.plan?.toUpperCase() || "New";
    const durationDays = Number(upcomingSub.duration_days) || (upcomingSub.plan === "pro" ? 60 : 30);
    const cycles = upcomingSub.cycle_count || Math.max(1, Math.round(durationDays / (upcomingSub.plan === "pro" ? 60 : 30)));

    if (!skipConfirm) {
      const ok = window.confirm(
        `Activate ${planName} Plan right now?\n\n` +
        `Your new plan benefits will begin immediately, and ALL remaining time (${durationDays} days${cycles > 1 ? ` across ${cycles} queued cycles` : ""}) will roll over into your active subscription so you lose zero days!`
      );
      if (!ok) return;
    }

    setActivating(true);
    try {
      const curExp = sub?.expires_at ? new Date(sub.expires_at).getTime() : 0;
      const baseMs = Math.max(Date.now(), curExp);
      const newExpiry = new Date(baseMs + durationDays * 86400000).toISOString();

      const newActive = {
        plan: upcomingSub.plan,
        status: "active",
        is_annual: Boolean(upcomingSub.is_annual),
        razorpay_order_id: upcomingSub.razorpay_order_id,
        razorpay_payment_id: upcomingSub.razorpay_payment_id,
        expires_at: newExpiry,
        activated_at: new Date().toISOString()
      };

      setSub(newActive);
      setUpcomingSub(null);

      const rawUser = localStorage.getItem("dukaan_user");
      const parsed = rawUser ? JSON.parse(rawUser) : { email: user?.email || "owner@dukaan.in" };
      parsed.subscription = newActive;
      parsed.upcoming_subscription = null;
      if (newActive.plan === "premium" || newActive.plan === "pro") parsed.is_premium = true;
      if (newActive.plan === "pro") parsed.is_pro = true;
      localStorage.setItem("dukaan_user", JSON.stringify(parsed));

      const userEmail = (user?.email || parsed.email || "").toLowerCase().trim();
      if (userEmail) {
        try {
          const allSubs = JSON.parse(localStorage.getItem("dukaan_all_subscriptions") || "{}");
          allSubs[userEmail] = newActive;
          localStorage.setItem("dukaan_all_subscriptions", JSON.stringify(allSubs));
        } catch {}
        try {
          const allQueued = JSON.parse(localStorage.getItem("dukaan_upcoming_subscriptions") || "{}");
          delete allQueued[userEmail];
          localStorage.setItem("dukaan_upcoming_subscriptions", JSON.stringify(allQueued));
        } catch {}
        try {
          let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
          const idx = regUsers.findIndex(u => u.email && u.email.toLowerCase() === userEmail);
          if (idx >= 0) {
            regUsers[idx].subscription = newActive;
            regUsers[idx].upcoming_subscription = null;
            if (newActive.plan === "premium" || newActive.plan === "pro") regUsers[idx].is_premium = true;
            if (newActive.plan === "pro") regUsers[idx].is_pro = true;
            localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
          }
        } catch {}
      }

      try {
        await api.post("/subscriptions/activate-queued", {
          user_email: userEmail,
          upcoming_subscription: upcomingSub
        });
      } catch (_) {}

      window.dispatchEvent(new CustomEvent("dukaan_subscription_updated"));
      if (refresh) refresh();
      toast.success(`🎉 ${planName} Plan Activated! Valid until ${newExpiry.slice(0, 10)} (${durationDays} days rolled over).`);
    } catch (e) {
      toast.error("Failed to activate plan instantly. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  const currentPlanId = sub?.plan || user?.subscription?.plan || "business";
  const currentRank = PLAN_RANK[currentPlanId] || 2;

  return (
    <div className="space-y-8 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">MEMBERSHIP</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                Active Subscription
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Billing & Subscription Plans
            </h1>
          </div>
        </div>

        <div className="relative z-10">
          <Button
            onClick={() => nav(`/subscribe?plan=${currentPlanId}`)}
            className="h-11 px-6 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Crown className="w-4 h-4" /> Manage Subscription
          </Button>
        </div>
      </div>

      {/* =========================================================
          TWO-PLAN STATUS SECTION (CURRENT PLAN & UPCOMING PLAN)
      ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-indigo flex items-center gap-2">
              <span>Your Store Membership</span>
              {upcomingSub && (
                <span className="text-xs font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  2 Plans Active & Queued
                </span>
              )}
            </h2>
            <p className="text-xs text-brand-indigo/60 mt-0.5">
              {upcomingSub 
                ? "Your currently running plan and next scheduled cycle are both confirmed below."
                : "Active subscription details and renewal lifecycle."}
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${upcomingSub ? "lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
          
          {/* -------------------------------------------------------
              CARD 1: CURRENT RUNNING PLAN
          ------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-7 md:p-8 border-2 border-brand-mitti shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-brand-terracotta" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                    Currently Running Plan
                  </span>
                </div>
                <h3 className="font-display text-3xl font-extrabold text-brand-indigo capitalize">
                  {currentPlanId} Plan
                </h3>
                <p className="text-xs text-brand-indigo/60 mt-1 max-w-md">
                  Unlimited POS billing, customer khata ledger, and real-time inventory management active.
                </p>
              </div>

              <div className="text-right shrink-0">
                {(() => {
                  const isExpired = sub?.expires_at && new Date(sub.expires_at).getTime() < Date.now();
                  const daysLeft = sub?.expires_at ? Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / 86400000) : null;
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

                  if (isExpired) {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Expired
                      </span>
                    );
                  }
                  if (isExpiringSoon) {
                    return (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Expiring in {daysLeft} {daysLeft === 1 ? "day" : "days"}
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Active
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-brand-mitti grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Renews / Ends On</div>
                <div className="font-heading font-extrabold text-base text-brand-indigo mt-0.5">
                  {(sub?.expires_at || "2027-03-31").slice(0, 10)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Billing Cycle</div>
                <div className="font-heading font-extrabold text-base text-brand-indigo mt-0.5 capitalize">
                  {sub?.is_annual ? "Annual (365d)" : "Monthly (30d)"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Status</div>
                <div className="font-heading font-extrabold text-base text-emerald-700 mt-0.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Live Serving
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------
              CARD 2: UPCOMING SCHEDULED PLAN (PAID & CONFIRMED)
          ------------------------------------------------------- */}
          {upcomingSub && (
            <div className="rounded-3xl p-7 md:p-8 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-amber-400/80 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-800" /> Upcoming Scheduled Plan
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Paid & Confirmed
                      </span>
                    </div>
                    <h3 className="font-display text-3xl font-extrabold text-brand-indigo capitalize">
                      {upcomingSub.plan_name || upcomingSub.plan} Plan
                    </h3>
                    <p className="text-xs text-brand-indigo/70 mt-1 max-w-md">
                      Next cycle scheduled to start automatically when your current plan completes.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-extrabold text-brand-indigo px-3 py-1 rounded-full bg-white border border-brand-mitti shadow-xs block">
                      ₹{upcomingSub.amount_paid || 499} Paid
                    </span>
                  </div>
                </div>

                {(() => {
                  const upcomingDays = Number(upcomingSub.duration_days) || (upcomingSub.plan === "pro" ? 60 : 30);
                  const curExpMs = sub?.expires_at ? new Date(sub.expires_at).getTime() : Date.now();
                  const rawStartMs = upcomingSub.starts_at ? new Date(upcomingSub.starts_at).getTime() : 0;
                  const effectiveStartMs = Math.max(curExpMs, rawStartMs);
                  const effectiveStartsOn = new Date(effectiveStartMs).toISOString().slice(0, 10);
                  const effectiveValidUntil = new Date(effectiveStartMs + upcomingDays * 86400000).toISOString().slice(0, 10);
                  const cycles = upcomingSub.cycle_count || Math.max(1, Math.round(upcomingDays / (upcomingSub.plan === "pro" ? 60 : 30)));

                  return (
                    <div className="mt-6 pt-5 border-t border-amber-300/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Starts On</div>
                        <div className="font-heading font-extrabold text-base text-brand-indigo mt-0.5">
                          {effectiveStartsOn}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Valid Until</div>
                        <div className="font-heading font-extrabold text-base text-emerald-800 mt-0.5">
                          {effectiveValidUntil}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Duration</div>
                        <div className="font-heading font-extrabold text-base text-brand-indigo mt-0.5">
                          {cycles > 1 ? `${upcomingDays} Days (${cycles} Cycles Stacked)` : `${upcomingDays} Days`}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Instant Activation Button */}
              <div className="mt-6 pt-5 border-t border-amber-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-brand-indigo/70 font-medium leading-tight">
                  <b>Want benefits immediately?</b> Activate now and roll over your remaining days with zero loss.
                </div>
                <Button
                  disabled={activating}
                  onClick={() => handleActivateNow(false)}
                  className="h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{activating ? "Activating Plan..." : "⚡ Activate Instantly Now"}</span>
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* =========================================================
          AVAILABLE SUBSCRIPTION TIERS (UPGRADE / DOWNGRADE / RENEW)
      ========================================================= */}
      <div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-indigo">Available Subscription Tiers</h2>
            <p className="text-sm text-brand-indigo/60 mt-0.5">Upgrade, renew, or downgrade your store plan anytime.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {TIER_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const cardRank = PLAN_RANK[plan.id] || 0;
            const isUpgrade = cardRank > currentRank;
            const isDowngrade = cardRank < currentRank;
            const isQueuedNext = upcomingSub?.plan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-5 sm:p-6 border-2 transition-all flex flex-col justify-between relative ${
                  plan.is_pro
                    ? "bg-gradient-to-br from-[#1E1B4B] via-[#2A2375] to-[#1E3A8A] text-white border-indigo-400/60 shadow-xl ring-2 ring-indigo-400/20"
                    : plan.is_cafe
                    ? "bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#9a3412] text-white border-amber-500/60 shadow-xl ring-2 ring-amber-500/20"
                    : plan.featured 
                    ? "bg-brand-indigo text-white border-brand-indigo shadow-xl" 
                    : "bg-white text-brand-indigo border-brand-mitti shadow-xs"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-terracotta text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                {plan.is_cafe && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                    ☕ NexoraOS Special
                  </div>
                )}
                {plan.is_pro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-slate-950" /> Flagship Plan
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${plan.is_pro ? "text-amber-300" : plan.is_cafe ? "text-amber-300" : "text-brand-terracotta"}`}>
                      {plan.name}
                    </span>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        Current Plan
                      </span>
                    ) : isQueuedNext ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                        Scheduled Next
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-display text-4xl font-extrabold">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-sm line-through text-slate-400 font-semibold">₹{plan.originalPrice}</span>
                    )}
                    <span className={`text-xs font-medium ${plan.is_pro || plan.is_cafe ? "text-white/70" : plan.featured ? "text-white/60" : "text-brand-indigo/50"}`}>
                      /month
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                    {plan.discount && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {plan.discount}
                      </span>
                    )}
                    {plan.offerBadge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                        {plan.offerBadge}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium ${plan.is_pro || plan.is_cafe ? "text-white/70" : plan.featured ? "text-white/60" : "text-brand-indigo/50"}`}>
                      {plan.setup > 0 ? `+ ₹${plan.setup} setup` : "Zero setup fee"}
                    </span>
                  </div>

                  <div className={`h-px w-full my-4 ${plan.is_pro || plan.is_cafe ? "bg-white/15" : plan.featured ? "bg-white/15" : "bg-brand-mitti"}`} />

                  <ul className="space-y-3 mb-8 text-xs font-medium">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.is_pro || plan.is_cafe ? "text-amber-300" : plan.featured ? "text-brand-terracotta" : "text-emerald-600"}`} />
                        <span className={plan.is_pro || plan.is_cafe ? "text-white/95" : plan.featured ? "text-white/90" : "text-brand-indigo/80"}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dynamic Tier CTA Buttons */}
                <Button
                  onClick={() => nav(`/subscribe?plan=${plan.id}${isCurrent ? "&renew=1" : ""}`)}
                  className={`w-full h-12 rounded-2xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                    plan.is_pro
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black"
                      : plan.is_cafe
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black"
                      : isCurrent
                      ? "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white"
                      : isUpgrade
                      ? "bg-brand-indigo hover:bg-brand-indigo/90 text-white"
                      : "bg-brand-sand hover:bg-brand-mitti text-brand-indigo border border-brand-mitti"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <span>Renew {plan.name} {plan.id === "pro" ? "(1+1 Mo Free)" : "(+30 Days)"}</span>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </>
                  ) : isUpgrade ? (
                    <>
                      <span>Upgrade to {plan.name}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  ) : isDowngrade ? (
                    <>
                      <span>Downgrade to {plan.name}</span>
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
