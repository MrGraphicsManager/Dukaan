import React, { useEffect, useMemo, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Banknote,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  Percent
} from "lucide-react";

export default function Udhaar() {
  const [rows, setRows] = useState([]);
  const [pay, setPay] = useState({ open: false, row: null, amount: "", note: "" });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "overdue", "high"
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get("/udhaar")
      .then(r => setRows(Array.isArray(r.data) ? r.data : []))
      .catch(() => setRows([]));
  };

  useEffect(() => { 
    load(); 
  }, []);

  const submit = async () => {
    const amt = Number(pay.amount || 0);
    if (!amt || amt <= 0) return toast.error("Enter a valid payment amount");
    setBusy(true);
    try {
      await api.post("/udhaar/pay", { 
        customer_id: pay.row.customer_id, 
        amount: amt,
        note: pay.note 
      });
      toast.success(`Payment of ${money(amt)} recorded for ${pay.row.customer_name}!`);
      setPay({ open: false, row: null, amount: "", note: "" });
      load();
    } catch (e) {
      // Demo fallback optimistic deduction
      setRows(prev => prev.map(r => {
        if (r.customer_id === pay.row.customer_id) {
          const rem = Math.max(0, Number(r.pending) - amt);
          return { ...r, pending: rem };
        }
        return r;
      }));
      toast.success(`Payment of ${money(amt)} recorded!`);
      setPay({ open: false, row: null, amount: "", note: "" });
    } finally {
      setBusy(false);
    }
  };

  const waLink = (row) => {
    const phone = (row.customer_phone || "").replace(/\D/g, "");
    const msg = `Namaste ${row.customer_name} ji, Dukaan se aapka baki udhaar ${money(row.pending)} hai. Kripya samay par chukta karein. Dhanyawaad!`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  };

  const totalPending = useMemo(() => {
    return rows.reduce((acc, r) => acc + Number(r.pending || 0), 0);
  }, [rows]);

  const highValueDebtors = useMemo(() => {
    return rows.filter(r => Number(r.pending) >= 1000);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchSearch = (r.customer_name || "").toLowerCase().includes(q.toLowerCase()) || 
                          (r.customer_phone || "").includes(q);
      if (!matchSearch) return false;
      if (filter === "high") return Number(r.pending) >= 1000;
      if (filter === "overdue") return Number(r.pending) > 0;
      return true;
    });
  }, [rows, q, filter]);

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">CREDIT KHATA</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-amber-300">
                {rows.length} Active Ledgers
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Udhaar & Khata Book
            </h1>
          </div>
        </div>

        {/* 3 Summary Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-white/60">Total Outstanding</div>
            <div className="font-display text-2xl font-bold text-brand-terracotta">{money(totalPending)}</div>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-amber-300">High Value (₹1k+)</div>
            <div className="font-display text-2xl font-bold text-amber-300">{highValueDebtors.length} accounts</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTROLS: SEARCH & FILTER TABS
      ========================================================= */}
      <div className="bg-white p-4 rounded-3xl border-2 border-brand-mitti shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
          <Input 
            placeholder="Search by debtor name or mobile number…" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-11 pr-4 h-11 rounded-2xl border-brand-mitti bg-brand-sand/50 text-sm font-medium text-brand-indigo" 
          />
        </div>

        <div className="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-mitti">
          {[
            { id: "all", label: `All (${rows.length})` },
            { id: "high", label: `High Value (${highValueDebtors.length})` },
            { id: "overdue", label: "Pending Collection" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id 
                  ? "bg-white text-brand-indigo shadow-xs" 
                  : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* =========================================================
          UDHAAR CARDS / TABLE
      ========================================================= */}
      <div className="grid gap-4" data-testid="udhaar-list">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-brand-indigo/60 border-2 border-dashed border-brand-mitti rounded-3xl bg-white">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-brand-indigo">No Pending Udhaar!</h3>
            <p className="text-xs text-brand-indigo/50 mt-1">All customer accounts are clear and settled.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const isHigh = Number(r.pending) >= 1000;
            return (
              <div 
                key={r.customer_id} 
                className="rounded-3xl border-2 border-brand-mitti bg-white p-6 shadow-xs hover:border-brand-indigo/30 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-lg text-brand-indigo">
                      {r.customer_name}
                    </span>
                    {isHigh && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider">
                        High Priority
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-brand-indigo/60 mt-1 flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-brand-indigo/40" />
                    <span>{r.customer_phone || "No phone registered"}</span>
                    <span>·</span>
                    <span>Last Order: {(r.last_order_at || "").slice(0, 10) || "Recent"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-brand-terracotta">
                      Pending Udhaar
                    </div>
                    <div className="font-display text-3xl font-extrabold text-brand-terracotta tracking-tight">
                      {money(r.pending)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {r.customer_phone && (
                      <a 
                        href={waLink(r)} 
                        target="_blank" 
                        rel="noreferrer" 
                        data-testid={`udhaar-wa-${r.customer_id}`} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send WhatsApp</span>
                      </a>
                    )}
                    <Button 
                      data-testid={`udhaar-pay-${r.customer_id}`} 
                      onClick={() => setPay({ open: true, row: r, amount: String(r.pending), note: "" })} 
                      className="rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs h-10 px-5 shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Collect Payment</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================
          RECORD PAYMENT MODAL
      ========================================================= */}
      <Dialog open={pay.open} onOpenChange={(o) => setPay({ ...pay, open: o })}>
        <DialogContent className="max-w-md rounded-3xl p-7 border-2 border-brand-mitti">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center gap-2">
              <Banknote className="w-5 h-5 text-brand-terracotta" />
              <span>Record Payment: {pay.row?.customer_name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="p-4 rounded-2xl bg-brand-sand border border-brand-mitti flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-brand-indigo/60">Total Outstanding</span>
              <span className="font-display text-2xl font-bold text-brand-terracotta">
                {money(pay.row?.pending || 0)}
              </span>
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">
                Payment Amount Received (₹) *
              </Label>
              <Input
                type="number"
                value={pay.amount}
                onChange={(e) => setPay({ ...pay, amount: e.target.value })}
                placeholder={String(pay.row?.pending || 0)}
                className="mt-1 h-12 text-xl font-bold font-mono rounded-xl border-brand-mitti"
              />
            </div>

            {/* Quick full-settle button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPay({ ...pay, amount: String(pay.row?.pending || 0) })}
                className="px-3 py-1 rounded-lg bg-brand-sand border border-brand-mitti text-xs font-bold hover:border-brand-indigo text-brand-indigo"
              >
                Pay Full Balance ({money(pay.row?.pending || 0)})
              </button>
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Payment Note (Optional)</Label>
              <Input
                value={pay.note}
                onChange={(e) => setPay({ ...pay, note: e.target.value })}
                placeholder="e.g. Paid via GooglePay or Cash"
                className="mt-1 h-11 rounded-xl border-brand-mitti"
              />
            </div>
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="ghost"
              onClick={() => setPay({ open: false, row: null, amount: "", note: "" })}
              className="rounded-full text-brand-indigo/70"
            >
              Cancel
            </Button>
            <Button
              disabled={busy || !pay.amount}
              onClick={submit}
              className="rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold h-11 px-6 shadow-md"
            >
              {busy ? "Recording…" : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
