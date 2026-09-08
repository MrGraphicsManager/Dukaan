import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sliders, 
  Crown, 
  Printer, 
  Receipt, 
  QrCode, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Share2, 
  Palette, 
  Volume2, 
  FlaskConical, 
  CheckCircle2, 
  Lock,
  Store,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Card3D from "@/components/Card3D";

export default function ProStudioPage() {
  const [template, setTemplate] = useState("thermal_compact");
  const [shopName, setShopName] = useState("Shree Balaji Kirana");
  const [shopPhone, setShopPhone] = useState("+91 98765 43210");
  const [footerNote, setFooterNote] = useState("Thank you for shopping with us! No return without bill.");
  const [showQr, setShowQr] = useState(true);
  const [showCashier, setShowCashier] = useState(true);

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

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Dukaan Pro Studio</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/pro-plan"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              <Crown className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Explore</span>
              <span>Pro Plan</span>
            </Link>

            <Link 
              to="/subscribe?plan=pro"
              className="px-5 sm:px-6 h-10 sm:h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>Unlock Studio (₹499/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================
          HERO SECTION: DUKAAN PRO STUDIO
      ========================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24 border-b border-slate-200 bg-gradient-to-b from-blue-50/40 via-white to-white">
        
        {/* Soft Ambient Radial Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Eyebrow badge with "Only for Pro Plan" handwritten note */}
          <div className="relative inline-block mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>The Creative Customization Engine</span>
            </div>

            {/* Handwritten callout */}
            <div className="absolute -top-7 -right-24 sm:-right-28 hidden xs:flex items-center gap-1 pointer-events-none">
              <span className="font-['Caveat',cursive] text-xl font-bold text-blue-600 -rotate-6 whitespace-nowrap">
                Only for Pro Plan
              </span>
              <svg className="w-6 h-6 text-blue-600 -rotate-12 translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4c4 8 12 10 14 12" />
                <path d="M14 16l4 0l-1-4" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl tracking-[-0.03em] leading-[1.05] text-slate-950 max-w-4xl mx-auto">
            Customize. Configure. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
              Make It Yours.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Every shop in India is unique. <strong>Dukaan Pro Studio</strong> gives you complete control over your thermal receipts, shop logos, UPI QR code placement, warranty policies, and counter color themes.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#sandbox"
              className="w-full sm:w-auto h-14 px-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5"
            >
              <Printer className="w-5 h-5 text-cyan-200" />
              <span>Try Live Receipt Studio Demo ↓</span>
            </a>

            <Link 
              to="/subscribe?plan=pro"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-600 text-slate-800 hover:text-blue-600 font-bold text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5 text-blue-600" />
              <span>Unlock with Pro Plan (₹499) →</span>
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================
          INTERACTIVE RECEIPT STUDIO SANDBOX
      ========================================================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6" id="sandbox">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Receipt Studio Sandbox</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Design Your Custom Store Receipt
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Type your shop name or change settings below to see the thermal receipt adapt in real time!
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" />
              <span>Receipt Settings</span>
            </h3>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Receipt Template Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "thermal_compact", label: "58mm Roll" },
                  { id: "thermal_standard", label: "80mm POS" },
                  { id: "gst_tax", label: "GST Tax" },
                  { id: "whatsapp", label: "WhatsApp" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      template === t.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Shop / Store Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Contact / Helpline</label>
              <input
                type="text"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Custom Terms Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Footer Warranty / Terms Note</label>
              <textarea
                rows={2}
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" /> Print UPI QR Code on Bill
                </span>
                <input 
                  type="checkbox" 
                  checked={showQr} 
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" /> Print Cashier Name on Bill
                </span>
                <input 
                  type="checkbox" 
                  checked={showCashier} 
                  onChange={(e) => setShowCashier(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>

          </div>

          {/* Real-time Receipt Preview Paper (7 cols) */}
          <div className="lg:col-span-7">
            <Card3D depth={14} glow={true} className="w-full">
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-xl">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Live Studio Morphing Output
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {template.toUpperCase()}
                  </span>
                </div>

                {/* Thermal Bill Container */}
                <div className="bg-[#FAF8F5] rounded-2xl p-6 border-2 border-dashed border-slate-300 font-mono text-xs text-slate-800 min-h-[380px] shadow-inner relative flex flex-col justify-between">
                  
                  <div>
                    {/* Header */}
                    <div className="text-center pb-2.5 border-b border-dashed border-slate-400">
                      <div className="font-black text-base uppercase tracking-wide text-slate-950">
                        {shopName || "YOUR DUKAAN NAME"}
                      </div>
                      <div className="text-[11px] text-slate-600">Ph: {shopPhone}</div>
                      <div className="text-[10px] text-slate-500">GSTIN: 24AAACS1429B1Z8</div>
                    </div>

                    {/* Meta info */}
                    <div className="flex justify-between text-[11px] text-slate-600 py-1.5 border-b border-dashed border-slate-300">
                      <span>Inv: #INV-2041</span>
                      <span>08-Sep-2026 19:45</span>
                    </div>
                    {showCashier && (
                      <div className="flex justify-between text-[10px] text-slate-500 pb-1.5 border-b border-dashed border-slate-300">
                        <span>Cashier: Rahul (Register 1)</span>
                        <span>Mode: UPI</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-400 text-xs">
                      <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-1">
                        <span>ITEM</span>
                        <span>QTY</span>
                        <span>PRICE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amul Pure Ghee 1L</span>
                        <span>1</span>
                        <span>₹580.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tata Salt Lite 1kg</span>
                        <span>2</span>
                        <span>₹56.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fortune Sunlite 1L</span>
                        <span>1</span>
                        <span>₹145.00</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between font-black text-base pt-2 text-slate-950">
                      <span>GRAND TOTAL:</span>
                      <span className="text-blue-700">₹781.00</span>
                    </div>

                    {/* UPI QR Code Preview */}
                    {showQr && (
                      <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-slate-800" />
                        </div>
                        <div className="text-left text-[10px] text-slate-600">
                          <strong className="block text-xs text-slate-900">Scan & Pay via any UPI App</strong>
                          <span>GPay, PhonePe, Paytm, BHIM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Note */}
                  <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-600 font-medium">
                    {footerNote}
                  </div>

                </div>

              </div>
            </Card3D>
          </div>

        </div>
      </section>

      {/* =========================================================
          STUDIO CAPABILITIES PILLARS
      ========================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              What You Can Build with Dukaan Pro Studio
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Powerful tools designed to turn your billing counter into a professional retail experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Printer,
                title: "Thermal Receipt Architect",
                desc: "58mm and 80mm roll support. Customize shop logo, GST numbers, HSN breakdown, and custom warranty terms."
              },
              {
                icon: QrCode,
                title: "Dynamic UPI QR Engine",
                desc: "Generate and print dynamic or static UPI QR codes right onto every paper bill for lightning fast cashier settlement."
              },
              {
                icon: Volume2,
                title: "Voice Soundbox Studio",
                desc: "Choose Indian language voices (Hindi, Gujarati, Marathi, Tamil, English), speech velocity, and volume levels."
              },
              {
                icon: Palette,
                title: "Counter Theme & Contrast",
                desc: "Custom color accents (Royal Blue, Emerald, Terracotta, Saffron) with High-Contrast outdoor Kirana sunlight modes."
              },
              {
                icon: Share2,
                title: "WhatsApp Digital Cash Memo",
                desc: "Instant 1-tap WhatsApp PDF and text cash receipts sent directly to your customers' WhatsApp numbers."
              },
              {
                icon: FlaskConical,
                title: "Early Access Labs",
                desc: "Test experimental next-generation Kirana billing tools, AI velocity forecasts, and multi-counter features before anyone else."
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1.5">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW TO ACCESS PRO STUDIO
      ========================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-[36px] bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-900 p-8 sm:p-12 text-white shadow-2xl">
          <Crown className="w-12 h-12 text-amber-300 mx-auto mb-4" />
          <h2 className="font-sans font-black text-3xl sm:text-4xl tracking-tight">
            How Do I Access Dukaan Pro Studio?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Dukaan Pro Studio is included <strong>100% free with the Dukaan Pro Plan (₹499/mo)</strong>. 
            Once subscribed, you can launch Studio inside your app under <strong>Settings → Dukaan Pro Studio</strong> anytime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/subscribe?plan=pro"
              className="h-13 px-8 rounded-full bg-white text-blue-800 hover:bg-cyan-50 font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Unlock Dukaan Pro Studio (₹499/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pro-plan"
              className="h-13 px-7 rounded-full bg-blue-500/30 hover:bg-blue-500/50 border border-white/30 text-white font-bold text-sm transition-all"
            >
              <span>Read Full Pro Plan Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/logo.png" alt="Dukaan" className="h-8 object-contain" />
          <div className="h-5 w-px bg-slate-200" />
          <span className="font-bold text-slate-800 text-sm">Dukaan Pro Studio</span>
        </div>
        <p className="mb-4">Run Your Dukaan. Smarter. A Product by PEAN.</p>
        <div className="flex justify-center gap-6 text-slate-600 font-medium">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/pro-plan" className="hover:text-blue-600">Dukaan Pro Plan</Link>
          <Link to="/subscribe" className="hover:text-blue-600">Pricing</Link>
          <Link to="/careers" className="hover:text-blue-600">Careers</Link>
          <Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link>
        </div>
      </footer>

    </div>
  );
}
