import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, MessageSquare, Check, AlertCircle, ArrowUpRight, ArrowDownLeft, X, Wallet } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import { playVoiceSoundbox } from "@/lib/soundbox";

export default function MobileUdhaar({ onBack, onTabChange }) {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [settleModalCust, setSettleModalCust] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [customers, setCustomers] = useState([]);

  const loadCustomers = () => {
    try {
      const raw = localStorage.getItem("dukaan_customers");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomers(parsed);
          return;
        }
      }
    } catch {}
    setCustomers([]);
  };

  useEffect(() => {
    loadCustomers();
    const handleUpdated = () => loadCustomers();
    window.addEventListener("dukaan_customers_updated", handleUpdated);
    return () => window.removeEventListener("dukaan_customers_updated", handleUpdated);
  }, []);

  const pendingTotal = customers.reduce((sum, c) => sum + Number(c.udhaar !== undefined ? c.udhaar : (c.total_pending || 0)), 0);

  const filtered = customers.filter((c) => {
    const u = Number(c.udhaar !== undefined ? c.udhaar : (c.total_pending || 0));
    if (tab === "pending") return u > 0;
    if (tab === "cleared") return u === 0;
    return true;
  }).filter((c) => (c.name || "").toLowerCase().includes(search.toLowerCase()) || (c.phone || "").includes(search));

  const handleSendReminder = (c) => {
    const u = Number(c.udhaar !== undefined ? c.udhaar : (c.total_pending || 0));
    const text = encodeURIComponent(
      `🙏 *Namaste ${c.name} ji*\n\n` +
      `This is a gentle payment reminder from *Dukaan*.\n` +
      `Your outstanding udhaar balance is *₹${u}*.\n\n` +
      `Kindly pay via UPI or at the shop counter at your convenience.\n` +
      `Thank you for your continued support!`
    );
    window.open(`https://wa.me/91${c.phone}?text=${text}`, "_blank");
    toast.success(`WhatsApp reminder opened for ${c.name}`);
  };

  const handleConfirmSettlement = () => {
    if (!settleModalCust) return;
    const curBalance = Number(settleModalCust.udhaar !== undefined ? settleModalCust.udhaar : (settleModalCust.total_pending || 0));
    const amountToSettle = parseFloat(settleAmount) || curBalance || 0;
    if (amountToSettle <= 0) return;

    const updated = customers.map((c) => {
      if (c.id === settleModalCust.id) {
        const curU = Number(c.udhaar !== undefined ? c.udhaar : (c.total_pending || 0));
        const newU = Math.max(0, curU - amountToSettle);
        return { 
          ...c, 
          udhaar: newU, 
          total_pending: newU,
          total_paid: Number(c.total_paid || 0) + amountToSettle,
          updated_at: new Date().toISOString()
        };
      }
      return c;
    });

    setCustomers(updated);
    try {
      localStorage.setItem("dukaan_customers", JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dukaan_customers_updated", { detail: updated }));
      }
    } catch {}

    try {
      playVoiceSoundbox(amountToSettle, "cash", "en");
    } catch {}

    toast.success(`⚡ Payment of ₹${amountToSettle} received & settled for ${settleModalCust.name}!`);
    setSettleModalCust(null);
    setSettleAmount("");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">Udhaar / Khata Book</h1>
              <p className="text-[11px] font-semibold text-slate-400">Customer Credit Ledger & Settlements</p>
            </div>
          </div>
          <div className="w-8" />
        </div>

        {/* Banner summary cards */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80">
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 uppercase">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>You Will Get</span>
            </div>
            <div className="text-lg font-black text-amber-900 mt-1">₹ {pendingTotal}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-700 uppercase">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Khata Status</span>
            </div>
            <div className="text-lg font-black text-emerald-900 mt-1">{customers.filter(c => (c.udhaar || 0) > 0).length} Due</div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2">
          {[
            { id: "pending", label: "Due / Pending" },
            { id: "cleared", label: "Fully Settled" },
            { id: "all", label: "All Customers" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                tab === t.id ? "bg-[#0066FF] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Records List */}
      <div className="p-4 space-y-2.5">
        {filtered.map((c) => {
          const isPending = (c.udhaar || 0) > 0;
          return (
            <div
              key={c.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{c.name}</h3>
                  <span className="text-[10px] text-slate-400">{c.phone}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>{c.bills || 0} Bills</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">{c.address || "Customer"}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                <div className={`text-sm font-black ${isPending ? "text-amber-700" : "text-emerald-600"}`}>
                  ₹ {c.udhaar || 0}
                </div>

                <div className="flex items-center gap-1.5">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleSendReminder(c)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Remind</span>
                      </button>

                      <button
                        onClick={() => {
                          setSettleModalCust(c);
                          setSettleAmount(String(c.udhaar || 0));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066FF] hover:bg-blue-100 text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Settle</span>
                      </button>
                    </>
                  )}
                  {!isPending && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      No Dues
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settle Modal */}
      {settleModalCust && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Receive Udhaar Payment</h2>
              <button
                onClick={() => setSettleModalCust(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-left">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-bold text-amber-900">{settleModalCust.name}</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Total Outstanding Balance: <strong>₹{settleModalCust.udhaar}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-[#0066FF]"
                />
              </div>

              <button
                onClick={handleConfirmSettlement}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Record Payment (Soundbox Alert)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dock Nav */}
      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
