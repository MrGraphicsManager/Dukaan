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
import { useAuth } from "@/lib/AuthContext";

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
      const pending = Number(c.total_pending || c.udhaar || 0);
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
      if (o.payment_method === "udhaar" || o.status === "udhaar" || o.payment === "Udhaar" || o.payment === "udhaar") {
        const cName = o.customer_name || o.customer || "Walk-in Customer";
        const cPhone = o.customer_phone || o.customerPhone || "";
        const cId = o.customer_id || `cust_${cPhone || cName.replace(/\s+/g, "_")}`;
        const pendingAmount = Number(o.pending_amount || o.total || 0);

        if (!debtorMap[cId]) {
          debtorMap[cId] = {
            customer_id: cId,
            customer_name: cName,
            customer_phone: cPhone,
            pending: pendingAmount,
            count: 1,
            last_order_at: o.created_at || o.date || new Date().toISOString()
          };
        }
      }
    });

    // ⚡ CRITICAL FIX: Set rows from local immediately (0.001 sec synchronous!)
    const initialRows = Object.values(debtorMap).filter(r => r.pending > 0);
    initialRows.sort((a, b) => b.pending - a.pending);
    setRows(initialRows);

    // Try fetching from server in background
    api.get("/udhaar")
      .then(r => {
        const serverRows = Array.isArray(r.data) ? r.data : [];
        if (serverRows.length === 0) return;
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
      .catch(() => {});
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  useEffect(() => {
    const handleUpdate = () => load();
    window.addEventListener("dukaan_customers_updated", handleUpdate);
    window.addEventListener("dukaan_orders_updated", handleUpdate);
    return () => {
      window.removeEventListener("dukaan_customers_updated", handleUpdate);
      window.removeEventListener("dukaan_orders_updated", handleUpdate);
    };
  }, [load]);


  // Record payment / settlement (0.001s instant save)
  const submit = () => {
    const amt = Number(pay.amount || 0);
    if (!amt || amt <= 0) return toast.error("Enter a valid payment amount");

    const targetCId = pay.row.customer_id;

    // 1. Update dukaan_customers in localStorage
    const localCusts = getStoredCustomers();
    const cIdx = localCusts.findIndex(c => c.id === targetCId || (c.phone && c.phone === pay.row.customer_phone));
    if (cIdx >= 0) {
      const current = localCusts[cIdx];
      const newPending = Math.max(0, Number(current.total_pending || current.udhaar || 0) - amt);
      const updated = {
        ...current,
        total_pending: newPending,
        udhaar: newPending,
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dukaan_orders_updated", { detail: orders }));
      }
    } catch {}

    toast.success(`⚡ Payment of ${money(amt)} received from ${pay.row.customer_name}!`);
    setPay({ open: false, row: null, amount: "", note: "" });
    load();

    // 3. Sync to API in background (fire-and-forget)
    api.post("/udhaar/pay", { 
      customer_id: targetCId, 
      amount: amt,
      note: pay.note 
    }).catch(() => {});
  };

  // Add new Udhaar credit entry directly (0.001s instant save)
  const handleAddUdhaar = (e) => {
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
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: addModal.newName.trim(),
        phone: addModal.newPhone.trim(),
        notes: "Created from Udhaar Book",
        total_purchases: 0,
        totalSpent: 0,
        total_paid: 0,
        total_pending: 0,
        udhaar: 0,
        created_at: new Date().toISOString()
      };
    }

    if (!targetCust) {
      toast.error("Please select or enter customer details");
      return;
    }

    // 1. Update customer in local storage immediately
    const localCusts = getStoredCustomers();
    const idx = localCusts.findIndex(c => c.id === targetCust.id || (targetCust.phone && c.phone === targetCust.phone));
    let updatedCust;
    if (idx >= 0) {
      updatedCust = {
        ...localCusts[idx],
        total_purchases: Number(localCusts[idx].total_purchases || localCusts[idx].totalSpent || 0) + amt,
        totalSpent: Number(localCusts[idx].total_purchases || localCusts[idx].totalSpent || 0) + amt,
        total_pending: Number(localCusts[idx].total_pending || localCusts[idx].udhaar || 0) + amt,
        udhaar: Number(localCusts[idx].total_pending || localCusts[idx].udhaar || 0) + amt,
        updated_at: new Date().toISOString()
      };
      localCusts[idx] = updatedCust;
    } else {
      updatedCust = {
        ...targetCust,
        total_purchases: amt,
        totalSpent: amt,
        total_pending: amt,
        udhaar: amt,
        updated_at: new Date().toISOString()
      };
      localCusts.unshift(updatedCust);
    }
    saveStoredCustomers(localCusts);

    // 2. Add an Udhaar Order in localStorage immediately
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
      const updatedOrders = [newOrder, ...orders];
      localStorage.setItem("dukaan_orders", JSON.stringify(updatedOrders));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dukaan_orders_updated", { detail: updatedOrders }));
      }
    } catch {}

    toast.success(`⚡ Udhaar of ${money(amt)} recorded for ${updatedCust.name}!`);
    setAddModal({ open: false, customerId: "", newName: "", newPhone: "", amount: "", note: "" });
    load();

    // 3. Fire-and-forget sync to server
    api.post("/orders", {
      items: newOrder.items,
      discount: 0,
      customer_id: updatedCust.id,
      payment_method: "udhaar",
      note: addModal.note || "Direct Udhaar"
    }).catch(() => {});
  };

  const { user, shops, currentShopId } = useAuth();
  const activeShop = (shops || []).find(s => s?.id === currentShopId) || shops?.[0];
  const shopName = user?.store_name || activeShop?.name || "Apni Dukaan";
  const upiId = user?.upi_id || "merchant@upi";

  const waLink = (row) => {
    const phone = (row.customer_phone || "").replace(/\D/g, "");
    const amt = Number(row.pending || 0);
    const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${amt}&cu=INR&tn=Udhaar%20Payment`;
    
    const msg = `🙏 *Namaste ${row.customer_name} ji*,\n\n` +
      `This is a friendly payment reminder from *${shopName}*.\n` +
      `Your outstanding Khata / Udhaar balance is: *₹${amt.toFixed(2)}*.\n\n` +
      `📲 *Pay Instantly via UPI (PhonePe / GPay / Paytm):*\n` +
      `${upiPayUri}\n\n` +
      `UPI ID: *${upiId}*\n\n` +
      `Please clear the balance at your earliest convenience. Thank you for your continued trust!\n` +
      `_Dukaan 3.0 Smart Khata Engine_`;

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
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans">
      
      {/* =========================================================
          HERO BANNER & TOP STATS
      ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono">CREDIT KHATA BOOK</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                {rows.length} Active Debtors
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Udhaar & Credit Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track pending credit balances, collect partial or full settlements, and send 1-tap WhatsApp payment reminders.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3">
          <Button
            onClick={() => setAddModal({ open: true, customerId: "", newName: "", newPhone: "", amount: "", note: "" })}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-5 shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Udhaar Entry</span>
          </Button>
        </div>
      </div>

      {/* =========================================================
          KPI METRIC CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Outstanding Udhaar</span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {money(totalPending)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Total market receivable credit
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>High Value Debtors (₹1k+)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {highValueDebtors.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Accounts with balance &gt; ₹1,000
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Active Debtor Accounts</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {rows.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Customers with pending balance
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTROLS: SEARCH & FILTER TABS
      ========================================================= */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search by customer name or mobile number…" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-10 pr-4 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white" 
          />
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full gap-1">
          {[
            { id: "all", label: `All (${rows.length})` },
            { id: "high", label: `High Value (${highValueDebtors.length})` },
            { id: "overdue", label: "Pending Collection" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab.id 
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
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
      <div className="grid gap-3" data-testid="udhaar-list">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No Pending Udhaar!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All customer credit accounts are clear and settled. You can record a new credit entry anytime.
            </p>
            <Button
              onClick={() => setAddModal({ open: true, customerId: "", newName: "", newPhone: "", amount: "", note: "" })}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Record Udhaar Entry
            </Button>
          </div>
        ) : (
          filtered.map((r) => {
            const isHigh = Number(r.pending) >= 1000;
            return (
              <div 
                key={r.customer_id} 
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {r.customer_name}
                    </span>
                    {isHigh && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                        High Priority
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono flex-wrap">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.customer_phone || "No phone registered"}</span>
                    <span>·</span>
                    <span>Last Activity: {(r.last_order_at || "").slice(0, 10) || "Recent"}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 md:border-t-0 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Pending Udhaar
                    </div>
                    <div className="font-display text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                      {money(r.pending)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:flex items-center gap-2">
                    {/* View Ledger Button */}
                    <button
                      onClick={() => nav(`/app/customers/${r.customer_id}`)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-800 active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ledger</span>
                    </button>

                    {/* WhatsApp Reminder */}
                    {r.customer_phone ? (
                      <a 
                        href={waLink(r)} 
                        target="_blank" 
                        rel="noreferrer" 
                        data-testid={`udhaar-wa-${r.customer_id}`} 
                        className="inline-flex items-center justify-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-xl hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <div className="h-9" />
                    )}

                    {/* Collect Payment / Jama Button */}
                    <Button 
                      data-testid={`udhaar-pay-${r.customer_id}`} 
                      onClick={() => setPay({ open: true, row: r, amount: String(r.pending), note: "" })} 
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 px-4 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Collect</span>
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
        <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Record New Udhaar Credit</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUdhaar} className="space-y-4 py-2 text-sm">
            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Customer *</Label>
              <Select 
                value={addModal.customerId} 
                onValueChange={(val) => setAddModal(prev => ({ ...prev, customerId: val }))}
              >
                <SelectTrigger className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium">
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Customer Full Name *</Label>
                  <Input
                    required
                    value={addModal.newName}
                    onChange={(e) => setAddModal(prev => ({ ...prev, newName: e.target.value }))}
                    placeholder="e.g. Mukesh Kumar"
                    className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 font-semibold text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Mobile Number (10 Digits)</Label>
                  <Input
                    value={addModal.newPhone}
                    onChange={(e) => setAddModal(prev => ({ ...prev, newPhone: e.target.value }))}
                    placeholder="9825100000"
                    maxLength={10}
                    className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Credit Amount (₹) *</Label>
              <Input
                required
                type="number"
                min="1"
                value={addModal.amount}
                onChange={(e) => setAddModal(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="500"
                className="mt-1 h-11 text-xl font-bold font-mono rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Items / Description / Remarks</Label>
              <Input
                value={addModal.note}
                onChange={(e) => setAddModal(prev => ({ ...prev, note: e.target.value }))}
                placeholder="e.g. 5kg Atta + 1L Oil"
                className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddModal({ ...addModal, open: false })}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs shadow-md"
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
        <DialogContent className="max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-600" />
              <span>Collect Payment: {pay.row?.customer_name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-500">Current Outstanding</span>
              <span className="font-display text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {money(pay.row?.pending || 0)}
              </span>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                Payment Amount Received (₹) *
              </Label>
              <Input
                type="number"
                value={pay.amount}
                onChange={(e) => setPay({ ...pay, amount: e.target.value })}
                placeholder={String(pay.row?.pending || 0)}
                className="mt-1 h-11 text-xl font-bold font-mono rounded-xl border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Quick full-settle button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPay({ ...pay, amount: String(pay.row?.pending || 0) })}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:border-blue-400 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Pay Full Balance ({money(pay.row?.pending || 0)})
              </button>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Payment Remarks (Optional)</Label>
              <Input
                value={pay.note}
                onChange={(e) => setPay({ ...pay, note: e.target.value })}
                placeholder="e.g. Paid via UPI / Cash"
                className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setPay({ open: false, row: null, amount: "", note: "" })}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={busy || !pay.amount}
              onClick={submit}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-5 text-xs shadow-md"
            >
              {busy ? "Recording…" : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
