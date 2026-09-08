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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DukaanProShowcase() {
  const [activeTemplate, setActiveTemplate] = useState("thermal_compact");

  return (
    <section className="relative z-10 py-24 bg-gradient-to-br from-slate-950 via-[#13112E] to-slate-950 text-white overflow-hidden" id="dukaan-pro">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>The Enterprise Tier</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400">Dukaan Pro</span>.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
            Engineered for high-volume retail stores. Custom multi-format invoices, cashier margin masking, master PIN security, and drawer cash shift reconciliation.
          </p>
        </div>

        {/* 2-Column Grid: Left (Invoice Switcher Interactive Preview) & Right (Pro Highlights) */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Interactive Receipt Engine Preview (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-slate-800 p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Live Receipt Designer Preview
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                PRO STUDIO ENGINE
              </span>
            </div>

            {/* Template Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
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
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Simulated Receipt Preview Box */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 min-h-[320px] flex flex-col justify-between shadow-inner">
              
              {activeTemplate === "thermal_compact" && (
                <div className="space-y-2 text-center">
                  <div className="font-bold text-white text-sm">KRISHNA SUPER STORE</div>
                  <div className="text-[10px] text-slate-400">Station Road, Anand · Ph: 9825100000</div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="text-[11px] text-amber-300 font-bold">58mm Compact Thermal Slip</div>
                  <div className="text-[10px] text-slate-400">Bill #OD-1048 · 08-Sep-2026</div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="text-left space-y-1 text-[11px]">
                    <div className="flex justify-between"><span>Amul Milk 500ml x2</span><span>₹64.00</span></div>
                    <div className="flex justify-between"><span>Tata Tea Gold 250g x1</span><span>₹140.00</span></div>
                    <div className="flex justify-between"><span>Parle Hide & Seek x2</span><span>₹60.00</span></div>
                  </div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="flex justify-between font-bold text-white text-sm">
                    <span>GRAND TOTAL:</span>
                    <span>₹264.00</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 pt-2">Paid via UPI · Visit Again! 🙏</div>
                </div>
              )}

              {activeTemplate === "thermal_standard" && (
                <div className="space-y-2 text-center">
                  <div className="font-bold text-white text-base">PATEL MEGA MART (80mm)</div>
                  <div className="text-[10px] text-slate-400">GSTIN: 24AAACP1234F1Z0 · Ph: 9876543210</div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Cashier: Rahul (Counter 01)</span>
                    <span>Time: 06:45 PM</span>
                  </div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-1">Item</th>
                        <th className="pb-1 text-center">Qty</th>
                        <th className="pb-1 text-right">Price</th>
                        <th className="pb-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr><td className="py-1">Basmati Rice 5kg</td><td className="text-center">1</td><td className="text-right">₹480</td><td className="text-right">₹480</td></tr>
                      <tr><td className="py-1">Fortune Oil 1L</td><td className="text-center">2</td><td className="text-right">₹145</td><td className="text-right">₹290</td></tr>
                    </tbody>
                  </table>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="flex justify-between font-bold text-white text-sm">
                    <span>NET AMOUNT DUE:</span>
                    <span>₹770.00</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">Scan Counter QR for Instant Digital Copy</div>
                </div>
              )}

              {activeTemplate === "gst_tax" && (
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <div>
                      <div className="font-bold text-white text-sm">SHREEJI HARDWARE & PAINTS</div>
                      <div className="text-[10px] text-slate-400">GSTIN: 24AABCS9999K1Z5</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                      TAX INVOICE
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-1 py-1">
                    <div>Buyer: Ramesh Enterprises</div>
                    <div>Invoice No: INV-2026-904</div>
                  </div>
                  <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Asian Paints Apex 20L (HSN: 3209)</span>
                      <span>₹4,200.00</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>CGST 9% + SGST 9% (₹756)</span>
                      <span>Included</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                    <span>TOTAL PAYABLE:</span>
                    <span>₹4,200.00</span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">Terms: Payment due within 7 days. Authorized Signatory.</div>
                </div>
              )}

              {activeTemplate === "whatsapp" && (
                <div className="space-y-2 text-left bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp Digital Memo
                  </div>
                  <div className="text-[11px] text-slate-200 leading-relaxed font-sans pt-1">
                    🧾 <strong>Krishna Super Store</strong> — Digital Memo<br />
                    Bill #OD-1048 · Date: 08-Sep-2026<br />
                    ------------------------------<br />
                    • Amul Milk 500ml x2 = ₹64<br />
                    • Tata Tea Gold 250g x1 = ₹140<br />
                    • Parle Hide & Seek x2 = ₹60<br />
                    ------------------------------<br />
                    <strong>Grand Total: ₹264.00 (PAID)</strong><br />
                    Paid via UPI · Thank you for shopping! 🙏
                  </div>
                </div>
              )}

              <div className="text-center pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                100% Configurable in Dukaan Pro Studio (Logo, Tagline, QR & Footer)
              </div>
            </div>
          </div>

          {/* Right Column: Key Pro Superpowers (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-4">
              
              {/* Feature 1: Cashier Mode & Master PIN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/40 transition-colors flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <span>Cashier Mode & Security PIN</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">NEW</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Protect wholesale purchase prices and margin data from counter staff. Block order or product deletions without the 4-digit Master Owner PIN.
                  </p>
                </div>
              </div>

              {/* Feature 2: Shift Handover & Drawer Cash (F9) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/40 transition-colors flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <span>Shift Handover & Drawer Reconciliation</span>
                    <span className="text-[10px] font-mono bg-purple-400/20 text-purple-300 font-bold px-1.5 py-0.5 rounded">F9</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Automatically calculate expected cash vs physical drawer cash. Detect cash shortages/surplus, print handover slips, and WhatsApp daily shift summaries.
                  </p>
                </div>
              </div>

              {/* Feature 3: Soundbox UPI Alerts */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/40 transition-colors flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <span>Real-time Soundbox Audio</span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">Built-in</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    No extra ₹150/month speaker hardware needed! Dukaan announces UPI payments aloud through your computer or counter speaker in Hindi, Gujarati, or English.
                  </p>
                </div>
              </div>

            </div>

            {/* Pro CTA Card */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/subscribe?plan=pro"
                className="w-full sm:w-auto px-7 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Upgrade to Dukaan Pro (₹499/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                🎁 1+1 Month Free & Zero Setup Fee
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
