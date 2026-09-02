import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Crown, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Receipt,
  Download,
  AlertCircle
} from "lucide-react";

const TIER_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
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
    price: 149,
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
    id: "premium",
    name: "Premium",
    price: 299,
    setup: 999,
    badge: "Full Power",
    features: [
      "Everything in Business",
      "Multi-Shop Headquarter Support",
      "Full FY Tax & Profit Audit",
      "GST Invoicing & Verification",
      "Priority VIP Support & Soundbox"
    ]
  }
];

export default function Billing() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/subscriptions/me")
      .then(r => setSub(r.data?.active || null))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
    refresh();
  }, [refresh]);

  const currentPlanId = sub?.plan || user?.subscription?.plan || "business";

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
          ACTIVE PLAN HIGHLIGHT CARD
      ========================================================= */}
      <div className="bg-white rounded-3xl p-8 border-2 border-brand-mitti shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-brand-terracotta" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              Current Active Tier
            </span>
          </div>
          <h2 className="font-display text-4xl font-extrabold text-brand-indigo capitalize">
            {currentPlanId} Plan
          </h2>
          <p className="text-sm text-brand-indigo/60 mt-1">
            Unlimited billing, customer khata ledger, and real-time inventory management enabled.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-brand-mitti pt-4 md:pt-0 md:pl-8">
          <div>
            <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Renews On</div>
            <div className="font-heading font-extrabold text-lg text-brand-indigo mt-0.5">
              {(sub?.expires_at || "2027-03-31").slice(0, 10)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Status</div>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          TIER PLANS GRID
      ========================================================= */}
      <div>
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-brand-indigo">Available Subscription Tiers</h2>
          <p className="text-sm text-brand-indigo/60 mt-0.5">Upgrade or change your shop's plan anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIER_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-7 border-2 transition-all flex flex-col justify-between relative ${
                  plan.featured 
                    ? "bg-brand-indigo text-white border-brand-indigo shadow-xl" 
                    : "bg-white text-brand-indigo border-brand-mitti shadow-xs"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-terracotta text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${plan.featured ? "text-brand-terracotta" : "text-brand-terracotta"}`}>
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="font-display text-4xl font-extrabold">₹{plan.price}</span>
                    <span className={`text-xs font-medium ${plan.featured ? "text-white/60" : "text-brand-indigo/50"}`}>
                      /month (+ ₹{plan.setup} setup)
                    </span>
                  </div>

                  <div className={`h-px w-full my-4 ${plan.featured ? "bg-white/15" : "bg-brand-mitti"}`} />

                  <ul className="space-y-3 mb-8 text-xs font-medium">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.featured ? "text-brand-terracotta" : "text-emerald-600"}`} />
                        <span className={plan.featured ? "text-white/90" : "text-brand-indigo/80"}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => nav(`/subscribe?plan=${plan.id}`)}
                  className={`w-full h-12 rounded-2xl font-bold text-xs shadow-sm active:scale-95 transition-all ${
                    plan.featured 
                      ? "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white" 
                      : "bg-brand-sand hover:bg-brand-mitti text-brand-indigo border border-brand-mitti"
                  }`}
                >
                  {isCurrent ? "Current Plan Active" : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
