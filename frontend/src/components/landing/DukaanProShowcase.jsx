import React, { useState } from "react";
import { 
  Sparkles, 
  Printer, 
  Receipt, 
  Lock, 
  Clock, 
  Volume2, 
  Share2, 
  Check, 
  ShieldCheck, 
  Sliders,
  ChevronRight,
  ArrowRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Card3D from "@/components/Card3D";

export default function DukaanProShowcase() {
  const [activeTemplate, setActiveTemplate] = useState("thermal_compact");

  return (
    <section className="relative z-10 py-24 bg-gradient-to-b from-white via-amber-50/25 to-white border-t border-brand-mitti overflow-hidden" id="dukaan-pro">
      
      {/* Background ambient light effects */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header (Light Theme) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>The Flagship Enterprise Tier</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-brand-indigo leading-tight">
            Meet <span className="text-brand-terracotta relative inline-block">
              Dukaan Pro
              <span className="absolute left-0 bottom-1.5 w-full h-2 bg-amber-300/40 rounded-full -z-10" />
            </span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-indigo/70 font-medium leading-relaxed">
            Engineered for high-volume retail stores. Multi-format custom invoices, cashier margin masking, Master Owner PIN security, and POS Shift Handover reconciliation.
          </p>
        </div>

        {/* 2-Column Grid: Left (3D Interactive Invoice Preview) & Right (Pro Features) */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 3D Interactive Receipt Studio (6 cols) */}
          <div className="lg:col-span-6">
            <Card3D depth={15} glow={true} className="w-full">
              <div className="bg-white rounded-3xl border-2 border-brand-mitti p-6 sm:p-7 shadow-2xl preserve-3d">
                
                <div className="flex items-center justify-between pb-4 border-b border-brand-mitti mb-5">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-brand-terracotta" />
                    <span className="text-xs font-black uppercase tracking-wider text-brand-indigo">
                      Live Receipt Studio Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    3D MORPHING ENGINE
                  </span>
                </div>

                {/* Template Selector Tabs (Light Mode) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-brand-sand/60 border border-brand-mitti mb-5">
                  {[
                    { id: "thermal_compact", label: "58mm Roll" },
                    { id: "thermal_standard", label: "80mm POS" },
                    { id: "gst_tax", label: "GST Tax" },
                    { id: "whatsapp", label: "WhatsApp" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTemplate(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                        activeTemplate === t.id
                          ? "bg-white text-brand-indigo shadow-sm border border-brand-mitti"
                          : "text-brand-indigo/60 hover:text-brand-indigo hover:bg-white/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Realistic Light Theme Thermal / Cash Memo Paper Box */}
                <div className="bg-[#FAF8F5] rounded-2xl p-6 border-2 border-dashed border-brand-mitti font-mono text-xs text-brand-indigo min-h-[340px] flex flex-col justify-between shadow-inner relative overflow-hidden">
                  
                  {/* Watermark subtle logo */}
                  <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none text-4xl font-display font-black text-brand-indigo">
                    DUKAAN
                  </div>

                  {activeTemplate === "thermal_compact" && (
                    <div className="space-y-2 text-center animate-in fade-in zoom-in-95 duration-200">
                      <div className="font-bold text-brand-indigo text-sm uppercase">KRISHNA SUPER STORE</div>
                      <div className="text-[10px] text-brand-indigo/60">Station Road, Anand · Ph: 9825100000</div>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <div className="text-[11px] text-brand-terracotta font-bold uppercase">58mm Compact Thermal Slip</div>
                      <div className="text-[10px] text-brand-indigo/60">Bill #OD-1048 · 08-Sep-2026 · Cashier: Rahul</div>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <div className="text-left space-y-1.5 text-[11px]">
                        <div className="flex justify-between"><span>Amul Milk 500ml x2</span><span className="font-bold">₹64.00</span></div>
                        <div className="flex justify-between"><span>Tata Tea Gold 250g x1</span><span className="font-bold">₹140.00</span></div>
                        <div className="flex justify-between"><span>Parle Hide & Seek x2</span><span className="font-bold">₹60.00</span></div>
                      </div>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <div className="flex justify-between font-bold text-brand-indigo text-base">
                        <span>GRAND TOTAL:</span>
                        <span className="font-display font-extrabold text-brand-terracotta">₹264.00</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold pt-1 flex items-center justify-center gap-1">
                        <span>✓ Paid via UPI QR · Thank You! 🙏</span>
                      </div>
                    </div>
                  )}

                  {activeTemplate === "thermal_standard" && (
                    <div className="space-y-2 text-center animate-in fade-in zoom-in-95 duration-200">
                      <div className="font-bold text-brand-indigo text-base">PATEL MEGA MART (80mm)</div>
                      <div className="text-[10px] text-brand-indigo/60">GSTIN: 24AAACP1234F1Z0 · Ph: 9876543210</div>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <div className="flex justify-between text-[10px] text-brand-indigo/60 font-semibold">
                        <span>Cashier: Rahul (Counter 01)</span>
                        <span>Time: 06:45 PM</span>
                      </div>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-brand-indigo/60 border-b border-brand-mitti">
                            <th className="pb-1">Item Description</th>
                            <th className="pb-1 text-center">Qty</th>
                            <th className="pb-1 text-right">Price</th>
                            <th className="pb-1 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-mitti/50">
                          <tr><td className="py-1 font-medium">Basmati Rice 5kg</td><td className="text-center">1</td><td className="text-right">₹480</td><td className="text-right font-bold">₹480</td></tr>
                          <tr><td className="py-1 font-medium">Fortune Oil 1L</td><td className="text-center">2</td><td className="text-right">₹145</td><td className="text-right font-bold">₹290</td></tr>
                        </tbody>
                      </table>
                      <div className="border-t border-dashed border-brand-mitti my-2" />
                      <div className="flex justify-between font-bold text-brand-indigo text-base">
                        <span>NET AMOUNT DUE:</span>
                        <span className="font-display font-extrabold text-brand-terracotta">₹770.00</span>
                      </div>
                      <div className="text-[10px] text-brand-indigo/60 pt-1 font-sans">
                        Scan Counter QR code for instant digital copy on WhatsApp
                      </div>
                    </div>
                  )}

                  {activeTemplate === "gst_tax" && (
                    <div className="space-y-2 text-left animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-start border-b border-brand-mitti pb-2">
                        <div>
                          <div className="font-bold text-brand-indigo text-sm font-heading">SHREEJI HARDWARE & PAINTS</div>
                          <div className="text-[10px] text-brand-indigo/60">GSTIN: 24AABCS9999K1Z5 · State: Gujarat (24)</div>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-brand-sand text-brand-terracotta border border-brand-mitti px-2 py-0.5 rounded">
                          GST TAX INVOICE
                        </span>
                      </div>
                      <div className="text-[10px] text-brand-indigo/70 grid grid-cols-2 gap-1 py-1">
                        <div>Billed To: Ramesh Enterprises</div>
                        <div>Invoice: INV-2026-904</div>
                      </div>
                      <div className="border-t border-brand-mitti pt-2 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-brand-indigo font-medium">
                          <span>Asian Paints Apex 20L (HSN: 3209)</span>
                          <span className="font-bold">₹4,200.00</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-brand-indigo/50">
                          <span>CGST 9% (₹378) + SGST 9% (₹378)</span>
                          <span>Included in Rate</span>
                        </div>
                      </div>
                      <div className="border-t border-brand-mitti pt-2 flex justify-between font-bold text-brand-indigo text-base">
                        <span>TOTAL PAYABLE:</span>
                        <span className="font-display font-extrabold text-brand-terracotta">₹4,200.00</span>
                      </div>
                      <div className="text-[10px] text-brand-indigo/50 italic pt-1 font-sans">
                        Terms: Payment due within 7 days. Authorized Signatory Verified.
                      </div>
                    </div>
                  )}

                  {activeTemplate === "whatsapp" && (
                    <div className="space-y-2 text-left bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-emerald-700" /> WhatsApp Digital Memo
                      </div>
                      <div className="text-[11px] text-slate-800 leading-relaxed font-sans pt-1">
                        🧾 <strong>Krishna Super Store</strong> — Digital Cash Memo<br />
                        Bill #OD-1048 · Date: 08-Sep-2026<br />
                        ------------------------------<br />
                        • Amul Milk 500ml x2 = ₹64<br />
                        • Tata Tea Gold 250g x1 = ₹140<br />
                        • Parle Hide & Seek x2 = ₹60<br />
                        ------------------------------<br />
                        <strong>Grand Total: ₹264.00 (PAID)</strong><br />
                        Paid via UPI · Thank you for shopping with us! 🙏
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-3 border-t border-brand-mitti text-[10px] text-brand-indigo/50">
                    100% Configurable in Dukaan Pro Studio (Logo, Tagline, QR & Footer)
                  </div>
                </div>

              </div>
            </Card3D>
          </div>

          {/* Right Column: Key Pro Superpowers (Light Theme) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-4">
              
              {/* Feature 1: Cashier Mode & Master PIN */}
              <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti hover:border-amber-400/80 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-brand-indigo flex items-center gap-2">
                    <span>Cashier Mode & Master Security PIN</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">NEW</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-indigo/70 mt-1 leading-relaxed">
                    Protect wholesale purchase prices and margin data from counter staff. Block order or product deletions without the 4-digit Master Owner PIN.
                  </p>
                </div>
              </div>

              {/* Feature 2: Shift Handover & Drawer Cash (F9) */}
              <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti hover:border-purple-400/80 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-brand-indigo flex items-center gap-2">
                    <span>Shift Handover & Drawer Reconciliation</span>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded-full">F9 KEY</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-indigo/70 mt-1 leading-relaxed">
                    Automatically calculate expected cash vs physical drawer cash. Detect cash shortages/surplus, print thermal handover slips, and WhatsApp daily shift summaries to the owner.
                  </p>
                </div>
              </div>

              {/* Feature 3: Soundbox Audio Alerts */}
              <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti hover:border-emerald-400/80 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-brand-indigo flex items-center gap-2">
                    <span>Real-time Soundbox Voice Announcements</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">Zero Hardware Cost</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-indigo/70 mt-1 leading-relaxed">
                    No extra ₹150/month speaker device needed! Dukaan announces UPI payments aloud through your computer or counter speaker in Hindi, Gujarati, or English.
                  </p>
                </div>
              </div>

            </div>

            {/* Pro CTA Card (Light Mode) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/subscribe?plan=pro"
                className="w-full sm:w-auto px-8 h-12 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Upgrade to Dukaan Pro (₹499/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-amber-900 font-bold bg-amber-100 px-3.5 py-2 rounded-full border border-amber-300 shadow-2xs">
                🎁 1+1 Month Free & Zero Setup Fee
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
