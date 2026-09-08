import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Receipt, 
  Package, 
  Printer, 
  ArrowRight, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  Crown,
  Layers,
  ShoppingBag,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Card3D from "@/components/Card3D";

const DEMO_ITEMS = [
  { id: 1, name: "Amul Butter 100g", price: 65, emoji: "🧈", category: "Dairy" },
  { id: 2, name: "Aashirvaad Atta 5kg", price: 320, emoji: "🌾", category: "Grains" },
  { id: 3, name: "Maggi 2-Min Noodles", price: 14, emoji: "🍜", category: "Snacks" },
  { id: 4, name: "Tata Salt 1kg", price: 28, emoji: "🧂", category: "Pantry" },
  { id: 5, name: "Fortune Sunlite Oil 1L", price: 145, emoji: "🌻", category: "Oils" },
  { id: 6, name: "Parle-G Gold 150g", price: 10, emoji: "🍪", category: "Biscuits" }
];

export default function StarterPlanPage() {
  const nav = useNavigate();
  
  // Interactive POS Simulator State
  const [cart, setCart] = useState([
    { id: 1, name: "Amul Butter 100g", price: 65, qty: 1, emoji: "🧈" },
    { id: 3, name: "Maggi 2-Min Noodles", price: 14, qty: 2, emoji: "🍜" }
  ]);
  const [paymentMode, setPaymentMode] = useState("upi");
  const [isPrinted, setIsPrinted] = useState(false);

  const addToCart = (item) => {
    setIsPrinted(false);
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setIsPrinted(false);
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const next = i.qty + delta;
        return next > 0 ? { ...i, qty: next } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Dukaan" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="hidden sm:flex flex-col border-l border-slate-200 pl-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
                <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">PEAN</span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dukaan Starter Plan</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/business-plan"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              <span>Explore Business</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link 
              to="/subscribe?plan=starter"
              className="px-5 sm:px-6 h-10 sm:h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <span>Get Starter (₹79/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================
          HERO SECTION: DUKAAN STARTER PLAN
      ========================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24 border-b border-slate-200 bg-gradient-to-b from-emerald-50/40 via-white to-white">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-400/15 via-teal-400/10 to-sky-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest mb-6 shadow-2xs">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>The Essential Plan for New & Single-Counter Shops</span>
          </div>

          <h1 className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl tracking-[-0.03em] leading-[1.05] text-slate-950 max-w-4xl mx-auto">
            Say Goodbye to Pen & Paper. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
              Dukaan Starter Plan.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Perfect for single-counter Kirana stores, stationery shops, bakeries, and snack points. 
            Generate bills in under 2 seconds, organize your entire product catalog, and print clean thermal slips on any standard printer — for just <strong>₹79/month</strong>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/subscribe?plan=starter"
              className="w-full sm:w-auto h-14 px-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base active:scale-95 transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Start with Starter Plan — ₹79/month</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link 
              to="/business-plan"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-600 text-slate-800 hover:text-emerald-700 font-bold text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Need Udhaar & WhatsApp? Explore Business →</span>
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-2s Lightning POS Billing
            </span>
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited Products & Inventory
            </span>
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Works on Any Laptop or PC
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================
          INTERACTIVE LIVE POS CHECKOUT SIMULATOR
      ========================================================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Live Interactive Demo
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Experience Sub-2 Second Kirana Billing
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Tap items below to add them to your cart and experience how quickly your cash counter will operate.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Product Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Quick Pick Items</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Tap to add to bill
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {DEMO_ITEMS.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">₹{item.price} · {item.category}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>No lag, no wait:</strong> Dukaan POS is optimized to run smoothly even on older Windows 7/10/11 computers and budget laptops.
              </span>
            </div>
          </div>

          {/* Right: Live Cart & Bill Receipt (5 cols) */}
          <div className="lg:col-span-5">
            <Card3D depth={15} glow={true} className="w-full">
              <div className="rounded-3xl bg-white border-2 border-slate-300 p-6 shadow-xl">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-base text-slate-900">Current Counter Bill</h3>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Speed: 1.2s
                  </span>
                </div>

                {/* Items in Cart */}
                <div className="my-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                      Cart is empty. Tap items on the left to start billing!
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2">
                          <span>{item.emoji}</span>
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className="text-slate-500">₹{item.price} × {item.qty} = ₹{item.price * item.qty}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-900 w-4 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment Mode Selector */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Payment Mode</span>
                    <span className="text-slate-900 font-extrabold text-base">Total: ₹{totalAmount}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setPaymentMode("cash")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMode === "cash" 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      onClick={() => setPaymentMode("upi")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMode === "upi" 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      ⚡ UPI QR
                    </button>
                  </div>

                  <Button
                    onClick={() => setIsPrinted(true)}
                    disabled={cart.length === 0}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Thermal Bill (Instant)</span>
                  </Button>
                </div>

                {/* Printed Thermal Bill Simulation */}
                {isPrinted && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 font-mono text-[11px] text-slate-800 space-y-1 animate-in fade-in slide-in-from-top-2">
                    <div className="text-center font-bold text-slate-900 pb-1 border-b border-dashed border-amber-300">
                      *** DUKAAN KIRANA STORE ***
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Receipt: #0084</span>
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="border-b border-dashed border-amber-300 py-1 space-y-0.5">
                      {cart.map(i => (
                        <div key={i.id} className="flex justify-between">
                          <span>{i.name.slice(0, 16)} x{i.qty}</span>
                          <span>₹{i.price * i.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold pt-1 text-slate-950">
                      <span>TOTAL PAID ({paymentMode.toUpperCase()}):</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    <div className="text-center text-[10px] text-slate-500 pt-1">
                      Thank You! Visit Again.
                    </div>
                  </div>
                )}

              </div>
            </Card3D>
          </div>

        </div>
      </section>

      {/* =========================================================
          4 PILLARS OF DUKAAN STARTER PLAN
      ========================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Everything Included in the Starter Plan
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Engineered to make your transition to digital retail smooth, rapid, and painless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Sub-2s Fast POS Billing",
                desc: "Speed through busy evening rush hours. Auto-calculating cart, keyboard shortcuts (Space, Enter), and instant checkout."
              },
              {
                icon: Package,
                title: "Unlimited Products Catalog",
                desc: "Add 100 or 10,000 products with zero limits. Instant search by barcode, item name, or local Kirana nick-names."
              },
              {
                icon: Printer,
                title: "Thermal & Laser Printing",
                desc: "Plug-and-play support for all standard 58mm & 80mm USB, Bluetooth, or WiFi thermal receipt printers."
              },
              {
                icon: ShieldCheck,
                title: "Cloud Backup & Security",
                desc: "Never lose a bill or transaction. Your inventory and order history are securely backed up in the cloud automatically."
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          FULL 4-PLAN COMPARISON TABLE (STARTER HIGHLIGHTED)
      ========================================================= */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            Transparent Comparison
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            How Starter Compares to Other Plans
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Choose the tier that fits your store today. You can upgrade anytime with zero downtime.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-4 px-4 sm:px-6 font-bold text-slate-700">Feature</th>
                  <th className="py-4 px-3 sm:px-4 font-black text-emerald-700 bg-emerald-50/50">
                    Starter (₹79/mo)
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-slate-800">Business (₹119/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-slate-800">Premium (₹239/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-black text-blue-700">Dukaan Pro (₹499/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Fast POS Billing</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold bg-emerald-50/30">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Unlimited + Priority</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Products & Inventory</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold bg-emerald-50/30">Unlimited Catalog</td>
                  <td className="py-3.5 px-3 sm:px-4">Advanced + Barcode</td>
                  <td className="py-3.5 px-3 sm:px-4">Advanced + Barcode</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">AI Restock Velocity</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Khata & WhatsApp Reminders</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/30">Manual Ledger</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold">1-Click WhatsApp</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold">1-Click WhatsApp</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Auto Reminders</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Low Stock Automated Alerts</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/30">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Predictive Alerts</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Multi-Shop HQ Support</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/30">1 Counter</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-600">1 Shop</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">Up to 3 Shops</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Unlimited Shops</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Dukaan Pro Studio Access</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/30">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Full Studio Suite</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQS FOR STARTER MERCHANTS
      ========================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-3xl text-slate-900 tracking-tight">Starter Plan FAQs</h2>
          <p className="mt-2 text-slate-600 text-sm">Common questions answered for new shop owners.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="faq-1" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              Do I need an expensive POS machine or touchscreen?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              No. Dukaan Starter works on any standard computer, budget laptop, or tablet. You do not need to buy costly POS hardware.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              Can I upgrade to Business or Pro Plan later?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              Yes, absolutely! You can upgrade to Business (for Khata WhatsApp reminders) or Dukaan Pro (for Studio branding) at any time. All your products, stock, and bills remain 100% intact.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              Is there any limit on how many bills I can create?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              None at all. You can create unlimited bills every day without any hidden caps or surcharge.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* =========================================================
          HIGH-IMPACT UPGRADE BANNER
      ========================================================= */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-[40px] bg-gradient-to-b from-emerald-600 via-teal-700 to-slate-900 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-3xl bg-white/15 border border-white/30 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Zap className="w-9 h-9 fill-amber-300 text-amber-300" />
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-5xl tracking-tight text-white">
            Start Digital Billing Today.
          </h2>

          <p className="text-emerald-100 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed font-normal">
            Launch your store's digital checkout in minutes. 
            Enjoy seamless POS billing, unlimited products, and zero hardware lock-in for just ₹79/month.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/subscribe?plan=starter"
              className="w-full sm:w-auto h-14 px-9 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xl shadow-amber-400/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Starter Plan (₹79/mo)</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Link>

            <Link
              to="/business-plan"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Business Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
