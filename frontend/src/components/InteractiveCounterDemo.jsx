import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  Barcode, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  Sparkles,
  Zap,
  ArrowRight,
  Smartphone
} from "lucide-react";

export default function InteractiveCounterDemo() {
  const [cart, setCart] = useState([
    { id: 1, name: "Aashirvaad Shudh Atta 5kg", price: 245, qty: 1 },
    { id: 2, name: "Maggi 2-Minute Noodles 70g", price: 14, qty: 2 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [cashTendered, setCashTendered] = useState("500");
  const [showReceipt, setShowReceipt] = useState(false);

  const addItem = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const triggerVirtualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      addItem({ id: 3, name: "Amul Butter Salted 100g", price: 56 });
      setIsScanning(false);
    }, 600);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const cashNum = parseFloat(cashTendered) || 0;
  const change = Math.max(0, cashNum - grandTotal);

  return (
    <section className="relative z-20 py-24 px-6 max-w-6xl mx-auto bg-[#07090e]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Interactive Test Drive
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Experience the POS. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Right Here in Your Browser.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Try adding products, trigger the virtual optical scanner, and generate an authentic thermal bill.
        </p>
      </div>

      {/* Interactive Simulator Shell */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Shelf & Barcode Trigger (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white font-display">Kirana Quick Catalog</h3>
              <p className="text-xs text-slate-400 mt-1">Tap any item to add to register</p>
            </div>

            {/* Virtual Scan Button */}
            <button
              onClick={triggerVirtualScan}
              disabled={isScanning}
              className="relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all overflow-hidden"
            >
              <Barcode className="w-4 h-4" />
              <span>{isScanning ? "Scanning..." : "Virtual Barcode Scan"}</span>
              {isScanning && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </button>
          </div>

          {/* Product Buttons Grid */}
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {[
              { id: 1, name: "Aashirvaad Shudh Atta 5kg", price: 245, category: "Groceries" },
              { id: 2, name: "Maggi 2-Minute Noodles 70g", price: 14, category: "Snacks" },
              { id: 3, name: "Amul Butter Salted 100g", price: 56, category: "Dairy" },
              { id: 4, name: "Tata Salt Vaccum 1kg", price: 26, category: "Groceries" },
              { id: 5, name: "Dettol Liquid 125ml", price: 88, category: "Personal Care" },
              { id: 6, name: "Parle-G Gold Biscuits 250g", price: 28, category: "Snacks" },
            ].map((p) => {
              const inCart = cart.find((i) => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    inCart
                      ? "bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="pr-2">
                    <div className="text-[10px] text-slate-400 font-semibold">{p.category}</div>
                    <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-sm font-black text-emerald-400 mt-1">₹{p.price}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-cyan-500 group-hover:text-black flex items-center justify-center text-slate-300 transition-colors">
                    {inCart ? (
                      <span className="font-bold text-xs">{inCart.qty}</span>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Denomination Pills */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              Payment Mode
            </div>
            <div className="flex gap-2">
              {[
                { id: "cash", label: "Cash (Chutta Calculator)" },
                { id: "upi", label: "Dynamic UPI QR" },
                { id: "udhaar", label: "Udhaar Khata" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentMode === m.id
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Counter Register & Thermal Bill (Span 5) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-black rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-display">Active Register</h3>
            </div>
            <button
              onClick={() => setCart([])}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Clear Cart
            </button>
          </div>

          {/* Cart Item Rows */}
          <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Cart is empty. Tap products on the left to test.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex-1 pr-2">
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">₹{item.price} each</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs font-bold text-white w-14 text-right">
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="text-white font-bold">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Discount:</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>Total Payable:</span>
              <span className="text-emerald-400">₹{grandTotal}</span>
            </div>

            {paymentMode === "cash" && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Change Return (Chutta):</span>
                <span className="text-sm font-black text-emerald-400">
                  ₹{change}
                </span>
              </div>
            )}
          </div>

          {/* Print / Checkout Button */}
          <button
            onClick={() => setShowReceipt(true)}
            disabled={cart.length === 0}
            className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale & Print Receipt</span>
          </button>
        </div>

      </div>

      {/* Realistic 3D Thermal Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xs bg-white text-slate-900 rounded-3xl p-6 shadow-2xl font-mono text-xs"
            >
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <div className="font-black text-base">DUKAAN POS</div>
                <div className="text-[10px] text-slate-500 mt-0.5">100% Offline Retail Counter</div>
                <div className="text-[9px] text-slate-400 mt-1">Bill #ORD-1082 · Cash Counter</div>
              </div>

              <div className="py-3 space-y-1.5 border-b-2 border-dashed border-slate-300 text-[11px]">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <span className="font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="py-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1">
                  <span>GRAND TOTAL:</span>
                  <span className="text-emerald-600">₹{grandTotal}</span>
                </div>
                {paymentMode === "cash" && (
                  <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                    <span>Cash Return:</span>
                    <span>₹{change}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t-2 border-dashed border-slate-300 text-[10px] text-slate-500">
                *** DHANYAWAAD! VISIT AGAIN ***
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full mt-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
              >
                Close & Next Customer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
