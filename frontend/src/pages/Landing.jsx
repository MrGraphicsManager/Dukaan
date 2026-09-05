import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Package, 
  Users, 
  Wallet, 
  BarChart3, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Bell, 
  Zap, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  Download,
  Laptop,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

import AppleScrollStage3D from "@/components/AppleScrollStage3D";
import HardwareBento3D from "@/components/HardwareBento3D";
import InteractiveCounterDemo from "@/components/InteractiveCounterDemo";
import DownloadHub3D from "@/components/DownloadHub3D";
import Testimonials3D from "@/components/Testimonials3D";

const PLANS = [
  { 
    name: "Starter", 
    setup: 299, 
    price: 99, 
    perks: [
      "Fast POS Billing & Invoices", 
      "Unlimited Products & Inventory", 
      "Order History & Basic Reports",
      "Standard Dashboard Access"
    ] 
  },
  { 
    name: "Business", 
    setup: 499, 
    price: 149, 
    perks: [
      "Everything in Starter", 
      "Customer Khata Directory", 
      "Udhaar & WhatsApp 1-Tap Reminders", 
      "Low Stock Automated Alerts",
      "Daily & Monthly Sales Analytics"
    ], 
    featured: true 
  },
  { 
    name: "Premium", 
    setup: 999, 
    price: 299, 
    perks: [
      "Everything in Business", 
      "Multi-Shop Headquarter Support", 
      "Full FY Tax & Profit Audit", 
      "GST Invoicing & Verification",
      "Priority VIP Support & Soundbox"
    ] 
  },
];

const FAQS = [
  { 
    q: "Kya Dukaan bina internet (offline) chalti hai?", 
    a: "Haan! Dukaan ka native Android app (.apk) aur Windows PC software (.exe) embedded C-SQLite database use karte hain jo bina internet ke 100% offline Airplane Mode me chalta hai." 
  },
  { 
    q: "Barcode scanner ke liye alag machine chahiye?", 
    a: "Nahi! Dukaan aapke mobile ke camera ko industrial optical barcode scanner me badal deta hai. Bas packet par camera point karein aur item bill me auto-add ho jata hai." 
  },
  { 
    q: "Udhaar ka payment reminder WhatsApp par kaise jata hai?", 
    a: "Customer Khata me bas 1-tap 'WhatsApp' button dabayein. Aapke phone ka WhatsApp open hota hai jisme grahak ke naam aur baaki hisab ka message pehle se likha hota hai." 
  },
  { 
    q: "Receipt print karne ke liye printer kaise connect hota hai?", 
    a: "Dukaan kisi bhi standard 58mm ya 80mm Bluetooth, USB, ya WiFi thermal printer ke sath compatible hai. Zero ink lagti hai aur bill instant print hota hai." 
  },
  { 
    q: "Multiple branches ya shops manage kar sakte hain?", 
    a: "Haan! Dukaan Premium me multi-shop headquarter support hai jisse aap ek hi login se alag-alag dukaano ka hisab dekh sakte hain." 
  },
];

