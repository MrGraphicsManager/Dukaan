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
  FileText,
  Crown,
  QrCode,
  Store,
  CheckCircle2,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Card3D from "@/components/Card3D";
import { playVoiceSoundbox } from "@/lib/soundbox";

export default function DukaanProShowcase() {
  const [activeTemplate, setActiveTemplate] = useState("thermal_compact");
  const [activeSoundboxLang, setActiveSoundboxLang] = useState("hi");
  const [isPlayingSoundbox, setIsPlayingSoundbox] = useState(false);

  const handleTestSoundbox = (lang) => {
    setActiveSoundboxLang(lang);
    setIsPlayingSoundbox(true);
    playVoiceSoundbox(499, "upi", lang);
    setTimeout(() => setIsPlayingSoundbox(false), 2200);
  };

  return (
    <section className="relative z-10 py-20 sm:py-24 bg-gradient-to-b from-white via-blue-50/20 to-white border-t border-brand-mitti overflow-hidden" id="dukaan-pro">
      
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header (Inspired by Instagram Promo) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-widest mb-4 shadow-xs">
            <Crown className="w-3.5 h-3.5 text-blue-600" />
            <span>Now Available · Flagship Tier & Studio</span>
          </div>
          
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-indigo leading-tight">
            Take Your Business <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative inline-block">
              Further
              <span className="absolute left-0 bottom-1.5 w-full h-2.5 bg-blue-200/50 rounded-full -z-10" />
            </span>.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            <strong className="text-blue-700 font-bold block text-lg sm:text-xl mb-1">More Power. More Possibilities.</strong>
            Engineered for ambitious, high-volume retail stores. Unlock full store personalization with <strong>Dukaan Pro Studio</strong>, cashier margin protection, 58mm/80mm thermal branding, and built-in voice soundbox.
          </p>
        </div>

        {/* 2-Column Grid: Left (3D Interactive Pro Studio Invoice Preview) & Right (Pro Powers) */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 3D Interactive Receipt Studio (6 cols) */}
          <div className="lg:col-span-6">
            <Card3D depth={15} glow={true} className="w-full">
              <div className="bg-white rounded-3xl border-2 border-blue-100 p-6 sm:p-7 shadow-xl preserve-3d">
                
                <div className="flex items-center justify-between pb-4 border-b border-blue-100 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                        Dukaan Pro Studio Preview
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Live Custom Receipt Engine
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Pro Studio Exclusive
                  </span>
                </div>

                {/* Template Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
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
                          ? "bg-white text-blue-700 shadow-sm border border-blue-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Realistic Light Theme Thermal / Cash Memo Paper Box */}
                <div className="bg-[#FAF8F5] rounded-2xl p-6 border-2 border-dashed border-slate-300 font-mono text-xs text-slate-800 min-h-[350px] flex flex-col justify-between shadow-inner relative overflow-hidden">
                  
                  {/* Watermark subtle logo */}
                  <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none text-4xl font-display font-black text-blue-900">
                    DUKAAN PRO
                  </div>

                  {activeTemplate === "thermal_compact" && (
                    <div className="space-y-2 leading-tight">
                      <div className="text-center pb-2 border-b border-dashed border-slate-400">
                        <div className="font-extrabold text-sm uppercase tracking-wide">SHREE BALAJI KIRANA</div>
                        <div className="text-[10px] text-slate-500">Opp. Bus Stand, Station Road</div>
                        <div className="text-[10px] text-slate-500">Ph: +91 98765 43210</div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                        <span>Bill: #DK-2041</span>
                        <span>08/09/26 18:42</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Cashier: Rahul</span>
                        <span>Mode: UPI</span>
                      </div>
                      <div className="py-2 border-y border-dashed border-slate-400 my-2 space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>1. Amul Butter 100g x2</span>
                          <span>₹112.00</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>2. Tata Salt Lite 1kg x1</span>
                          <span>₹28.00</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>3. Fortune Sunlite 1L x1</span>
                          <span>₹145.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-extrabold text-sm pt-1">
                        <span>GRAND TOTAL:</span>
                        <span className="text-blue-700">₹285.00</span>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-400">
                        Payment Received via UPI · 58mm Roll
                      </div>
                    </div>
                  )}

                  {activeTemplate === "thermal_standard" && (
                    <div className="space-y-2 leading-tight">
                      <div className="text-center pb-2 border-b-2 border-slate-800">
                        <div className="font-black text-base uppercase tracking-wider">SUPERMART & PROVISIONS</div>
                        <div className="text-[11px] text-slate-600">Ring Road Circle, Ahmedabad - 380015</div>
                        <div className="text-[10px] text-slate-500">GSTIN: 24AAACS1429B1Z8 · POS Standard 80mm</div>
                      </div>
                      <div className="grid grid-cols-2 text-[11px] text-slate-600 py-1">
                        <div>Invoice: #INV-8842</div>
                        <div className="text-right">Shift: Morning F9</div>
                        <div>Date: 08-Sep-2026</div>
                        <div className="text-right">Pay: UPI / QR</div>
                      </div>
                      <div className="border-t border-b border-slate-400 py-1.5 text-[11px] space-y-1">
                        <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-0.5">
                          <span>ITEM</span>
                          <span>QTY</span>
                          <span>TOTAL</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aashirvaad Atta 5kg</span>
                          <span>1</span>
                          <span>₹245.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dettol Handwash 200ml</span>
                          <span>2</span>
                          <span>₹178.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Surf Excel Matic 1kg</span>
                          <span>1</span>
                          <span>₹199.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-black text-sm pt-1">
                        <span>NET PAYABLE:</span>
                        <span className="text-blue-700">₹622.00</span>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 pt-1">
                        Thank you for shopping with us! · Visit Again
                      </div>
                    </div>
                  )}

                  {activeTemplate === "gst_tax" && (
                    <div className="space-y-1.5 leading-tight">
                      <div className="text-center pb-1.5 border-b border-slate-800">
                        <div className="font-extrabold text-sm uppercase">TAX INVOICE (GST COMPLIANT)</div>
                        <div className="text-[11px] font-bold text-slate-900">ROYAL ENTERPRISES TRADING CO.</div>
                        <div className="text-[10px] text-slate-500">GSTIN: 07AAAAA0000A1Z5 · State: Delhi (07)</div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Bill No: TI/2026/0491</span>
                        <span>Date: 08-09-2026</span>
                      </div>
                      <div className="border-y border-slate-400 py-1 text-[10px] space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>DESCRIPTION (HSN)</span>
                          <span>TAXABLE</span>
                          <span>GST</span>
                          <span>TOTAL</span>
                        </div>
                        <div className="flex justify-between">
                          <span>LED Bulb 9W (8539)</span>
                          <span>₹100.00</span>
                          <span>18%</span>
                          <span>₹118.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Extension Board (8536)</span>
                          <span>₹300.00</span>
                          <span>18%</span>
                          <span>₹354.00</span>
                        </div>
                      </div>
                      <div className="text-[10px] space-y-0.5 text-slate-600 pt-1">
                        <div className="flex justify-between"><span>Taxable Amount:</span><span>₹400.00</span></div>
                        <div className="flex justify-between"><span>CGST (9%) + SGST (9%):</span><span>₹72.00</span></div>
                        <div className="flex justify-between font-bold text-slate-900 text-xs pt-1 border-t border-slate-300">
                          <span>INVOICE TOTAL:</span>
                          <span className="text-blue-700">₹472.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTemplate === "whatsapp" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                        <Share2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Instant 1-Tap WhatsApp Digital Cash Memo</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-800 leading-relaxed shadow-xs">
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
                      <div className="text-[10px] text-slate-500 text-center">
                        Customers receive automated PDF + text bill on their WhatsApp.
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-3 border-t border-slate-300 text-[10px] text-slate-500 font-medium">
                    100% Configurable in Dukaan Pro Studio (Logo, Tagline, UPI QR & Custom Terms)
                  </div>
                </div>

              </div>
            </Card3D>
          </div>

          {/* Right Column: Key Pro Superpowers (Light Theme) */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Feature 1: Cashier Mode & Master PIN */}
            <div className="p-5 rounded-3xl bg-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Cashier Mode & Master Security PIN</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 font-bold px-2 py-0.5 rounded-full">Pro Exclusive</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Protect wholesale purchase prices and margin data from counter staff. Prevent unauthorized order deletions or price modifications without the 4-digit Master Owner PIN.
                </p>
              </div>
            </div>

            {/* Feature 2: Shift Handover & Drawer Cash (F9) */}
            <div className="p-5 rounded-3xl bg-white border-2 border-blue-100 hover:border-purple-300 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Shift Handover & Drawer Cash (F9)</span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded-full">F9 KEY</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Reconcile computer cash vs physical cash in the drawer automatically. Detect shortages/surplus at shift end, print handover slips, and WhatsApp summaries to the owner.
                </p>
              </div>
            </div>

            {/* Feature 3: Interactive Virtual Soundbox Voice */}
            <div className="p-5 rounded-3xl bg-white border-2 border-blue-100 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                <Volume2 className="w-6 h-6" />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Virtual Soundbox Voice Audio</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">Zero Hardware Cost</span>
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  No ₹150/month external speaker device needed! Dukaan announces UPI payments aloud through your computer or laptop speaker in your preferred Indian language.
                </p>
                
                {/* Interactive Soundbox Test Buttons */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500">Test Live Voice:</span>
                  {[
                    { id: "hi", label: "Hindi (हिंदी)" },
                    { id: "gu", label: "Gujarati (ગુજરાતી)" },
                    { id: "en", label: "English" }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => handleTestSoundbox(l.id)}
                      disabled={isPlayingSoundbox}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        activeSoundboxLang === l.id && isPlayingSoundbox
                          ? "bg-emerald-600 text-white border-emerald-600 animate-pulse"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 4: AI Restock Velocity */}
            <div className="p-5 rounded-3xl bg-white border-2 border-blue-100 hover:border-amber-300 hover:shadow-md transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Restock Velocity Predictor</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">Smart AI</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Analyzes sales velocity to predict exact days until stockout for high-churn items (Milk, Butter, Oil) so your shelves are always stocked.
                </p>
              </div>
            </div>

            {/* Pro CTA Card */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/subscribe?plan=pro"
                className="w-full sm:w-auto px-8 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Crown className="w-4 h-4 text-white" />
                <span>Upgrade to Dukaan Pro (₹499/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-blue-900 font-bold bg-blue-50 px-4 py-2 rounded-full border border-blue-200 shadow-2xs">
                🎁 1+1 Month Free · Pro Studio Included
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
