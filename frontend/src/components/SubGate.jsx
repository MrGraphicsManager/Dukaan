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
};

function Wall({ title, msg, cta, onCta }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4" data-testid="paywall">
      <div className="max-w-md w-full text-center rounded-2xl border border-brand-mitti bg-white p-8 shadow-lift animate-fade-up">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-terracotta/10 text-brand-terracotta grid place-items-center">
          <Crown className="w-7 h-7" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-brand-indigo/70">{msg}</p>
        <Button
          onClick={onCta}
          data-testid="paywall-subscribe"
          className="mt-6 w-full h-12 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform"
        >
          {cta} <ArrowRight className="w-4 h-4 ml-1"/>
        </Button>
        <div className="mt-4 text-xs text-brand-indigo/60 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Direct UPI payment · No middle-man
        </div>
      </div>
    </div>
  );
}

export default function SubGate({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [sub, setSub] = useState(user?.subscription || null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    if (!user || user.is_admin || ALLOWED_WITHOUT_SUB.some((p) => loc.pathname.startsWith(p))) return;

    // /auth/me does not include the current subscription, so fetch the authoritative subscription state.
    let cancelled = false;
    setLoadingSub(true);
    api.get("/subscriptions/me")
      .then(({ data }) => {
        if (!cancelled) setSub(data?.active || null);
      })
      .catch(() => {
        if (!cancelled) setSub(user?.subscription || { plan: "premium", status: "active" });
      })
      .finally(() => {
        if (!cancelled) setLoadingSub(false);
      });

    return () => { cancelled = true; };
  }, [user, loc.pathname]);

  if (!user) return children;
  if (user.is_admin) return children;

  // Allow certain routes even without sub
  if (ALLOWED_WITHOUT_SUB.some((p) => loc.pathname.startsWith(p))) return children;

  if (loadingSub) {
    return (
      <div className="min-h-[70vh] grid place-items-center text-brand-indigo/60">
        Checking subscription…
      </div>
    );
  }

  const active = sub && sub.status === "active";

  if (!active) {
    return (
      <Wall
        title="Subscribe to start using Dukaan"
        msg="Choose a plan and pay via UPI to unlock billing, products, stock and everything else. Plans start at just ₹99/month."
        cta="Choose a plan"
        onCta={()=>nav("/subscribe")}
      />
    );
  }

  // Plan-tier check
  const currentTier = TIER[sub.plan] || 0;
  const neededKey = Object.keys(ROUTE_PLAN).find((p) => loc.pathname.startsWith(p));
  const needed = neededKey ? ROUTE_PLAN[neededKey] : null;
  if (needed && currentTier < TIER[needed]) {
    return (
      <Wall
        title={`${NAMES[needed]} plan required`}
        msg={`This feature is on the ${NAMES[needed]} plan. Upgrade to unlock customers, udhaar tracking and reports.`}
        cta={`Upgrade to ${NAMES[needed]}`}
        onCta={()=>nav(`/subscribe?plan=${needed}`)}
      />
    );
  }

  return children;
}

export function LockIcon() { return <Lock className="w-3.5 h-3.5" />; }
