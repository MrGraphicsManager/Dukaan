import React, { useState, useEffect } from "react";
import { Banknote, QrCode, CreditCard, BookOpen, Check, X, Calculator, AlertCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function SplitPaymentModal({
  isOpen,
  onClose,
  grandTotal = 0,
  customers = [],
  selectedCustomer = null,
  onConfirmSplitPayment
}) {
  const { playAudioChime } = useTheme();
  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [khataAmount, setKhataAmount] = useState("");
  const [customerId, setCustomerId] = useState(selectedCustomer?.id || "");
  const [cashTendered, setCashTendered] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCashAmount("");
      setUpiAmount("");
      setCardAmount("");
      setKhataAmount("");
      setCashTendered("");
      setCustomerId(selectedCustomer?.id || "");
    }
  }, [isOpen, selectedCustomer]);

  if (!isOpen) return null;

  const total = Number(grandTotal) || 0;
  const numCash = Number(cashAmount) || 0;
  const numUpi = Number(upiAmount) || 0;
  const numCard = Number(cardAmount) || 0;
  const numKhata = Number(khataAmount) || 0;

  const totalAllocated = numCash + numUpi + numCard + numKhata;
  const remaining = Math.max(0, +(total - totalAllocated).toFixed(2));
  const isComplete = Math.abs(total - totalAllocated) < 0.01;
  const isOverAllocated = totalAllocated > total + 0.01;

  const changeDue = cashTendered && Number(cashTendered) > numCash ? Number(cashTendered) - numCash : 0;

  const handleFillRemaining = (method) => {
    const currentTotalWithoutMethod =
      (method === "cash" ? 0 : numCash) +
      (method === "upi" ? 0 : numUpi) +
      (method === "card" ? 0 : numCard) +
      (method === "khata" ? 0 : numKhata);

    const needed = Math.max(0, +(total - currentTotalWithoutMethod).toFixed(2));

    if (method === "cash") setCashAmount(needed ? String(needed) : "");
    if (method === "upi") setUpiAmount(needed ? String(needed) : "");
    if (method === "card") setCardAmount(needed ? String(needed) : "");
    if (method === "khata") setKhataAmount(needed ? String(needed) : "");

    playAudioChime("beep");
  };

  const handleConfirm = () => {
    if (!isComplete || isOverAllocated) return;
    if (numKhata > 0 && !customerId) {
      alert("Please select a customer for the Khata / Udhaar balance portion.");
      return;
    }

    playAudioChime("success");
    onConfirmSplitPayment({
      payment_mode: "SPLIT",
      split: {
        cash: numCash,
        upi: numUpi,
        card: numCard,
        khata: numKhata,
        change_due: changeDue,
        khata_customer_id: customerId || null
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Split Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Split total between Cash, UPI, Card and Udhaar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Total & Progress Banner */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Amount to Pay
            </span>
            <span className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
              ₹{total.toFixed(2)}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, (numCash / (total || 1)) * 100)}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Cash: ₹${numCash}`}
            />
            <div
              style={{ width: `${Math.min(100, (numUpi / (total || 1)) * 100)}%` }}
              className="bg-blue-500 transition-all duration-300"
              title={`UPI: ₹${numUpi}`}
            />
            <div
              style={{ width: `${Math.min(100, (numCard / (total || 1)) * 100)}%` }}
              className="bg-purple-500 transition-all duration-300"
              title={`Card: ₹${numCard}`}
            />
            <div
              style={{ width: `${Math.min(100, (numKhata / (total || 1)) * 100)}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`Khata: ₹${numKhata}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2 font-medium">
            <span className="text-slate-600 dark:text-slate-300">
              Allocated: <strong className="font-mono">₹{totalAllocated.toFixed(2)}</strong>
            </span>
            {isOverAllocated ? (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Over by ₹{(totalAllocated - total).toFixed(2)}
              </span>
            ) : isComplete ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Balanced
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Remaining: ₹{remaining.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Input Methods */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Cash */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Cash</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillRemaining("cash")}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fill Remaining
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {numCash > 0 && (
                <input
                  type="number"
                  placeholder="Tendered"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  title="Cash Given by Customer"
                  className="w-28 px-3 py-1.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              )}
            </div>
            {changeDue > 0 && (
              <div className="text-xs text-emerald-600 font-bold">
                Return Change to Customer: ₹{changeDue.toFixed(2)}
              </div>
            )}
          </div>

          {/* 2. UPI */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">UPI / QR</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillRemaining("upi")}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fill Remaining
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={upiAmount}
                onChange={(e) => setUpiAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 3. Card */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Card / POS Machine</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillRemaining("card")}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fill Remaining
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* 4. Khata / Udhaar */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Khata / Udhaar</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillRemaining("khata")}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fill Remaining
              </button>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={khataAmount}
                  onChange={(e) => setKhataAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {numKhata > 0 && (
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Khata Customer (Required)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || "No phone"}) · Balance: ₹{c.balance || 0}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            disabled={!isComplete || isOverAllocated}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Check className="w-4 h-4" /> Complete ₹{total.toFixed(2)} Split Payment
          </button>
        </div>
      </div>
    </div>
  );
}