export default function Landing() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState("EN"); // 'EN' | 'HI' | 'GU'

  const langStrings = {
    EN: {
      tag: "100% Offline Retail Counter OS",
      heroBtn: "Start Free Now",
      downloadBtn: "Get Android APK & PC",
      login: "Log in",
      signup: "Sign Up Free",
      openDukaan: "Open Dukaan",
    },
    HI: {
      tag: "100% ऑफलाइन रीटेल बिलिंग काउंटर ओएस",
      heroBtn: "फ्री में शुरू करें",
      downloadBtn: "Android APK और PC डाउनलोड करें",
      login: "लॉग इन",
      signup: "साइन अप",
      openDukaan: "दुकान खोलें",
    },
    GU: {
      tag: "100% ઑફલાઇન રિટેલ બિલિંગ કાઉન્ટર",
      heroBtn: "મફતમાં શરૂ કરો",
      downloadBtn: "Android APK અને PC ડાઉનલોડ",
      login: "લૉગ ઇન",
      signup: "સાઇન અપ",
      openDukaan: "દુકાન ખોલો",
    }
  };

  const t = langStrings[lang];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-x-hidden font-sans">
      
      {/* =========================================================
          APPLE-GRADE FROSTED TITANIUM NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#07090e]/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Dukaan" 
              className="h-9 w-auto object-contain transition-transform hover:scale-105" 
            />
            <div className="hidden sm:flex flex-col border-l border-white/10 pl-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono leading-none">by</span>
              <span className="text-xs font-display font-extrabold tracking-tight text-white leading-tight">PEAN</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <a href="#kiosk" className="hover:text-cyan-400 transition-colors">3D Hardware</a>
            <a href="#test-drive" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Test Drive</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px]">Live</span>
            </a>
            <a href="#download" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Apps</span>
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action Stack */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 text-[11px] font-bold font-mono">
              {["EN", "HI", "GU"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    lang === l
                      ? "bg-cyan-500 text-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button 
              onClick={() => nav("/login")} 
              variant="ghost"
              className="hidden sm:inline-flex text-slate-300 hover:text-white rounded-full px-4 h-10 text-xs font-bold uppercase tracking-wider"
            >
              {t.login}
            </Button>

            <Button 
              onClick={() => nav("/app")} 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-full px-5 h-10 text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <span>{t.openDukaan}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          APPLE 3D SCROLL-DRIVEN STAGE (SCROLLYTELLING)
      ========================================================= */}
      <div id="kiosk">
        <AppleScrollStage3D />
      </div>

      {/* =========================================================
          HARDWARE BENTO 3D GRID
      ========================================================= */}
      <HardwareBento3D />

      {/* =========================================================
          INTERACTIVE COUNTER DEMO (PLAYABLE TEST DRIVE)
      ========================================================= */}
      <div id="test-drive">
        <InteractiveCounterDemo />
      </div>

      {/* =========================================================
          DEDICATED 3D DOWNLOAD HUB (STANDALONE .APK & .EXE)
      ========================================================= */}
      <DownloadHub3D />

      {/* =========================================================
          REAL INDIAN RETAILER TESTIMONIALS
      ========================================================= */}
      <Testimonials3D />

      {/* =========================================================
          PRICING SECTION (APPLE DARK AESTHETIC)
      ========================================================= */}
      <section id="pricing" className="relative z-20 py-24 px-6 max-w-6xl mx-auto bg-[#07090e] border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
            Transparent Indian Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
            Simple, honest pricing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              No hidden commissions.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Start with our generous free trial. Upgrade only as your shop expands.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl p-8 border flex flex-col justify-between transition-all ${
                p.featured
                  ? "bg-gradient-to-b from-slate-900 via-slate-950 to-black border-cyan-500/50 shadow-[0_15px_60px_-15px_rgba(6,182,212,0.25)] relative"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-[10px] font-black uppercase tracking-widest shadow-md">
                  Most Popular for Kirana
                </div>
              )}

              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  {p.name}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">₹{p.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Setup ₹{p.setup} one-time</div>

                <div className="mt-8 space-y-3">
                  {p.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  onClick={() => nav("/register")}
                  className={`w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                    p.featured
                      ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          FAQ ACCORDION SECTION
      ========================================================= */}
      <section id="faq" className="relative z-20 py-24 px-6 max-w-4xl mx-auto bg-[#07090e] border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Have questions about Dukaan? Here are direct answers.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <h4 className="text-base font-bold text-white mb-2">
                {faq.q}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          FOOTER WITH PEAN BRANDING
      ========================================================= */}
      <footer className="relative z-20 border-t border-white/10 bg-black py-16 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Dukaan" className="h-8 w-auto object-contain" />
            <div className="text-xs text-slate-500 font-mono">
              © {new Date().getFullYear()} Dukaan Retail OS · Developed by PEAN
            </div>
          </div>

          <div className="flex gap-6 text-xs text-slate-400 font-mono">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <a href="#download" className="hover:text-white transition-colors">Download App</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
