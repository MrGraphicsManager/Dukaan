import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

export default function Udhaar() {
  const [rows, setRows] = useState([]);
  const [pay, setPay] = useState({ open:false, row:null, amount:"" });

  const load = () => api.get("/udhaar").then(r=>setRows(r.data));
  useEffect(()=>{ load(); }, []);

  const submit = async () => {
    const amt = Number(pay.amount||0);
    if (!amt || amt <= 0) return toast.error("Enter valid amount");
    await api.post("/udhaar/pay", { customer_id: pay.row.customer_id, amount: amt });
    toast.success("Payment recorded");
    setPay({ open:false, row:null, amount:"" });
    load();
  };

  const waLink = (row) => {
    const phone = (row.customer_phone || "").replace(/\D/g,"");
    const msg = `Hello ${row.customer_name}, your pending amount is ₹${row.pending}. Please pay when convenient. Thank you.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-heading text-2xl font-bold">Udhaar (Pending)</h1>
      <div className="rounded-xl border border-brand-mitti bg-white shadow-card overflow-hidden" data-testid="udhaar-list">
        {rows.length===0 && <div className="p-8 text-center text-brand-indigo/60">🎉 No pending payments.</div>}
        {rows.map(r => (
          <div key={r.customer_id} className="p-4 border-b border-brand-mitti last:border-0 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-heading font-bold text-lg">{r.customer_name}</div>
              <div className="text-xs text-brand-indigo/60">{r.customer_phone || "No phone"} · Last: {(r.last_order_at||"").slice(0,10)}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-brand-terracotta">Pending</div>
                <div className="font-heading text-2xl font-bold">{money(r.pending)}</div>
              </div>
              {r.customer_phone && (
                <a href={waLink(r)} target="_blank" rel="noreferrer" data-testid={`udhaar-wa-${r.customer_id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-leaf border border-brand-leaf/30 px-3 py-2 rounded-md hover:bg-brand-leaf/10 transition-colors">
                  <MessageCircle className="w-4 h-4"/> Remind
                </a>
              )}
              <Button data-testid={`udhaar-pay-${r.customer_id}`} onClick={()=>setPay({open:true, row:r, amount:""})} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
                Record payment
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={pay.open} onOpenChange={(o)=>setPay({...pay, open:o})}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Payment from {pay.row?.customer_name}</DialogTitle></DialogHeader>
          <div className="text-sm text-brand-indigo/70">Pending: <b>{money(pay.row?.pending||0)}</b></div>
          <div><Label>Amount received</Label><Input data-testid="udhaar-pay-amount" type="number" value={pay.amount} onChange={(e)=>setPay({...pay, amount:e.target.value})}/></div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=>setPay({open:false, row:null, amount:""})}>Cancel</Button>
            <Button data-testid="udhaar-pay-confirm" onClick={submit} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
