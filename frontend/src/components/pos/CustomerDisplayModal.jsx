import React, { useState } from "react";
import { QrCode, Smartphone, CheckCircle, ExternalLink, X, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CustomerDisplayModal({
  isOpen,
  onClose,
  cart = [],
  totals = { subtotal: 0, discount: 0, grandTotal: 0 },
  storeName = "Dukaan Superstore",
  upiId = "merchant@upi",
  isPaid = false,
  onSendWhatsappSlip
}) {
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);

  if (!isOpen) return null;

  const encodedStore = encodeURIComponent(storeName);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedStore}&am=${totals.grandTotal}&cu=INR&tn=Bill%20Payment`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}`;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 10) return;
    if (onSendWhatsappSlip) {
      onSendWhatsappSlip(customerPhone);
    }
    setPhoneSent(true);
    setTimeout(() => setPhoneSent(false), 4000);
  };

  const handlePopOut = () => {
    // Open in separate customer monitor window
    window.open(
      "/app/counter",
      "DukaanCustomerDisplay",
      "width=1024,height=768,menubar=no,toolbar=no,location=no"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{storeName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Customer Display Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live Counter Terminal & Instant UPI Scanner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePopOut}
              title="Pop out to secondary monitor"
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl inline-flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> 2nd Screen
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paid Banner */}
        {isPaid && (
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
            <CheckCircle className="w-7 h-7 animate-bounce" />
            <div>
              <div className="font-bold text-base">Payment of ₹{totals.grandTotal} Successfully Verified!</div>
              <div className="text-xs text-emerald-100">Thank you for visiting {storeName}. Have a wonderful day!</div>
            </div>
          </div>
        )}

        {/* Content Body: Split Left (Cart) & Right (QR Code + WhatsApp) */}
        <div className="grid md:grid-cols-12 gap-0 flex-1 overflow-hidden">
          {/* Left: Live Cart (7 cols) */}
          <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Items ({cart.reduce((a, b) => a + (b.quantity || 1), 0)})
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Sub-second live sync
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Waiting for items to be scanned at the counter...
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Store Discount</span>
                  <span className="font-mono font-semibold">-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Total Amount Due</span>
                <span className="font-mono text-xl text-blue-600 dark:text-blue-400">
                  ₹{totals.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Dynamic UPI QR & WhatsApp Slip (5 cols) */}
          <div className="md:col-span-5 p-6 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                Scan with any UPI App
              </span>

              {totals.grandTotal > 0 ? (
                <div className="inline-block p-3 rounded-3xl bg-white shadow-xl border-2 border-blue-500/20">
                  <img
                    src={qrApiUrl}
                    alt="Scan UPI QR"
                    className="w-48 h-48 mx-auto rounded-xl"
                  />
                  <div className="mt-2 text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Merchant QR</span>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center text-slate-400 text-xs">
                  Awaiting items...
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-3">
                {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                  <span
                    key={app}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* WhatsApp receipt input */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Get WhatsApp Digital Receipt
                </span>
              </div>
              <form onSubmit={handlePhoneSubmit} className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile #"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={customerPhone.length < 10}
                  className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl transition shadow-xs"
                >
                  Send
                </button>
              </form>
              {phoneSent && (
                <span className="text-[11px] text-emerald-600 font-semibold mt-1.5 block">
                  ✓ Receipt queued for dispatch to +91 {customerPhone}!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
