import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Percent,
  Plus,
  UserPlus,
  ChevronRight,
  FileText
} from "lucide-react";
import { getStoredCustomers, saveStoredCustomers } from "@/pages/Customers";

export default function Udhaar() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pay, setPay] = useState({ open: false, row: null, amount: "", note: "" });
  const [addModal, setAddModal] = useState({ 
    open: false, 
    customerId: "", 
    newName: "", 
    newPhone: "", 
    amount: "", 
    note: "" 
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "overdue", "high"
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    // 1. Load local customers
    const localCustomers = getStoredCustomers();
    setCustomers(localCustomers);

    // 2. Read local orders to aggregate udhaar
    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
    } catch {}

    // Map of customer_id -> { customer_id, customer_name, customer_phone, pending, count, last_order_at }
    const debtorMap = {};

    // First populate from local customers that have pending udhaar
    localCustomers.forEach(c => {
      const pending = Number(c.total_pending || 0);
      if (pending > 0) {
        debtorMap[c.id] = {
          customer_id: c.id,
          customer_name: c.name,
          customer_phone: c.phone || "",
          pending: pending,
          count: 1,
          last_order_at: c.updated_at || c.created_at || new Date().toISOString()
        };
      }
    });

    // Also check orders for any udhaar orders
    localOrders.forEach(o => {
      if (o.payment_method === "udhaar" || o.status === "udhaar") {
        const cName = o.customer_name || "Walk-in Customer";
        const cPhone = o.customer_phone || "";
        const cId = o.customer_id || `cust_${cPhone || cName.replace(/\s+/g, "_")}`;
        const pendingAmount = Number(o.pending_amount || o.total || 0);

        if (!debtorMap[cId]) {
          debtorMap[cId] = {
            customer_id: cId,
            customer_name: cName,
            customer_phone: cPhone,
            pending: pendingAmount,
            count: 1,
            last_order_at: o.created_at || new Date().toISOString()
          };
        }
      }
    });

    // Try fetching from server
    api.get("/udhaar")
      .then(r => {
        const serverRows = Array.isArray(r.data) ? r.data : [];
        serverRows.forEach(sr => {
          if (sr.customer_id) {
            debtorMap[sr.customer_id] = {
              customer_id: sr.customer_id,
              customer_name: sr.customer_name || debtorMap[sr.customer_id]?.customer_name || "Customer",
              customer_phone: sr.customer_phone || debtorMap[sr.customer_id]?.customer_phone || "",
              pending: Number(sr.pending || 0),
              count: Number(sr.count || 1),
              last_order_at: sr.last_order_at || debtorMap[sr.customer_id]?.last_order_at || new Date().toISOString()
            };
          }
        });
        const finalRows = Object.values(debtorMap).filter(r => r.pending > 0);
        finalRows.sort((a, b) => b.pending - a.pending);
        setRows(finalRows);
      })
      .catch(() => {
        const finalRows = Object.values(debtorMap).filter(r => r.pending > 0);
        finalRows.sort((a, b) => b.pending - a.pending);
        setRows(finalRows);
      });
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  // Record payment / settlement
  const submit = async () => {
    const amt = Number(pay.amount || 0);
    if (!amt || amt <= 0) return toast.error("Enter a valid payment amount");
    setBusy(true);

    const targetCId = pay.row.customer_id;

    // 1. Update dukaan_customers in localStorage
    const localCusts = getStoredCustomers();
    const cIdx = localCusts.findIndex(c => c.id === targetCId || (c.phone && c.phone === pay.row.customer_phone));
    if (cIdx >= 0) {
      const current = localCusts[cIdx];
      const updated = {
        ...current,
        total_pending: Math.max(0, Number(current.total_pending || 0) - amt),
        total_paid: Number(current.total_paid || 0) + amt,
        updated_at: new Date().toISOString()
      };
      localCusts[cIdx] = updated;
      saveStoredCustomers(localCusts);
    }

    // 2. Update dukaan_orders in localStorage (mark pending udhaar orders as paid)
    try {
      let orders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      let remAmt = amt;
      orders = orders.map(o => {
        if (remAmt <= 0) return o;
        const matches = o.customer_id === targetCId || (pay.row.customer_phone && o.customer_phone === pay.row.customer_phone);
        if (matches && (o.status === "udhaar" || Number(o.pending_amount || 0) > 0)) {
          const curPending = Number(o.pending_amount || o.total || 0);
          const payTowards = Math.min(remAmt, curPending);
          const newPending = curPending - payTowards;
          remAmt -= payTowards;
          return {
            ...o,
            pending_amount: newPending,
            paid_amount: Number(o.paid_amount || 0) + payTowards,
            status: newPending <= 0 ? "paid" : "udhaar"
          };
        }
        return o;
      });
      localStorage.setItem("dukaan_orders", JSON.stringify(orders));
    } catch {}

    // 3. Sync to API if online
    try {
      await api.post("/udhaar/pay", { 
        customer_id: targetCId, 
        amount: amt,
        note: pay.note 
      });
    } catch (_) {}

    toast.success(`Payment of ${money(amt)} received from ${pay.row.customer_name}!`);
    setPay({ open: false, row: null, amount: "", note: "" });
    setBusy(false);
    load();
  };

  // Add new Udhaar credit entry directly
  const handleAddUdhaar = async (e) => {
    e.preventDefault();
    const amt = Number(addModal.amount || 0);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid credit amount");
      return;
    }

    let targetCust = null;
    if (addModal.customerId && addModal.customerId !== "new") {
      targetCust = customers.find(c => c.id === addModal.customerId);
    } else {
      if (!addModal.newName.trim()) {
        toast.error("Customer name is required");
        return;
      }
      targetCust = {
        id: `c_${Date.now()}`,
        name: addModal.newName.trim(),
        phone: addModal.newPhone.trim(),
        notes: "Created from Udhaar Book",
        total_purchases: 0,
        total_paid: 0,
        total_pending: 0,
        created_at: new Date().toISOString()
      };
    }

    if (!targetCust) {
      toast.error("Please select or enter customer details");
      return;
    }

    setBusy(true);

    // 1. Update customer in local storage
    const localCusts = getStoredCustomers();
    const idx = localCusts.findIndex(c => c.id === targetCust.id || (targetCust.phone && c.phone === targetCust.phone));
    let updatedCust;
    if (idx >= 0) {
      updatedCust = {
        ...localCusts[idx],
        total_purchases: Number(localCusts[idx].total_purchases || 0) + amt,
        total_pending: Number(localCusts[idx].total_pending || 0) + amt,
        updated_at: new Date().toISOString()
      };
      localCusts[idx] = updatedCust;
    } else {
      updatedCust = {
        ...targetCust,
        total_purchases: amt,
        total_pending: amt,
        updated_at: new Date().toISOString()
      };
      localCusts.unshift(updatedCust);
    }
    saveStoredCustomers(localCusts);

    // 2. Add an Udhaar Order in localStorage
    const newOrder = {
      id: `ord_udh_${Date.now()}`,
      order_no: `UDH-${Math.floor(1000 + Math.random() * 9000)}`,
      total: amt,
      paid_amount: 0,
      pending_amount: amt,
      payment_method: "udhaar",
      status: "udhaar",
      customer_id: updatedCust.id,
      customer_name: updatedCust.name,
      customer_phone: updatedCust.phone || "",
      note: addModal.note || "Direct Udhaar Khata entry",
      items: [{ name: addModal.note || "Khata Credit", qty: 1, price: amt }],
      created_at: new Date().toISOString()
    };

    try {
      const orders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      localStorage.setItem("dukaan_orders", JSON.stringify([newOrder, ...orders]));
    } catch {}

    // 3. Try posting to server
    try {
      await api.post("/orders", {
        items: newOrder.items,
        discount: 0,
        customer_id: updatedCust.id,
        payment_method: "udhaar",
        note: addModal.note || "Direct Udhaar"
      });
    } catch (_) {}

    toast.success(`Udhaar of ${money(amt)} recorded for ${updatedCust.name}!`);
    setAddModal({ open: false, customerId: "", newName: "", newPhone: "", amount: "", note: "" });
    setBusy(false);
    load();
  };

  const waLink = (row) => {
    const phone = (row.customer_phone || "").replace(/\D/g, "");
    const msg = `Hello ${row.customer_name}, this is a reminder from Dukaan that your outstanding Udhaar balance is ${money(row.pending)}. Please clear it at your convenience. Thank you!`;
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
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">CREDIT KHATA BOOK</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-amber-300">
                {rows.length} Active Accounts
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Udhaar & Khata Register
            </h1>
          </div>
        </div>

        {/* Summary Badges & Add Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-white/60">Total Outstanding</div>
            <div className="font-display text-2xl font-bold text-brand-terracotta">{money(totalPending)}</div>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-amber-300">High Value (₹1k+)</div>
            <div className="font-display text-2xl font-bold text-amber-300">{highValueDebtors.length} accounts</div>
          </div>
          <Button
            onClick={() => setAddModal({ open: true, customerId: "", newName: "", newPhone: "", amount: "", note: "" })}
            className="rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs h-11 px-5 shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Udhaar Entry</span>
          </Button>
        </div>
      </div>

      {/* =========================================================
          CONTROLS: SEARCH & FILTER TABS
      ========================================================= */}
      <div className="bg-white p-4 rounded-3xl border-2 border-brand-mitti shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
          <Input 
            placeholder="Search by customer name or mobile number…" 
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
          <div className="p-12 text-center text-brand-indigo/60 border-2 border-dashed border-brand-mitti rounded-3xl bg-white space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-brand-indigo">No Pending Udhaar!</h3>
            <p className="text-xs text-brand-indigo/50 max-w-sm mx-auto">
              All customer credit accounts are clear and settled. You can add a new credit transaction anytime.
            </p>
            <Button
              onClick={() => setAddModal({ open: true, customerId: "", newName: "", newPhone: "", amount: "", note: "" })}
              className="rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Record First Udhaar Entry
            </Button>
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
                    <span>Last Transaction: {(r.last_order_at || "").slice(0, 10) || "Recent"}</span>
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
                    {/* View Ledger Button */}
                    <button
                      onClick={() => nav(`/app/customers/${r.customer_id}`)}
                      className="px-3 py-2 rounded-2xl border border-brand-mitti hover:border-brand-indigo text-brand-indigo font-bold text-xs transition-colors flex items-center gap-1 bg-brand-sand/40"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ledger</span>
                    </button>

                    {/* WhatsApp Reminder */}
                    {r.customer_phone && (
                      <a 
                        href={waLink(r)} 
                        target="_blank" 
                        rel="noreferrer" 
                        data-testid={`udhaar-wa-${r.customer_id}`} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-2xl hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Collect Payment / Jama Button */}
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
          ADD NEW UDHAAR ENTRY MODAL
      ========================================================= */}
      <Dialog open={addModal.open} onOpenChange={(o) => setAddModal({ ...addModal, open: o })}>
        <DialogContent className="max-w-md rounded-3xl p-7 border-2 border-brand-mitti bg-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-terracotta" />
              <span>Record New Udhaar Credit</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUdhaar} className="space-y-4 py-2 text-sm">
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Customer *</Label>
              <Select 
                value={addModal.customerId} 
                onValueChange={(val) => setAddModal(prev => ({ ...prev, customerId: val }))}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl border-brand-mitti text-xs font-medium">
                  <SelectValue placeholder="Select existing customer or + New" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Add New Customer</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {addModal.customerId === "new" && (
              <div className="p-3.5 rounded-2xl bg-brand-sand border border-brand-mitti space-y-3">
                <div>
                  <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Customer Full Name *</Label>
                  <Input
                    required
                    value={addModal.newName}
                    onChange={(e) => setAddModal(prev => ({ ...prev, newName: e.target.value }))}
                    placeholder="e.g. Mukesh Kumar"
                    className="mt-1 h-10 rounded-xl border-brand-mitti bg-white font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Mobile Number (10 Digits)</Label>
                  <Input
                    value={addModal.newPhone}
                    onChange={(e) => setAddModal(prev => ({ ...prev, newPhone: e.target.value }))}
                    placeholder="9825100000"
                    maxLength={10}
                    className="mt-1 h-10 rounded-xl border-brand-mitti bg-white font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Credit Amount (₹) *</Label>
              <Input
                required
                type="number"
                min="1"
                value={addModal.amount}
                onChange={(e) => setAddModal(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="500"
                className="mt-1 h-12 text-xl font-bold font-mono rounded-xl border-brand-mitti text-brand-indigo"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Items / Description / Note</Label>
              <Input
                value={addModal.note}
                onChange={(e) => setAddModal(prev => ({ ...prev, note: e.target.value }))}
                placeholder="e.g. 5kg Atta + 1L Oil"
                className="mt-1 h-11 rounded-xl border-brand-mitti"
              />
            </div>

            <DialogFooter className="mt-5 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddModal({ ...addModal, open: false })}
                className="rounded-full text-brand-indigo/70 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold h-11 px-6 shadow-md"
              >
                {busy ? "Saving..." : "Save Credit Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          RECORD PAYMENT / JAMA MODAL
      ========================================================= */}
      <Dialog open={pay.open} onOpenChange={(o) => setPay({ ...pay, open: o })}>
        <DialogContent className="max-w-md rounded-3xl p-7 border-2 border-brand-mitti bg-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center gap-2">
              <Banknote className="w-5 h-5 text-brand-terracotta" />
              <span>Collect Payment: {pay.row?.customer_name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="p-4 rounded-2xl bg-brand-sand border border-brand-mitti flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-brand-indigo/60">Current Outstanding</span>
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
                className="mt-1 h-12 text-xl font-bold font-mono rounded-xl border-brand-mitti text-brand-indigo"
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
                placeholder="e.g. Paid via UPI / Cash"
                className="mt-1 h-11 rounded-xl border-brand-mitti"
              />
            </div>
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="ghost"
              onClick={() => setPay({ open: false, row: null, amount: "", note: "" })}
              className="rounded-full text-brand-indigo/70 font-bold"
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
