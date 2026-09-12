import React, { useState } from "react";
import { 
  Rocket, 
  Sparkles, 
  Mic, 
  Zap, 
  Monitor, 
  Store, 
  Split, 
  Warehouse, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    icon: Mic,
    color: "from-blue-600 to-indigo-600",
    badge: "AI Voice",
    title: "Voice-to-Cart Billing",
    desc: "Speak naturally in Hindi, Hinglish, Gujarati, or English ('2 kilo Atta, 3 packet Maggi') and watch your counter cart populate in milliseconds."
  },
  {
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    badge: "<0.3s Latency",
    title: "Hyper-Speed Engine 3.0",
    desc: "Rapid barcode scanning buffer without keyboard focus loss, multi-cart hold & resume (F4), and sub-second receipt dispatch."
  },
  {
    icon: Monitor,
    color: "from-emerald-500 to-teal-600",
    badge: "Dual Screen",
    title: "Customer-Facing Display",
    desc: "Pop out a second counter screen facing customers with live cart updates, instant dynamic UPI QR, and self-serve digital WhatsApp receipt entry."
  },
  {
    icon: Store,
    color: "from-purple-600 to-pink-600",
    badge: "Omnichannel",
    title: "1-Click WhatsApp Storefront",
    desc: "Your physical store goes live at officialdukaan.in/store. Neighbourhood shoppers browse live catalog, choose Delivery/Pickup, and order on WhatsApp."
  },
  {
    icon: Split,
    color: "from-cyan-500 to-blue-600",
    badge: "Split Pay",
    title: "Smart Split Payments",
    desc: "Effortlessly accept ₹200 Cash + ₹300 UPI + ₹150 Khata in a single checkout with automatic ledger reconciliation and return change calculator."
  },
  {
    icon: Warehouse,
    color: "from-rose-500 to-red-600",
    badge: "Predictive AI",
    title: "AI Inventory & Smart Khata",
    desc: "Sales velocity predictor alerts you 3 days before Atta or Oil finishes, with 1-click supplier purchase orders and 1-tap WhatsApp UPI collection links."
  }
];

export default function Dukaan3Showcase() {
  const [phone, setPhone] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoinBeta = (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    try {
      const waitlist = JSON.parse(localStorage.getItem("dukaan_3_waitlist") || "[]");
      waitlist.push({ phone, date: new Date().toISOString() });
      localStorage.setItem("dukaan_3_waitlist", JSON.stringify(waitlist));
    } catch {}
    setJoined(true);
  };

  return (
    <section id="dukaan-3" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-600/5 via-indigo-600/10 to-purple-600/5 rounded-[48px] blur-2xl" />

      {/* Header Container */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-blue-500/20 mb-4 animate-bounce">
          <Rocket className="w-3.5 h-3.5" />
          <span>Mission Dukaan 3.0 · Launching Next Month</span>
        </div>

        <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-slate-950">
          The Complete <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Next-Gen Retail Experience.
          </span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Dukaan 3.0 is a complete reimagining of the retail counter. Engineered for extreme speed, tactile micro-interactions, AI speech processing, and omnichannel customer ordering.
        </p>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {PILLARS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Dukaan 3.0 Ready</span>
                <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Beta Early Access Card */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-[36px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border-2 border-blue-500/30 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 block mb-2">
            Priority Merchant Beta Pass
          </span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Be the First to Experience Dukaan 3.0
          </h3>
          <p className="text-sm sm:text-base text-slate-300 font-medium mb-6">
            Get exclusive day-one access to AI Voice Billing, WhatsApp Online Storefront, and OLED Dark Mode, with 2 months free Pro upgrade.
          </p>

          {joined ? (
            <div className="inline-flex items-center gap-2 p-3 px-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>You're on the VIP 3.0 Early Access list! We'll notify you on WhatsApp.</span>
            </div>
          ) : (
            <form onSubmit={handleJoinBeta} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Enter 10-digit WhatsApp #"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={phone.length < 10}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Get Early Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant Rollout Next Month
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Free 1-Tap Upgrade
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
