import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Sparkles, 
  MessageCircle, 
  Printer, 
  ShieldCheck, 
  Store, 
  TrendingUp,
  CreditCard,
  Keyboard,
  Smartphone,
  ChevronRight,
  Star
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "annual"

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#090C10] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-400 relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      {/* 1. Sleek Floating Header */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <nav className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
          {/* Official Dukaan Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-white/20 group-hover:scale-105 transition-transform">
              <img src="/dukaan-logo.png" alt="Dukaan - Retail OS" className="h-6 sm:h-7 w-auto object-contain" />
            </div>
            <span className="hidden sm:inline-block text-[10px] font-bold font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              officialdukaan.in
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#speed" className="hover:text-white transition-colors">Why 0.8s?</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/app/pos"
                className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Launch POS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="h-9 px-4.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <main className="relative z-10 pt-16 md:pt-24 pb-20 px-4 max-w-5xl mx-auto text-center">
        {/* Gen-Z Electric Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span className="font-bold tracking-wide uppercase text-[10px]">The Gen-Z Retail OS</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">0.8s Sub-Second Engine</span>
        </motion.div>

        {/* Main Punchy Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] font-display max-w-4xl mx-auto"
        >
          Run Your Counter. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Kill The Queue.
          </span>
        </motion.h1>

        {/* Short, No-BS Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed"
        >
          The lightning-fast billing software built for Indian retailers. 
          Instant keyboard checkout, ESC/POS thermal printing, and 1-tap WhatsApp Udhaar recovery. 
          <strong className="text-slate-200"> Zero lag. Zero bloat.</strong>
        </motion.p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto h-12 px-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={scrollToPricing}
            className="w-full sm:w-auto h-12 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>View Pricing (From ₹79/mo)</span>
          </button>
        </motion.div>

        {/* Social Proof Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Setup in 30 Seconds</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Works Offline & Online</span>
          </div>
        </div>

        {/* 3. Hero Visual — Terminal Glass Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl"
        >
          <div className="bg-[#0D1117] rounded-[22px] border border-white/10 p-5 sm:p-7 text-left overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] text-slate-500 font-mono ml-2">dukaan-pos-terminal • v3.0</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>0.8s LATENCY</span>
              </div>
            </div>

            {/* Mock POS Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Counter details */}
              <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-white/5">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>PRICE</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-200">
                    <span>Amul Butter (500g)</span>
                    <span className="text-slate-400">× 1</span>
                    <span className="font-bold text-white">₹275.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-200">
                    <span>Aashirvaad Shudh Chakki Atta (10kg)</span>
                    <span className="text-slate-400">× 1</span>
                    <span className="font-bold text-white">₹430.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-200">
                    <span>Tata Salt Lite (1kg)</span>
                    <span className="text-slate-400">× 2</span>
                    <span className="font-bold text-white">₹84.00</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
                  <span className="text-xl font-black text-blue-400 font-mono">₹789.00</span>
                </div>
              </div>

              {/* Action Column */}
              <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 rounded-2xl p-4 border border-blue-500/20 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">QUICK DISPATCH</span>
                  <p className="text-xs text-slate-300 mt-1">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">F6</kbd> to Instant Print</p>
                </div>

                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-medium">WhatsApp Bill Triggered</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center gap-2">
                    <Printer className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-medium">58mm ESC/POS Spooled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. Feature Bento Grid (Pure Facts, No Fluff) */}
        <section id="features" className="mt-28 text-left">
          <div className="text-center max-w-md mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-widest block mb-2">
              WHY RETAILERS SWITCH
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              Engineered for the Counter.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1 */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">0.8s Keyboard Speed</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                F1 to search, F2 to change quantity, F6 to bill. Never touch a mouse during busy rush hours.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">WhatsApp Udhaar Khata</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                1-tap digital invoices and automatic payment reminders sent directly to customers on WhatsApp. Never lose credit.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">Thermal Hardware Native</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Plug & play with any standard 58mm or 80mm ESC/POS USB or Bluetooth thermal printer without installing drivers.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Pricing Section (Clean, Transparent, No BS) */}
        <section id="pricing" className="mt-28">
          <div className="text-center max-w-md mx-auto mb-10">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-widest block mb-2">
              PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              Honest Plans. Zero Hidden Fees.
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Start free. Upgrade when your shop scales.
            </p>

            {/* Monthly / Annual Switcher */}
            <div className="mt-6 inline-flex p-1 bg-white/5 border border-white/10 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly" ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "annual" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">20% OFF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Starter</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-display text-white">
                    ₹{billingCycle === "monthly" ? "79" : "799"}
                  </span>
                  <span className="text-xs text-slate-400">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">For single-counter shops & solo retail counters.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Fast POS Billing Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Unlimited Products & Inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Basic Order History</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/subscribe?plan=starter"
                className="mt-8 w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                Choose Starter
              </Link>
            </div>

            {/* Business Plan (Highlighted Gen-Z Card) */}
            <div className="relative bg-gradient-to-b from-blue-950/40 to-slate-900/80 border-2 border-blue-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                MOST POPULAR
              </div>

              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Business</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-display text-white">
                    ₹{billingCycle === "monthly" ? "119" : "1,199"}
                  </span>
                  <span className="text-xs text-slate-400">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">The complete suite with thermal printing & khata.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold">All Starter features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>58mm / 80mm Thermal Receipts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>WhatsApp Udhaar Khata Reminders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Daily Profit & Expense Analytics</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/subscribe?plan=business"
                className="mt-8 w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>Upgrade to Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pro / Onsite Setup Plan */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Annual VIP</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-display text-white">
                    ₹1,499
                  </span>
                  <span className="text-xs text-slate-400">/year</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Full year access with priority phone support.</p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Complete 12-Month Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Custom Shop Name & Logo on Bill</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Priority WhatsApp Onboarding</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/subscribe?plan=premium"
                className="mt-8 w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                Choose Annual VIP
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Direct WhatsApp Floating Action */}
        <div className="mt-24 p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-blue-950/40 border border-emerald-500/20 text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">Need help setting up your store?</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
            Speak directly with our team on WhatsApp for hardware support, barcode scanners, or thermal printer setup.
          </p>
          <a
            href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20set%20up%20Dukaan%20POS%20for%20my%20shop"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (Instant Reply)</span>
          </a>
        </div>
      </main>

      {/* 7. Clean Minimalist Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-xs text-slate-500 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="flex items-center px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-white/20">
            <img src="/dukaan-logo.png" alt="Dukaan" className="h-6 w-auto object-contain" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 mb-3 text-slate-400">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
          <a href="mailto:contact@officialdukaan.in" className="hover:text-white transition-colors">contact@officialdukaan.in</a>
        </div>
        <p className="font-mono text-[11px] text-slate-500">© 2026 Dukaan • officialdukaan.in • A PRODUCT BY PEAN</p>
      </footer>
    </div>
  );
}
