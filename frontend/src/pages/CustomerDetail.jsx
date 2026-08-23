import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, money } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);

  useEffect(() => { api.get(`/customers/${id}`).then(r=>setC(r.data)); }, [id]);
  if (!c) return <div className="text-brand-indigo/60">Loading…</div>;

  const totals = c.orders.reduce((a, o) => ({
    purchases: a.purchases + (o.total||0),
    paid: a.paid + (o.paid_amount||0),
    pending: a.pending + (o.pending_amount||0),
  }), { purchases:0, paid:0, pending:0 });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>nav(-1)}>← Back</Button>
        <h1 className="font-heading text-2xl font-bold">{c.name}</h1>
      </div>
      <div className="text-brand-indigo/70">{c.phone} · {c.notes}</div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-brand-mitti bg-white p-4"><div className="text-xs uppercase tracking-widest text-brand-terracotta">Total purchases</div><div className="font-heading text-2xl font-bold">{money(totals.purchases)}</div></div>
        <div className="rounded-xl border border-brand-mitti bg-white p-4"><div className="text-xs uppercase tracking-widest text-brand-terracotta">Paid</div><div className="font-heading text-2xl font-bold text-brand-leaf">{money(totals.paid)}</div></div>
        <div className="rounded-xl border border-brand-mitti bg-white p-4"><div className="text-xs uppercase tracking-widest text-brand-terracotta">Pending</div><div className="font-heading text-2xl font-bold text-brand-terracotta">{money(totals.pending)}</div></div>
      </div>

      <div className="rounded-xl border border-brand-mitti bg-white shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-mitti font-heading font-bold">Order history</div>
        <div className="divide-y divide-brand-mitti">
          {c.orders.length === 0 && <div className="p-6 text-center text-brand-indigo/60 text-sm">No orders yet.</div>}
          {c.orders.map(o => (
            <button key={o.id} onClick={()=>nav(`/app/orders/${o.id}`)} className="w-full text-left px-4 py-3 hover:bg-brand-mitti/30 flex items-center justify-between">
              <div>
                <div className="font-medium">#{o.order_no}</div>
                <div className="text-xs text-brand-indigo/60">{(o.created_at||"").slice(0,16).replace("T"," ")}</div>
              </div>
              <div className="text-right">
                <div className="font-heading font-bold">{money(o.total)}</div>
                <div className={`text-xs uppercase tracking-widest ${o.status==="paid"?"text-brand-leaf":"text-brand-terracotta"}`}>{o.status}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
