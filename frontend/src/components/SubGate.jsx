import { useAuth } from "@/lib/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Crown, ShieldCheck } from "lucide-react";

const ALLOWED_WITHOUT_SUB = [
  "/app/billing",
  "/app/settings",
  "/app/admin",
];

export const PLAN_TIER = { starter: 1, business: 2, premium: 3 };
export const TIER = PLAN_TIER;
export const NAMES = { starter: "Starter", business: "Business", premium: "Premium" };

// Which routes require which plan
export const ROUTE_PLAN = {
  "/app/customers": "business",
  "/app/udhaar": "business",
  "/app/reports": "business",
  "/app/stock": "business",
};

function Wall({ title, msg, cta, onCta, neededPlan }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4" data-testid="paywall">
      <div className="max-w-md w-full text-center rounded-3xl border-2 border-brand-mitti bg-white p-8 shadow-lift animate-fade-up">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-terracotta/10 text-brand-terracotta grid place-items-center mb-2">
          <Lock className="w-8 h-8 text-brand-terracotta" />
        </div>
        <div className="text-xs uppercase font-extrabold tracking-widest text-brand-terracotta">
          {NAMES[neededPlan] || "UPGRADE"} PLAN REQUIRED
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-brand-indigo">{title}</h1>
        <p className="mt-2 text-xs text-brand-indigo/70 leading-relaxed">{msg}</p>
        
        <Button
          onClick={onCta}
          data-testid="paywall-subscribe"
          className="mt-6 w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>{cta}</span>
          <ArrowRight className="w-4 h-4"/>
        </Button>
        <div className="mt-4 text-[11px] text-brand-indigo/60 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instant upgrade · 100% money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}

export default function SubGate({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  // Admin has access to all routes
  if (user?.is_admin) return children;

  // Active plan from user object or device localStorage
  let userPlan = user?.subscription?.plan;
  if (!userPlan) {
    try {
      const stored = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
      userPlan = stored?.subscription?.plan;
    } catch {}
  }
  userPlan = userPlan || "starter";
  const userTier = PLAN_TIER[userPlan] || 1;

  // Match current route against ROUTE_PLAN
  const matchedRoute = Object.keys(ROUTE_PLAN).find(p => loc.pathname === p || loc.pathname.startsWith(p + "/"));
  if (matchedRoute) {
    const needed = ROUTE_PLAN[matchedRoute];
    const requiredTier = PLAN_TIER[needed] || 1;

    if (userTier < requiredTier) {
      return (
        <Wall
          title={`${NAMES[needed]} Feature`}
          msg={`Yeh feature sirf "${NAMES[needed]}" ya "Premium" plan mein available hai. Aapka current plan "${NAMES[userPlan]}" hai. Is feature ko unlock karne ke liye apna plan upgrade karein.`}
          cta={`Upgrade to ${NAMES[needed]} (₹${needed === "business" ? "399" : "799"}/mo)`}
          neededPlan={needed}
          onCta={() => nav(`/subscribe?plan=${needed}&renew=1`)}
        />
      );
    }
  }

  return children;
}

export function LockIcon() { return <Lock className="w-3.5 h-3.5" />; }
