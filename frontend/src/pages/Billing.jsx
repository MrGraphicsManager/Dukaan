import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Crown } from "lucide-react";

const STATUS = {
  pending: { color: "text-brand-terracotta bg-brand-terracotta/10", label: "Pending verification", Icon: Clock },
  active:  { color: "text-brand-leaf bg-brand-leaf/10", label: "Active", Icon: CheckCircle2 },
  rejected:{ color: "text-destructive bg-destructive/10", label: "Rejected", Icon: XCircle },
};

export default function Billing() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api.get("/subscriptions/mine").then(r => setSubs(r.data));
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = subs.find(s => s.status === "active");
  const pending = subs.find(s => s.status === "pending");

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl" data-testid="billing-page">
      <h1 className="font-heading text-2xl font-bold">Billing & subscription</h1>

      {active && (
        <Card className="border-brand-leaf/40 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-brand-leaf font-semibold flex items-center gap-1"><Crown className="w-3.5 h-3.5"/> Current plan</div>
                <div className="mt-1 font-heading text-3xl font-bold">{active.plan_name}</div>
                <div className="text-brand-indigo/70">{money(active.amount)}/month</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS.active.color}`}>ACTIVE</span>
            </div>
            <div className="mt-4 text-sm grid grid-cols-2 gap-3">
              <div><div className="text-brand-indigo/60">Activated</div><div>{(active.activated_at||"").slice(0,10)}</div></div>
              <div><div className="text-brand-indigo/60">Renews on</div><div>{(active.expires_at||"").slice(0,10)}</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      {!active && pending && (
        <Card className="border-brand-terracotta/40 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Pending activation</div>
                <div className="mt-1 font-heading text-2xl font-bold">{pending.plan_name} · {money(pending.amount)}/mo</div>
                <div className="text-brand-indigo/70 mt-1">We're verifying your UPI payment. Usually done within a few hours.</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS.pending.color}`}>PENDING</span>
            </div>
            <div className="mt-3 text-sm text-brand-indigo/70">
              Reference: <b>{pending.upi_ref}</b> · Submitted {(pending.created_at||"").slice(0,10)}
            </div>
          </CardContent>
        </Card>
      )}

      {!active && !pending && (
        <Card className="border-brand-mitti shadow-card">
          <CardContent className="p-6 text-center">
            <div className="font-heading text-xl font-bold">You're on the free trial</div>
            <p className="mt-2 text-brand-indigo/70">Upgrade to unlock unlimited orders, advanced reports and priority support.</p>
            <Button data-testid="billing-subscribe-btn" onClick={()=>nav("/subscribe")} className="mt-4 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
              Subscribe now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {subs.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold mb-3">Payment history</h2>
          <div className="rounded-xl border border-brand-mitti bg-white shadow-card divide-y divide-brand-mitti">
            {subs.map(s => {
              const meta = STATUS[s.status] || STATUS.pending;
              const Icon = meta.Icon;
              return (
                <div key={s.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full grid place-items-center ${meta.color}`}><Icon className="w-4 h-4"/></div>
                    <div>
                      <div className="font-medium">{s.plan_name} · {money(s.amount)}</div>
                      <div className="text-xs text-brand-indigo/60">{(s.created_at||"").slice(0,16).replace("T"," ")} · Ref {s.upi_ref}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
