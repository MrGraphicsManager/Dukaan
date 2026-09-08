import React, { useState } from "react";
import { 
  Receipt, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  QrCode, 
  Banknote, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Zap,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Card3D from "@/components/Card3D";

const DEMO_PRODUCTS = [
  { id: "p1", name: "Amul Butter 100g", price: 65, category: "Dairy", emoji: "🧈" },
  { id: "p2", name: "Aashirvaad Atta 5kg", price: 320, category: "Grains", emoji: "🌾" },
  { id: "p3", name: "Maggi 2-Min Noodles", price: 14, category: "Snacks", emoji: "🍜" },
  { id: "p4", name: "Tata Salt 1kg", price: 28, category: "Pantry", emoji: "🧂" },
  { id: "p5", name: "Parle-G Gold 150g", price: 10, category: "Biscuits", emoji: "🍪" },
  { id: "p6", name: "Fortune Oil 1L", price: 145, category: "Oils", emoji: "🌻" }
];

export default function LivePosDemoSimulator() {
  const [cart, setCart] = useState([
    { id: "p1", name: "Amul Butter 100g", price: 65, qty: 1 },
    { id: "p3", name: "Maggi 2-Min Noodles", price: 14, qty: 2 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [printedSlip, setPrintedSlip] = useState(false);
  const [billingSpeed, setBillingSpeed] = useState("1.2s");

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setPrintedSlip(false);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
    setPrintedSlip(false);
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    setPrintedSlip(false);
  };

  const clearCart = () => {
    setCart([]);
    setPrintedSlip(false);
  };

  const subtotal = cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
  const totalItems = cart.reduce((sum, it) => sum + it.qty, 0);

  const handleSimulatePrint = () => {
    if (cart.length === 0) return;
    const speeds = ["0.9s", "1.1s", "1.3s", "1.4s"];
    setBillingSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
    setPrintedSlip(true);
  };

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-brand-mitti" id="live-demo">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs mb-3">
          <Zap className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>Interactive 3D Sandbox</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo">
          Try The POS Counter Live
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-indigo/70 font-medium">
          Experience 3D counter physics, tap items, test payment modes, and watch Dukaan generate bills in under 2 seconds.
        </p>
      </div>

      {/* Simulator 3D Terminal Card */}
      <Card3D depth={10} glow={true} className="w-full">
        <div className="bg-white rounded-3xl border-2 border-brand-mitti shadow-xl overflow-hidden grid lg:grid-cols-12 preserve-3d">
        
        {/* Left: Product Catalog Grid (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-brand-mitti bg-brand-sand/30">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-terracotta" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-indigo">
                Fast Item Bar (Click to Add)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-brand-indigo/50 bg-white px-2 py-0.5 rounded-md border border-brand-mitti">
              Touch & Barcode Compatible
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEMO_PRODUCTS.map(p => {
              const inCart = cart.find(c => c.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between h-28 relative ${
                    inCart 
                      ? "border-brand-terracotta bg-white shadow-sm ring-2 ring-brand-terracotta/20" 
                      : "border-brand-mitti bg-white hover:border-brand-indigo/40 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-[10px] uppercase font-bold text-brand-indigo/50 bg-brand-sand px-1.5 py-0.5 rounded">
                      {p.category}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-brand-indigo line-clamp-1">{p.name}</div>
                    <div className="text-xs font-extrabold text-brand-terracotta font-mono mt-0.5">
                      ₹{p.price}
                    </div>
                  </div>

                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-terracotta text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {inCart.qty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Tip Box */}
          <div className="mt-5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Real counters use hardware barcode scanners — scanning any item takes <strong>0.2 seconds</strong> with zero manual clicks!
            </span>
          </div>
        </div>

        {/* Right: Active Bill Slip & Receipt Printer (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-brand-mitti">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-indigo" />
                <span className="text-xs font-black uppercase tracking-wider text-brand-indigo">
                  Active Bill Slip ({totalItems})
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Cart Line Items */}
            <div className="py-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-indigo/50">
                  Bill is empty. Click any product on the left to add!
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-brand-indigo">{item.name}</div>
                      <div className="text-[10px] text-brand-indigo/60 font-mono">₹{item.price} each</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-5 h-5 rounded-md bg-brand-sand hover:bg-brand-mitti text-brand-indigo flex items-center justify-center font-bold"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-5 h-5 rounded-md bg-brand-sand hover:bg-brand-mitti text-brand-indigo flex items-center justify-center font-bold"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <div className="w-12 text-right font-mono font-extrabold text-brand-indigo">
                        ₹{item.price * item.qty}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-brand-mitti">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-indigo/60 block mb-1.5">
                Select Payment Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "upi"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-brand-mitti text-brand-indigo/70 hover:bg-brand-sand"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>UPI QR Code</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "cash"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs"
                      : "border-brand-mitti text-brand-indigo/70 hover:bg-brand-sand"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash Drawer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Totals & Print Button */}
          <div className="pt-4 border-t-2 border-dashed border-brand-mitti mt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase font-extrabold text-brand-indigo/60">Grand Total:</span>
              <span className="font-display font-extrabold text-2xl text-brand-indigo">
                ₹{subtotal}
              </span>
            </div>

            <Button
              disabled={cart.length === 0}
              onClick={handleSimulatePrint}
              className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Simulate Print & Bill (F10)</span>
            </Button>
          </div>

          {/* Simulated Printed Thermal Slip Pop-up / Drawer (Pure Light Theme Thermal Paper) */}
          {printedSlip && (
            <div className="absolute inset-x-3 sm:inset-x-6 top-6 bottom-6 bg-[#FCFBF7] rounded-2xl p-5 text-slate-800 flex flex-col justify-between border-2 border-brand-indigo/30 shadow-2xl animate-in zoom-in-95 duration-200 z-20 font-mono">
              {/* Receipt Header */}
              <div className="text-center pb-2.5 border-b-2 border-dashed border-slate-300">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 mb-1.5 font-sans">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Bill Printed in {billingSpeed}
                </div>
                <div className="font-bold text-base tracking-wider text-brand-indigo uppercase">
                  APNI DUKAAN KIRANA
                </div>
                <div className="text-[10px] text-slate-500">Bill #OD-8842 · Paid via {paymentMethod.toUpperCase()} · 58mm POS</div>
              </div>

              {/* Thermal Receipt Lines */}
              <div className="my-auto py-3 text-xs space-y-1.5">
                {cart.map(it => (
                  <div key={it.id} className="flex justify-between text-slate-700 text-[11px]">
                    <span className="font-medium">{it.name} x{it.qty}</span>
                    <span className="font-bold">₹{it.price * it.qty}</span>
                  </div>
                ))}
                <div className="pt-2.5 border-t-2 border-dashed border-slate-300 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>NET TOTAL:</span>
                  <span className="text-brand-terracotta">₹{subtotal}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2 font-sans">
                <div className="text-center text-[10px] text-slate-500 font-mono">
                  *** Thank you! Visit Again ***
                </div>
                <button
                  onClick={() => setPrintedSlip(false)}
                  className="w-full py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>Close Receipt & Continue</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

        </div>

        </div>
      </Card3D>
    </section>
  );
}
