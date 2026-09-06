import React, { useState } from "react";
import { ArrowLeft, Search, Plus, MessageSquare, Check, AlertCircle, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import { playVoiceSoundbox } from "@/lib/soundbox";

const initialUdhaarRecords = [
  { id: 1, customer: "Manish Bhai Cloth", phone: "9712398451", amount: 1200, date: "02 Sep", status: "pending", items: "Atta 5kg, Oil 1L" },
  { id: 2, customer: "Kishore Bhai Dairy", phone: "9909988112", amount: 650, date: "03 Sep", status: "pending", items: "Amul Butter, Biscuits" },
  { id: 3, customer: "Ramesh Sharma", phone: "9825123456", amount: 450, date: "04 Sep", status: "pending", items: "Tata Salt, Maggie" },
  { id: 4, customer: "Suresh Chauhan", phone: "9879055443", amount: 220, date: "05 Sep", status: "pending", items: "Bread, Eggs" },
  { id: 5, customer: "Amit Kumar Patel", phone: "9898011223", amount: 800, date: "28 Aug", status: "cleared", items: "Groceries" },
  { id: 6, customer: "Pooja Ben Joshi", phone: "9426788912", amount: 1500, date: "20 Aug", status: "cleared", items: "Monthly Ration" },
];

export default function MobileUdhaar({ onBack, onTabChange }) {
  const [tab, setTab] = useState("all");
  const [records, setRecords] = useState(initialUdhaarRecords);
  const [search, setSearch] = useState("");
  const [settleModalRecord, setSettleModalRecord] = useState(null);

  const pendingTotal = records
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const clearedTotal = records
    .filter((r) => r.status === "cleared")
    .reduce((sum, r) => sum + r.amount, 0);

  const filtered = records.filter((r) => {
    if (tab === "pending") return r.status === "pending";
    if (tab === "cleared") return r.status === "cleared";
    return true;
  }).filter((r) => r.customer.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search));

  const handleSendReminder = (r) => {
    const text = encodeURIComponent(
      `🙏 *Namaste ${r.customer} ji*\n\n` +
      `This is a gentle payment reminder from *ABC General Store*.\n` +
      `Your outstanding udhaar balance is *₹${r.amount}* for ${r.items}.\n\n` +
      `Kindly pay via UPI or at the shop counter.\n` +
      `Thank you for your continued support!`
    );
    window.open(`https://wa.me/91${r.phone}?text=${text}`, "_blank");
    toast.success(`WhatsApp reminder opened for ${r.customer}`);
  };

  const handleConfirmSettlement = () => {
    if (!settleModalRecord) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === settleModalRecord.id ? { ...r, status: "cleared" } : r))
    );
    try {
      playVoiceSoundbox(settleModalRecord.amount, "cash", "en");
    } catch {}
    toast.success(`Payment of ₹${settleModalRecord.amount} settled for ${settleModalRecord.customer}!`);
    setSettleModalRecord(null);
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
              <span>Settled</span>
            </div>
            <div className="text-lg font-black text-emerald-900 mt-1">₹ {clearedTotal}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer udhaar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 mt-2">
          {["all", "pending", "cleared"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-xs font-black capitalize transition-colors cursor-pointer ${
                tab === t ? "bg-[#0066FF] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Ledger list */}
      <div className="p-4 space-y-2.5">
        {filtered.map((r) => {
          const isPending = r.status === "pending";
          return (
            <div
              key={r.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{r.customer}</span>
                  <span className={`text-xs font-black ${isPending ? "text-amber-700" : "text-emerald-600"}`}>
                    ₹ {r.amount}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{r.items}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>Due date: {r.date}</span>
                  <span className="text-slate-300">·</span>
                  <span>+91 {r.phone}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 items-end shrink-0">
                {isPending ? (
                  <>
                    <button
                      onClick={() => handleSendReminder(r)}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Remind
                    </button>
                    <button
                      onClick={() => setSettleModalRecord(r)}
                      className="px-2.5 py-1 bg-blue-50 text-[#0066FF] hover:bg-blue-100 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Receive
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Cleared
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settle Payment Modal */}
      {settleModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 select-none animate-in slide-in-from-bottom duration-200 space-y-3">
            <h4 className="text-sm font-black text-slate-900">Settle Khata Payment</h4>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-black text-slate-900">{settleModalRecord.customer}</div>
              <div className="text-sm font-black text-[#0066FF] mt-1">₹ {settleModalRecord.amount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{settleModalRecord.items}</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setSettleModalRecord(null)}
                className="py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettlement}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
