import { api } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Layers, 
  Smartphone, 
  CheckCircle2, 
  Heart, 
  Clock, 
  Briefcase, 
  Menu, 
  X, 
  Phone, 
  HelpCircle, 
  LogIn, 
  UserPlus, 
  Crown, 
  Sliders,
  ChevronDown,
  Printer,
  Building2,
  Lock,
  Volume2,
  Share2,
  FileText,
  TrendingUp,
  RotateCcw,
  CheckCheck,
  Shield,
  Server,
  Cloud,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  LayoutGrid,
  LayoutList
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import InstallAppButton from "@/components/InstallAppButton";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";
import StoreDemoPreview from "@/components/landing/StoreDemoPreview";
import { playVoiceSoundbox } from "@/lib/soundbox";
import useButterSmoothScroll from "@/lib/useButterSmoothScroll";

const ALL_PLANS = [
  { 
    id: "starter",
    name: "Starter", 
    tagline: "For New & Single-Counter Stores",
    setup: 299, 
    price: 79, 
    originalPrice: 99,
    discount: "20% OFF",
    accentColor: "emerald",
    route: "/starter-plan",
    badge: "Essential",
    perks: [
      "Sub-2s Fast POS Billing & Cart",
      "Unlimited Products & Inventory", 
      "58mm & 80mm Thermal Receipts",
      "Standard Daily Sales Ledger",
      "Zero Hardware Lock-In"
    ] 
  },
  { 
    id: "business",
    name: "Business", 
    tagline: "For Busy Kiranas with Udhaar",
    setup: 499, 
    price: 119, 
    originalPrice: 149,
    discount: "20% OFF",
    featured: true,
    accentColor: "amber",
    route: "/business-plan",
    badge: "Most Popular",
    perks: [
      "Everything in Starter", 
      "Customer Khata Udhaar Ledger", 
      "1-Tap WhatsApp Payment Reminders", 
      "Dynamic UPI QR in WhatsApp",
      "Automated Low-Stock Alerts",
      "Barcode Printing & Scanning"
    ] 
  },
  { 
    id: "premium",
    name: "Premium", 
    tagline: "For Multi-Shop Chains & GST Retailers",
    setup: 999, 
    price: 239, 
    originalPrice: 299,
    discount: "20% OFF",
    accentColor: "indigo",
    route: "/premium-plan",
    badge: "Multi-Shop HQ",
    perks: [
      "Everything in Business", 
      "Multi-Shop HQ (Up to 3 Branches)", 
      "Full FY CA Tax & Profit Audit", 
      "Official GST Invoicing (A4 & A5)",
      "Branch-Wise Cashier Roles",
      "Priority WhatsApp Support (<15m)"
    ] 
  },
  {
    id: "pro",
    name: "Dukaan Pro",
    tagline: "The Flagship Enterprise Retail Tier",
    setup: 0,
    price: 499,
    originalPrice: null,
    offerBadge: "1+1 Month Free",
    is_pro: true,
    accentColor: "blue",
    route: "/pro-plan",
    badge: "Flagship Enterprise",
    perks: [
      "Everything in Premium",
      "Dukaan Pro Studio Included (₹499 value)",
      "Cashier PIN Security (Mask Wholesale)",
      "Shift Handover F9 Drawer Reconciliation",
      "Virtual Voice Soundbox (5 Languages)",
      "AI Restock Run-Out Velocity Predictor",
      "24/7 VIP Dedicated Helpline"
    ]
  }
];

const PEAN_FEATURES = [
  { 
    icon: Zap, 
    title: "Sub-2s Fast POS Engine", 
    body: "Designed for evening rush hours. Auto-calculating cart, barcode scan lookup, and instant cash/UPI splits in seconds.",
    badge: "Speed: <2s",
    plan: "Starter & Above"
  },
  { 
    icon: Wallet, 
    title: "Customer Khata & WhatsApp", 
    body: "Eliminate torn paper diaries. Track credit balances and send 1-tap polite WhatsApp payment reminders with your UPI link.",
    badge: "1-Tap UPI",
    plan: "Business & Above"
  },
  { 
    icon: Bell, 
    title: "Automated Low-Stock Alerts", 
    body: "Set critical threshold levels for fast-moving Kirana items. Receive auto alerts before items run out of stock.",
    badge: "Zero Stockouts",
    plan: "Business & Above"
  },
  { 
    icon: Building2, 
    title: "Multi-Shop Headquarter", 
    body: "Manage up to 3 retail branches from one central master dashboard. Monitor live branch sales and transfer stock.",
    badge: "Up to 3 Shops",
    plan: "Premium & Above"
  },
  { 
    icon: FileText, 
    title: "Full FY CA Tax & Profit Audit", 
    body: "One-click GSTR-1 and GSTR-3B tax ledgers, HSN code breakdowns, and profit audit exports ready for your Chartered Accountant.",
    badge: "CA Ready",
    plan: "Premium & Above"
  },
  { 
    icon: Lock, 
    title: "Cashier PIN & F9 Shift", 
    body: "Mask purchase wholesale costs from counter staff. Reconcile drawer cash discrepancies with instant F9 shift handover print.",
    badge: "Anti-Theft",
    plan: "Dukaan Pro"
  }
];

const FAQS = [
  {
    q: "How does the PEAN Retail OS system work?",
    a: "PEAN Retail OS powers Dukaan through a unified cloud architecture. Your billing counter, inventory catalog, customer khata ledger, and multi-shop analytics are synced in real time with 99.99% uptime and offline-first resilience."
  },
  {
    q: "Which plan is best suited for my shop?",
    a: "• Starter Plan (₹79/mo): Best for single-counter shops starting computer billing.\n• Business Plan (₹119/mo - Most Popular): Best for active Kiranas that need Udhaar Khata, 1-Tap WhatsApp reminders, and stock alerts.\n• Premium Plan (₹239/mo): Best for multi-branch retailers (up to 3 shops) and GST businesses needing CA audit packs.\n• Dukaan Pro Plan (₹499/mo): Flagship enterprise tier with Dukaan Pro Studio, Cashier PIN, F9 Shift reconciliation, and Voice Soundbox."
  },
  {
    q: "What is Dukaan Pro Studio and how do I get it?",
    a: "Dukaan Pro Studio is our advanced branding and receipt customization suite. It allows you to design custom 58mm & 80mm thermal bills, embed your shop logo and dynamic UPI payment QR code, choose from 5 brand color themes, and use the Virtual Voice Soundbox. It is included 100% free inside the Dukaan Pro Plan (₹499/mo)."
  },
  {
    q: "Do I need to purchase expensive POS machines or touchscreens?",
    a: "No! Dukaan runs smoothly on any existing computer, budget laptop, or tablet. It connects seamlessly to all standard USB, Bluetooth, or WiFi thermal printers and barcode scanners."
  },
  {
    q: "Can I upgrade my plan later as my business grows?",
    a: "Yes, you can upgrade from Starter to Business, Premium, or Dukaan Pro at any time with one click. All your products, stock counts, bills, and khata ledgers remain 100% safe and intact."
  }
];

export default function Landing() {
  const nav = useNavigate();
  useButterSmoothScroll();

  // Platform Maintenance State
  const [landingMaintenance, setLandingMaintenance] = useState(null);
  const [maintenanceRemaining, setMaintenanceRemaining] = useState(0);

  // Admin Announcement State
  const [announcement, setAnnouncement] = useState("");

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop Plans Dropdown State
  const [plansDropdownOpen, setPlansDropdownOpen] = useState(false);

  // Desktop Pricing Layout: "horizontal" by default per user request, toggleable to "grid"
  const [desktopPricingLayout, setDesktopPricingLayout] = useState("horizontal");

  // Mobile Comparison Plan Selector State
  const [mobileComparePlan, setMobileComparePlan] = useState("business");

  // Hero Interactive Plan Switcher State
  const [activeHeroTab, setActiveHeroTab] = useState("pro"); // 'starter' | 'business' | 'premium' | 'pro' | 'studio'
  const [isPlayingHeroSoundbox, setIsPlayingHeroSoundbox] = useState(false);
  const [heroPinUnlocked, setHeroPinUnlocked] = useState(false);
  const [heroReceiptType, setHeroReceiptType] = useState("80mm");

  // Load announcement & maintenance settings
  useEffect(() => {
    let timer;
    api.get("/platform/landing-maintenance")
      .then((r) => {
        const m = r?.data?.landing_maintenance;
        if (m && m.enabled) {
          setLandingMaintenance(m);
          if (m.ends_at) {
            const computeSecs = () => Math.max(0, Math.floor((new Date(m.ends_at).getTime() - Date.now()) / 1000));
            setMaintenanceRemaining(computeSecs());
            timer = setInterval(() => {
              const rem = computeSecs();
              setMaintenanceRemaining(rem);
              if (rem <= 0) {
                clearInterval(timer);
                window.location.reload();
              }
            }, 1000);
          }
        }
      })
      .catch(() => {});

    api.get("/platform/announcement")
      .then((r) => {
        if (r?.data?.announcement?.enabled) {
          setAnnouncement(r.data.announcement.message || "");
        }
      })
      .catch(() => {});

    return () => clearInterval(timer);
  }, []);

  const handleHeroSoundboxTest = () => {
    setIsPlayingHeroSoundbox(true);
    playVoiceSoundbox(499, "upi", "hi");
    setTimeout(() => setIsPlayingHeroSoundbox(false), 2400);
  };

  // Maintenance View (if enabled)
  if (landingMaintenance?.enabled) {
    const mDays = Math.floor(maintenanceRemaining / 86400);
    const mHours = Math.floor((maintenanceRemaining % 86400) / 3600);
    const mMins = Math.floor((maintenanceRemaining % 3600) / 60);
    const mSecs = maintenanceRemaining % 60;

    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Dukaan" className="h-9 sm:h-11 w-auto object-contain" />
            <div className="flex flex-col border-l border-slate-300 pl-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
              <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">PEAN</span>
            </div>
          </div>
          <Link to="/app" className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-full bg-slate-50">
            Merchant Login →
          </Link>
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto text-center py-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Scheduled PEAN Platform Maintenance</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl font-black text-slate-900">
            {landingMaintenance.title || "Upgrading Core PEAN Cloud Systems"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            {landingMaintenance.message || "We are upgrading Dukaan systems with lightning-fast cloud synchronization. Your billing counter will resume automatically."}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto pt-4">
            {[
              { label: "DAYS", val: String(mDays).padStart(2, "0") },
              { label: "HOURS", val: String(mHours).padStart(2, "0") },
              { label: "MINS", val: String(mMins).padStart(2, "0") },
              { label: "SECS", val: String(mSecs).padStart(2, "0") }
            ].map((c) => (
              <div key={c.label} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="font-mono text-2xl sm:text-4xl font-black text-slate-900">{c.val}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="pt-6">
            <Link to="/app" className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md inline-flex items-center gap-2">
              <Store className="w-4 h-4" /> Go to Merchant Portal
            </Link>
          </div>
        </main>

        <footer className="max-w-4xl mx-auto w-full text-center pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
          <span>officialdukaan.in</span>
          <span>A Product by PEAN · 100% Data Protection</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 3D Ambient Depth Canvas Background */}
      <ThreeDBackground />

      {/* =========================================================
          TOP ANNOUNCEMENT BAR (A PRODUCT BY PEAN SYSTEM)
      ========================================================= */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium flex items-center justify-center gap-2 sm:gap-2.5 text-center shadow-xs z-50 relative">
        <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 shadow-2xs">
          PEAN RETAIL OS
        </span>
        <span className="text-blue-50 font-normal truncate sm:overflow-visible">
          {announcement || "India's Fastest Cloud POS & Retail Ecosystem · A Flagship Product by PEAN"}
        </span>
      </div>

      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & by PEAN tag */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <img src="/logo.png" alt="Dukaan" className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col border-l border-slate-200 pl-2 sm:pl-2.5 shrink-0">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-slate-950 leading-tight">PEAN</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs xl:text-sm font-semibold text-slate-700 shrink-0">
            {/* Interactive Plans Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setPlansDropdownOpen(true)}
              onMouseLeave={() => setPlansDropdownOpen(false)}
            >
              <button 
                type="button"
                onClick={() => setPlansDropdownOpen(prev => !prev)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition-all ${
                  plansDropdownOpen ? "text-blue-600 bg-blue-50" : "text-slate-800 hover:text-blue-600 hover:bg-slate-100"
                }`}
              >
                <span>Plans</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${plansDropdownOpen ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
              </button>

              {/* Dropdown Menu Popover */}
              <AnimatePresence>
                {plansDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-2.5 z-50 text-left"
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2.5 py-1">
                      Choose Your PEAN Edition
                    </div>
                    <div className="space-y-1 mt-1">
                      <Link
                        to="/starter-plan"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 text-slate-900 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Starter Plan</div>
                            <div className="text-[10px] text-slate-500">Fast POS billing</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">₹79</span>
                      </Link>

                      <Link
                        to="/business-plan"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50 text-slate-900 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold group-hover:text-amber-800 transition-colors">Business Plan</div>
                            <div className="text-[10px] text-slate-500">Khata & WhatsApp reminders</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">₹119</span>
                      </Link>

                      <Link
                        to="/premium-plan"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50 text-slate-900 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold group-hover:text-indigo-800 transition-colors">Premium Plan</div>
                            <div className="text-[10px] text-slate-500">Multi-Shop HQ & permissions</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full">₹239</span>
                      </Link>

                      <Link
                        to="/pro-plan"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-slate-900 border border-blue-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-blue-900 flex items-center gap-1">
                              <span>Dukaan Pro</span>
                              <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full">Popular</span>
                            </div>
                            <div className="text-[10px] text-blue-700">1+1 Free Lifetime · 0% Fee</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-full">₹499</span>
                      </Link>

                      <Link
                        to="/pro-studio"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-purple-50 text-slate-900 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold group-hover:text-purple-700 transition-colors flex items-center gap-1">
                              <span>Pro Studio</span>
                              <span className="text-[9px] bg-purple-600 text-white font-black px-1 rounded-sm uppercase">Suite</span>
                            </div>
                            <div className="text-[10px] text-slate-500">Thermal Designer & Soundbox</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">FREE in Pro</span>
                      </Link>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 px-2 flex items-center justify-between">
                      <a
                        href="#pricing"
                        onClick={() => setPlansDropdownOpen(false)}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Compare all plans in detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#features" className="hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-colors">FAQ</a>
            <Link to="/careers" className="hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <span>Careers</span>
              <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">Hiring</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            <Button 
              onClick={() => nav("/login")} 
              variant="ghost"
              className="hidden sm:inline-flex text-slate-700 hover:text-blue-600 rounded-full px-3.5 h-10 text-xs font-bold"
            >
              Log in
            </Button>

            <Button 
              onClick={() => nav("/app")} 
              data-testid="cta-open-app" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 sm:px-7 h-11 sm:h-12 text-xs sm:text-sm font-black active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0"
            >
              <span>Open Dukaan</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition-all flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-5 space-y-3.5 max-w-lg mx-auto">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  PEAN Retail Plans & Tools
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/starter-plan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 flex items-center gap-2.5"
                  >
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Starter</span>
                        <span className="text-[9px] bg-emerald-600 text-white font-black px-1 rounded-sm">₹79</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">Fast POS Billing</div>
                    </div>
                  </Link>

                  <Link
                    to="/business-plan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 flex items-center gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Business</span>
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded-sm">₹119</span>
                      </div>
                      <div className="text-[10px] text-amber-800 font-medium">Khata & WhatsApp</div>
                    </div>
                  </Link>

                  <Link
                    to="/premium-plan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-indigo-50 text-indigo-950 border border-indigo-200 flex items-center gap-2.5"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Premium</span>
                        <span className="text-[9px] bg-indigo-600 text-white font-black px-1 rounded-sm">₹239</span>
                      </div>
                      <div className="text-[10px] text-indigo-700 font-medium">Multi-Shop & GST</div>
                    </div>
                  </Link>

                  <Link
                    to="/pro-plan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-2.5"
                  >
                    <Crown className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>Pro Plan</span>
                        <span className="text-[9px] bg-blue-600 text-white font-black px-1 rounded-sm">₹499</span>
                      </div>
                      <div className="text-[10px] text-blue-700 font-medium">PIN & Shift F9</div>
                    </div>
                  </Link>

                  <Link
                    to="/pro-studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Dukaan Pro Studio</span>
                          <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 rounded-full">Included in Pro</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Thermal Receipt Architect & Soundbox Studio</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  </Link>
                </div>

                {/* Quick Navigation Links */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center text-xs font-bold text-slate-700">
                  <a 
                    href="#features" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </a>
                  <a 
                    href="#faq" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </a>
                  <Link 
                    to="/careers" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Careers
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Official Merchant Support</span>
                  <a href="tel:7016430577" className="text-blue-700 font-bold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>7016430577</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      nav("/login");
                    }}
                    className="h-11 rounded-xl text-slate-800 font-bold text-sm border-slate-300 hover:bg-slate-100"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      nav("/app");
                    }}
                    className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
                  >
                    Open Dukaan
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================
          HERO SECTION: "THE COMPLETE RETAIL OS · POWERED BY PEAN"
          FEATURING THE 5-WAY PLAN SWITCHER HUB
      ========================================================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10 md:pt-16 pb-12 sm:pb-16">
        
        {/* Top Eyebrow */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest mb-3 sm:mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>A Flagship Product by PEAN · The Retail Operating System</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.08] sm:leading-[1.06] text-slate-950">
            Manage. Grow. Simplify. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
              Every Store, One Platform.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            From single-counter Kiranas to multi-branch supermarkets. Fast POS billing, customer Khata WhatsApp collection, multi-shop HQ, cashier PIN security, and custom thermal receipts.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Button
              onClick={() => nav("/app")}
              className="w-full sm:w-auto h-13 sm:h-16 px-6 sm:px-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-lg active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5"
            >
              <span>Launch Free Counter App</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <a
              href="#pricing"
              className="w-full sm:w-auto h-13 sm:h-16 px-6 sm:px-10 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-500 text-slate-900 font-black text-sm sm:text-lg active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2.5"
            >
              <span>Explore All 4 Plans ↓</span>
            </a>
          </div>

          {/* =========================================================
              LIVE COUNTER STORE DEMO PREVIEW (Codex #store-demo Inspired)
          ========================================================= */}
          <div className="mt-8 sm:mt-12">
            <StoreDemoPreview />
          </div>
        </div>

        {/* =========================================================
            THE 5-WAY INTERACTIVE PLAN SELECTOR HUB
        ========================================================= */}
        <div className="mt-8 sm:mt-12 max-w-5xl mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
          
          {/* Tab Navigation Header */}
          <div className="p-2.5 sm:p-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
              {[
                { id: "starter", name: "Starter", price: "₹79", icon: Zap, color: "emerald" },
                { id: "business", name: "Business", price: "₹119", icon: Sparkles, color: "amber", badge: "POPULAR" },
                { id: "premium", name: "Premium", price: "₹239", icon: Building2, color: "indigo" },
                { id: "pro", name: "Dukaan Pro", price: "₹499", icon: Crown, color: "blue", badge: "FLAGSHIP" },
                { id: "studio", name: "Pro Studio", price: "INCLUDED", icon: Sliders, color: "purple" }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeHeroTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHeroTab(tab.id)}
                    className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                      isActive
                        ? "bg-white text-slate-950 shadow-md border border-slate-200 scale-[1.02]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                    <span>{tab.name}</span>
                    <span className="text-xs font-mono opacity-80">{tab.price}</span>
                    {tab.badge && (
                      <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded uppercase">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline-flex text-[11px] font-bold text-slate-400 font-mono">
              POWERED BY PEAN
            </span>
          </div>

          {/* Morphing Tab Content Stage */}
          <div className="p-6 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              
              {/* 1. STARTER PLAN TAB */}
              {activeHeroTab === "starter" && (
                <motion.div
                  key="tab-starter"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" /> Starter Plan · ₹79/month
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-900">
                      Lightning POS Billing for Single-Counter Kiranas
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Say goodbye to pen and paper. Create unlimited bills in under 2 seconds, organize your entire product catalog, and print clean thermal slips on any USB or Bluetooth printer.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Sub-2s Fast POS Billing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Unlimited Products Catalog</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Thermal & Laser Print</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Cloud Data Backup</span>
                      </li>
                    </ul>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to="/starter-plan"
                        className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span>Explore Starter Plan Page</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/subscribe?plan=starter"
                        className="w-full sm:w-auto h-13 sm:h-14 px-5 sm:px-7 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-600 text-slate-900 font-extrabold text-sm sm:text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Get Starter (₹79/mo)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3 font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-300">
                      <span className="font-bold text-slate-800">⚡ QUICK POS BILL</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">1.2s</span>
                    </div>
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Amul Butter 100g x1</span>
                        <span>₹65</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aashirvaad Atta 5kg x1</span>
                        <span>₹320</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maggi 2-Min x2</span>
                        <span>₹28</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-dashed border-slate-300">
                      <span>TOTAL (PAID VIA UPI):</span>
                      <span className="text-emerald-700">₹413</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 text-center text-[10px] text-slate-500 font-sans">
                      ✓ Thermal Slip Auto-Printed · Cart Reset in 0.1s
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. BUSINESS PLAN TAB */}
              {activeHeroTab === "business" && (
                <motion.div
                  key="tab-business"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-extrabold border border-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Business Plan · ₹119/month · Most Popular
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-900">
                      Customer Khata Udhaar & 1-Tap WhatsApp Collection
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Collect pending Udhaar 85% faster. Send polite WhatsApp balance reminders with your shop's dynamic UPI link, and receive automated warnings before grocery items run out.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Customer Khata Directory</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>1-Tap WhatsApp Reminders</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Low-Stock Auto Alerts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Barcode Sticker Print</span>
                      </li>
                    </ul>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to="/business-plan"
                        className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span>Explore Business Plan Page</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/subscribe?plan=business"
                        className="w-full sm:w-auto h-13 sm:h-14 px-5 sm:px-7 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-amber-400 text-slate-900 font-extrabold text-sm sm:text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Get Business (₹119/mo)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#ECE5DD] rounded-2xl p-4 border border-slate-300 text-xs space-y-2.5">
                    <div className="bg-[#075E54] text-white p-2.5 rounded-xl flex items-center justify-between text-[11px] font-bold">
                      <span>WhatsApp · Ramesh Sharma</span>
                      <span className="text-emerald-200">Online</span>
                    </div>
                    <div className="bg-[#DCF8C6] p-3 rounded-xl space-y-1.5 shadow-xs">
                      <p className="font-bold text-slate-900">Namaste Ramesh ji 🙏</p>
                      <p className="text-slate-700">Aapka Shri Ram Kirana Store me <strong>₹1,450</strong> ka Udhaar baki hai.</p>
                      <div className="p-2 bg-white/90 rounded border border-emerald-200 font-mono text-[10px] text-blue-700">
                        Pay via UPI: upi://pay?pa=kirana@okhdfcbank&am=1450
                      </div>
                      <span className="text-[9px] text-slate-500 text-right block">✓✓ Read</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. PREMIUM PLAN TAB */}
              {activeHeroTab === "premium" && (
                <motion.div
                  key="tab-premium"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 text-xs font-extrabold border border-indigo-200">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Premium Plan · ₹239/month · Multi-Shop
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-900">
                      Multi-Shop Headquarter & FY Tax CA Audits
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Scale up to 3 retail shop branches under one master login. Export complete 1-click GSTR-1 & 3B tax summaries for your CA, and get priority WhatsApp support in under 15 minutes.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Multi-Shop HQ (Up to 3 Shops)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Full FY Tax & Profit Audit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Official GST Invoices (A4/A5)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Priority Support SLA (&lt;15m)</span>
                      </li>
                    </ul>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to="/premium-plan"
                        className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span>Explore Premium Plan Page</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/subscribe?plan=premium"
                        className="w-full sm:w-auto h-13 sm:h-14 px-5 sm:px-7 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-indigo-600 text-slate-900 font-extrabold text-sm sm:text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Get Premium (₹239/mo)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-5 text-xs space-y-3 font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="font-bold text-amber-300">👑 MULTI-SHOP HQ</span>
                      <span className="text-slate-400">All 3 Synced</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between p-1.5 rounded bg-slate-800/80">
                        <span>Branch 1 (Station Rd):</span>
                        <span className="font-bold text-emerald-400">₹42,500</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-800/80">
                        <span>Branch 2 (Main Market):</span>
                        <span className="font-bold text-emerald-400">₹38,150</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-800/80">
                        <span>Branch 3 (Sector 4):</span>
                        <span className="font-bold text-emerald-400">₹29,600</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                      <span>HQ CONSOLIDATED:</span>
                      <span className="text-amber-300 text-sm">₹1,10,250</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. DUKAAN PRO TAB */}
              {activeHeroTab === "pro" && (
                <motion.div
                  key="tab-pro"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-black border border-blue-200">
                      <Crown className="w-3.5 h-3.5 text-blue-600" /> Dukaan Pro Plan · ₹499/month · Flagship Enterprise
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-950">
                      Cashier PIN Security, F9 Shift, & Pro Studio Suite
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Mask wholesale purchase prices from staff, eliminate register cash theft with F9 shift reconciliation, announce UPI payments aloud with voice soundbox, and access <strong>Dukaan Pro Studio</strong>.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Staff Cashier 4-Digit PIN</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>F9 Shift Handover Drawer Slip</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Virtual Voice Soundbox (₹0 Cost)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Full Pro Studio Included</span>
                      </li>
                    </ul>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to="/pro-plan"
                        className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span>Explore Pro Plan Page</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/subscribe?plan=pro"
                        className="w-full sm:w-auto h-13 sm:h-14 px-5 sm:px-7 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Get Pro (1+1 Month Free)</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-2xl p-5 text-xs space-y-4 shadow-lg">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-800">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-4 h-4" /> DUKAAN PRO SECURITY
                      </span>
                      <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded font-mono">1+1 Free</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 block text-[11px]">Staff Cashier Lock</span>
                        <span className="font-bold text-white">Wholesale Margins Masked</span>
                      </div>
                      <span className="text-emerald-400 font-bold">🔒 LOCKED</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-slate-300 text-[11px]">Voice Soundbox Chime:</span>
                      <button
                        onClick={handleHeroSoundboxTest}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlayingHeroSoundbox ? "Announcing..." : "Test Chime"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 5. PRO STUDIO TAB */}
              {activeHeroTab === "studio" && (
                <motion.div
                  key="tab-studio"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-900 text-xs font-black border border-purple-200">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" /> Dukaan Pro Studio · Included in Pro Plan
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-950">
                      Receipt Architect & Brand Customizer Suite
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Transform generic paper receipts into branded customer marketing. Add store logo, dynamic UPI QR payment codes, custom return policies, and high-contrast sunlight themes.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>58mm & 80mm Multi-Format</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Dynamic UPI QR on Receipt</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>5 Kirana Brand Color Themes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>WhatsApp Digital Cash Memo</span>
                      </li>
                    </ul>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        to="/pro-studio"
                        className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <span>Explore Pro Studio Deep-Dive</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/subscribe?plan=pro"
                        className="w-full sm:w-auto h-13 sm:h-14 px-5 sm:px-7 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Unlock Studio with Pro</span>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-2xl p-5 border-2 border-dashed border-slate-300 text-xs font-mono space-y-3 shadow-md">
                    <div className="text-center font-black pb-1 border-b border-slate-200">
                      *** YOUR BRANDED RECEIPT ***
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Format: 80mm POS Slip</span>
                      <span>UPI QR Enabled</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center font-sans space-y-1">
                      <div className="font-bold text-slate-800">Scan & Pay via any UPI App</div>
                      <div className="text-[10px] text-slate-500">GPay · PhonePe · Paytm · BHIM</div>
                    </div>
                    <div className="text-center text-[10px] text-slate-400 font-sans">
                      Dukaan Pro Studio Live Sync Engine
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </section>

      {/* =========================================================
          SECTION 2: THE PEAN SUBSCRIPTION SUITE
          FULL PROMOTION OF ALL 4 PLANS + PRO STUDIO SPOTLIGHT
      ========================================================= */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Transparent Indian Retail Pricing by PEAN
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-slate-950 tracking-tight">
              Choose the Right Plan for Your Counter
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-lg">
              Every plan includes unlimited product catalog, secure cloud storage, and zero hardware lock-in.
            </p>

            {/* Desktop View Switcher (Horizontal vs Grid) */}
            <div className="hidden lg:inline-flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs mt-6">
              <button
                type="button"
                onClick={() => setDesktopPricingLayout("horizontal")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  desktopPricingLayout === "horizontal"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Horizontal Suite (Wide)</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopPricingLayout("grid")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  desktopPricingLayout === "grid"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>4-Column Grid</span>
              </button>
            </div>
          </div>

          {/* =========================================================
              DESKTOP SUBSCRIPTION: HORIZONTAL VIEW (DEFAULT)
          ========================================================= */}
          {desktopPricingLayout === "horizontal" ? (
            <div className="hidden lg:flex flex-col gap-5">
              {ALL_PLANS.map((p) => (
                <Card3D 
                  key={p.id}
                  depth={p.is_pro ? 14 : p.featured ? 10 : 6}
                  glow={true}
                  className="w-full"
                >
                  <div className={`rounded-3xl p-6 lg:p-7 border-2 relative bg-white transition-all shadow-md hover:shadow-xl ${
                    p.is_pro
                      ? "border-blue-600 ring-4 ring-blue-500/10 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40"
                      : p.featured
                      ? "border-amber-400 ring-4 ring-amber-400/10 bg-gradient-to-r from-amber-50/40 via-white to-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                    
                    {/* Top Badges */}
                    {p.featured && (
                      <div className="absolute -top-3.5 left-8 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-md">
                        ★ MOST POPULAR
                      </div>
                    )}
                    {p.is_pro && (
                      <div className="absolute -top-3.5 left-8 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-md flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-300" /> FLAGSHIP ENTERPRISE TIER
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-6 items-center">
                      
                      {/* Column 1 (4 cols): Plan Identity, Price & Setup */}
                      <div className="col-span-4 border-r border-slate-200 pr-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-widest font-black text-slate-400">
                            {p.name} PLAN
                          </span>
                          {p.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-sans text-xl font-black text-slate-950 leading-snug">
                          {p.tagline}
                        </h3>

                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="font-sans text-4xl lg:text-5xl font-black text-slate-950">₹{p.price}</span>
                          {p.originalPrice && (
                            <span className="text-sm line-through text-slate-400 font-bold">₹{p.originalPrice}</span>
                          )}
                          <span className="text-xs font-bold text-slate-500">/month</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                          {p.discount && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {p.discount}
                            </span>
                          )}
                          {p.offerBadge && (
                            <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded-md">
                              {p.offerBadge}
                            </span>
                          )}
                          <span className="text-[11px] font-medium text-slate-500">
                            {p.setup > 0 ? `+ ₹${p.setup} setup fee` : "Zero setup fee"}
                          </span>
                        </div>
                      </div>

                      {/* Column 2 (5 cols): Grid of perks (2 columns) */}
                      <div className="col-span-5 border-r border-slate-200 pr-6">
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                          Key Capabilities & Inclusions
                        </div>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-700 font-medium">
                          {p.perks.map((perk, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 text-emerald-700 shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className="leading-snug">{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3 (3 cols): Action Buttons */}
                      <div className="col-span-3 flex flex-col gap-3 justify-center pl-2">
                        <Button
                          onClick={() => nav(`/subscribe?plan=${p.id}`)}
                          className={`w-full h-12 rounded-full text-sm font-black active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap ${
                            p.is_pro
                              ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25"
                              : p.featured
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          }`}
                        >
                          <span>Choose {p.name}</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </Button>

                        <Link
                          to={p.route}
                          className={`w-full h-12 rounded-full text-xs font-black border-2 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shadow-2xs ${
                            p.is_pro
                              ? "border-blue-600 bg-blue-50 text-blue-900 hover:bg-blue-100"
                              : p.featured
                              ? "border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
                              : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          <span>Explore {p.name === "Dukaan Pro" ? "Pro Plan" : `${p.name} Plan`}</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </Link>
                      </div>

                    </div>

                  </div>
                </Card3D>
              ))}
            </div>
          ) : (
            /* DESKTOP SUBSCRIPTION: 4-COLUMN GRID VIEW (OPTIONAL TOGGLE) */
            <div className="hidden lg:grid grid-cols-4 gap-6 items-stretch">
              {ALL_PLANS.map((p) => (
                <Card3D 
                  key={p.id}
                  depth={p.is_pro ? 20 : p.featured ? 18 : 12}
                  glow={true}
                  className="w-full"
                >
                  <div className={`rounded-3xl p-6 sm:p-7 border-2 shadow-md relative flex flex-col justify-between h-full bg-white ${
                    p.is_pro
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xl"
                      : p.featured
                      ? "border-amber-400 ring-2 ring-amber-400/20 shadow-lg"
                      : "border-slate-200"
                  }`}>
                    {/* Top Badges */}
                    {p.featured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md whitespace-nowrap">
                        ★ MOST POPULAR
                      </div>
                    )}
                    {p.is_pro && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-300" /> FLAGSHIP TIER
                      </div>
                    )}

                    <div>
                      <div className="text-xs uppercase tracking-widest font-black text-slate-400">
                        {p.name} PLAN
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        {p.tagline}
                      </div>

                      <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                        <span className="font-sans text-4xl sm:text-5xl font-black text-slate-950">₹{p.price}</span>
                        {p.originalPrice && (
                          <span className="text-sm line-through text-slate-400 font-bold">₹{p.originalPrice}</span>
                        )}
                        <span className="text-xs font-bold text-slate-500">/month</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {p.discount && (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {p.discount}
                          </span>
                        )}
                        {p.offerBadge && (
                          <span className="text-[10px] font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded-md">
                            {p.offerBadge}
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-slate-500">
                          {p.setup > 0 ? `+ ₹${p.setup} setup` : "Zero setup fee"}
                        </span>
                      </div>

                      <div className="my-5 h-px w-full bg-slate-200" />

                      <ul className="space-y-2.5 mb-8 text-xs sm:text-sm">
                        {p.perks.map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 text-emerald-700 shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-slate-700 font-medium">{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-5 space-y-2.5">
                      <Button
                        onClick={() => nav(`/subscribe?plan=${p.id}`)}
                        className={`w-full h-12 px-3 rounded-full text-xs font-black active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap ${
                          p.is_pro
                            ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25"
                            : p.featured
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        <span>Choose {p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Button>

                      <Link
                        to={p.route}
                        className={`w-full h-12 px-3 rounded-full text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 shadow-2xs ${
                          p.is_pro
                            ? "border-blue-600 bg-blue-50 text-blue-900 hover:bg-blue-100"
                            : p.featured
                            ? "border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
                            : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <span>Explore {p.name === "Dukaan Pro" ? "Pro Plan" : `${p.name} Plan`}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>
                    </div>

                  </div>
                </Card3D>
              ))}
            </div>
          )}

          {/* =========================================================
              DEDICATED MOBILE PRICING CARDS (lg:hidden)
              PROPER MOBILE-FIRST DESIGN WITH LARGE TOUCH BUTTONS
          ========================================================= */}
          <div className="lg:hidden space-y-4">
            {ALL_PLANS.map((p) => (
              <div 
                key={p.id}
                className={`rounded-2xl p-5 border-2 relative bg-white shadow-md ${
                  p.is_pro
                    ? "border-blue-600 ring-2 ring-blue-500/20"
                    : p.featured
                    ? "border-amber-400 ring-2 ring-amber-400/20"
                    : "border-slate-200"
                }`}
              >
                {/* Mobile Plan Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-black text-slate-400">
                        {p.name} PLAN
                      </span>
                      {p.featured && (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          ★ Popular
                        </span>
                      )}
                      {p.is_pro && (
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5 text-amber-300" /> Flagship
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-base font-black text-slate-900 mt-0.5">
                      {p.tagline}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="font-sans text-2xl font-black text-slate-950">₹{p.price}</span>
                      <span className="text-[10px] font-bold text-slate-500">/mo</span>
                    </div>
                    {p.discount && (
                      <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded inline-block">
                        {p.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-3 h-px w-full bg-slate-100" />

                {/* Mobile Perks list */}
                <ul className="space-y-2 mb-4 text-xs text-slate-700 font-medium">
                  {p.perks.slice(0, 4).map((perk, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="rounded-full p-0.5 bg-emerald-100 text-emerald-700 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="truncate">{perk}</span>
                    </li>
                  ))}
                </ul>

                {/* Mobile Proper Touch Buttons (48px+ touch targets) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <Button
                    onClick={() => nav(`/subscribe?plan=${p.id}`)}
                    className={`w-full h-13 rounded-2xl text-sm font-black shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                      p.is_pro
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20"
                        : p.featured
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Choose {p.name} (₹{p.price}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Link
                    to={p.route}
                    className="w-full h-12 rounded-2xl text-xs font-bold border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 flex items-center justify-center gap-1.5 active:scale-98 text-center"
                  >
                    <span>Explore Full {p.name} Page</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>

              </div>
            ))}
          </div>

          {/* DUKAAN PRO STUDIO LUXURY SPOTLIGHT BANNER */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" /> Design Suite Included with Dukaan Pro (₹499/mo)
                </div>
                <h3 className="font-sans font-black text-2xl sm:text-4xl text-white tracking-tight">
                  Design Your Store Receipts with Dukaan Pro Studio
                </h3>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Stop printing dull white slips. Upload your Kirana logo, print dynamic UPI QR codes directly on bills, choose from 5 brand color themes, and test Virtual Voice Soundbox announcements in 5 Indian languages.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> 58mm & 80mm Customizer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Store Logo & UPI QR
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Virtual Voice Soundbox
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center">
                <Link
                  to="/pro-studio"
                  className="h-14 sm:h-15 px-8 sm:px-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2.5 transition-all active:scale-95"
                >
                  <Sliders className="w-5 h-5 text-slate-950" />
                  <span>Explore Pro Studio Suite</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>

                <Link
                  to="/subscribe?plan=pro"
                  className="h-14 sm:h-15 px-8 sm:px-10 rounded-full bg-white hover:bg-slate-100 text-blue-950 font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Unlock Studio (1+1 Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          SECTION 3: PEAN RETAIL ARCHITECTURE (FEATURES)
      ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6" id="features">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-black uppercase tracking-widest mb-4">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> The PEAN Retail Core
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-5xl text-slate-950 tracking-tight">
            Engineered for Modern Indian Stores
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            High performance, zero lag, and instant synchronization designed to handle demanding retail counter rushes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PEAN_FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <Card3D key={i} depth={15} glow={true} className="w-full">
                <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="font-sans font-black text-lg text-slate-950 mb-2">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{feat.body}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Available on:</span>
                    <span className="text-blue-700">{feat.plan}</span>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          SECTION 4: MASTER 4-TIER COMPARISON TABLE
      ========================================================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider mb-3">
            Clear Matrix
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
            Complete 4-Plan Feature Comparison
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Everything is transparent. Upgrade or downgrade anytime with zero loss of data.
          </p>
        </div>

        {/* Mobile 1-Tap Plan Selector (md:hidden - Zero horizontal scroll, super easy to use!) */}
        <div className="md:hidden space-y-4 mb-6">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Tap to Compare Plan
            </span>
          </div>

          {/* 4 Clean Touch Pills */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "starter", name: "Starter", price: "₹79", badge: "Essential" },
              { id: "business", name: "Business", price: "₹119", badge: "Popular" },
              { id: "premium", name: "Premium", price: "₹239", badge: "Multi-Shop" },
              { id: "pro", name: "Dukaan Pro", price: "₹499", badge: "Flagship" }
            ].map((tab) => {
              const isSelected = mobileComparePlan === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileComparePlan(tab.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{tab.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    {tab.price}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Plan Details Card */}
          {(() => {
            const plan = ALL_PLANS.find(p => p.id === mobileComparePlan) || ALL_PLANS[1];
            return (
              <div className="p-5 rounded-3xl bg-white border-2 border-blue-600/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">PEAN RETAIL OS</span>
                    <h3 className="text-lg font-black text-slate-900">{plan.name} Plan</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">₹{plan.price}<span className="text-xs font-bold text-slate-500">/mo</span></div>
                    {plan.discount && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        {plan.discount}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {plan.tagline}
                </p>

                {/* Capabilities List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Included Capabilities:</div>
                  {plan.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 text-emerald-700 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* 2 Big Thumb Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Button
                    onClick={() => nav(`/subscribe?plan=${plan.id}`)}
                    className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Choose {plan.name} (₹{plan.price}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Link
                    to={plan.route}
                    className="w-full h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 active:scale-98 text-center"
                  >
                    <span>Explore Full {plan.name} Page</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Desktop Table View (Hidden on mobile, preserved 100% on desktop) */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-4 sm:px-6 font-bold text-slate-700">Capabilities</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-emerald-800 bg-emerald-50/40">Starter (₹79/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-amber-900 bg-amber-50/40">Business (₹119/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-indigo-900 bg-indigo-50/40">Premium (₹239/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-black text-blue-900 bg-blue-50/50">Dukaan Pro (₹499/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">POS Fast Checkout</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold bg-emerald-50/20">Unlimited</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Unlimited + Priority</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Inventory & Barcodes</td>
                  <td className="py-3.5 px-3 sm:px-4 text-emerald-700 font-bold bg-emerald-50/20">Basic Catalog</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-amber-800">Advanced + Print</td>
                  <td className="py-3.5 px-3 sm:px-4">Advanced + Print</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">AI Velocity Predictor</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Khata & WhatsApp Reminders</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">Manual</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-amber-800">1-Tap WhatsApp + UPI</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-indigo-800">1-Tap WhatsApp + Auto</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Auto Reminders</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Multi-Shop Headquarter</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">1 Counter</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-500">1 Shop</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-indigo-800">Up to 3 Branches</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Unlimited Branches</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">FY CA Tax & Profit Audit</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-indigo-800">GSTR-1 & 3B Export</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Full Audit + Export</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Staff Cashier PIN Security</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">4-Digit Master PIN</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Shift F9 Drawer Handover</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Instant F9 Slip</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Virtual Voice Soundbox</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">5 Languages Built-in</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Dukaan Pro Studio Access</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-emerald-50/20">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 font-bold text-blue-700 bg-blue-50/20">Full Suite Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-950">Dedicated Action</td>
                  <td className="py-3.5 px-3 sm:px-4 bg-emerald-50/20">
                    <Link to="/starter-plan" className="text-emerald-800 font-black hover:underline">Explore Starter →</Link>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4">
                    <Link to="/business-plan" className="text-amber-900 font-black hover:underline">Explore Business →</Link>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4">
                    <Link to="/premium-plan" className="text-indigo-900 font-black hover:underline">Explore Premium →</Link>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 bg-blue-50/20">
                    <Link to="/pro-plan" className="text-blue-700 font-black hover:underline">Explore Pro →</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: PEAN ENTERPRISE CLOUD ARCHITECTURE
      ========================================================= */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-widest mb-4">
              <Server className="w-3.5 h-3.5 text-blue-600" /> PEAN Core Engine Reliability
            </div>
            <h2 className="font-sans font-black text-3xl sm:text-5xl text-slate-950 tracking-tight">
              Enterprise Grade Cloud Resilience
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              Never worry about system crashes, internet drops, or lost receipts.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "99.99% Uptime",
                desc: "High-availability multi-region cluster keeps your cash counter active around the clock.",
                icon: Cloud
              },
              {
                title: "Offline-First POS",
                desc: "Internet went down? Continue billing offline seamlessly; orders sync when reconnected.",
                icon: Zap
              },
              {
                title: "AES-256 Encryption",
                desc: "All financial ledgers and customer khata records are encrypted with banking-grade security.",
                icon: Shield
              },
              {
                title: "Instant Device Sync",
                desc: "Change a price or add an item on your laptop; it reflects across all shop terminals in 0.2s.",
                icon: RotateCcw
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 6: FAQS
      ========================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6" id="faq">
        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-600 text-sm">Clear answers for modern Indian shop owners.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="bg-white rounded-2xl border border-slate-200 px-6 shadow-2xs">
              <AccordionTrigger className="text-left font-bold text-base py-5 text-slate-900 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-sm whitespace-pre-line">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* =========================================================
          SECTION 7: FINAL HIGH-IMPACT PEAN CTA BANNER
      ========================================================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-[40px] bg-gradient-to-b from-blue-700 via-blue-800 to-slate-950 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden text-center">
          
          <div className="w-16 h-16 rounded-3xl bg-white/15 border border-white/30 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Sparkles className="w-9 h-9 fill-amber-300 text-amber-300" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-bold uppercase mb-4">
            PEAN RETAIL OS · LAUNCH PROMOTION
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-5xl tracking-tight text-white max-w-3xl mx-auto">
            Scale Your Counter Today with Dukaan by PEAN.
          </h2>

          <p className="text-blue-100 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed font-normal">
            Join thousands of modern Kirana and retail stores across India. 
            Start billing in under 2 minutes with zero setup fee!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => nav("/app")}
              className="w-full sm:w-auto h-15 sm:h-16 px-10 sm:px-12 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-400/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <span>Launch Dukaan Now</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Button>

            <Link
              to="/pro-plan"
              className="w-full sm:w-auto h-15 sm:h-16 px-9 sm:px-11 rounded-full bg-white hover:bg-slate-100 text-blue-950 font-black text-base sm:text-lg shadow-md transition-all flex items-center justify-center gap-2.5"
            >
              <span>Explore Dukaan Pro (1+1 Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================
          FOOTER (A PRODUCT BY PEAN SYSTEM - CLEAN 4-COLUMN GRID)
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white pt-12 sm:pt-16 pb-24 lg:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-200">
            
            {/* Col 1 (Span 2): Brand & PEAN Ecosystem */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Dukaan" className="h-9 w-auto object-contain" />
                <div className="flex flex-col border-l border-slate-200 pl-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
                  <span className="text-xs font-black tracking-tight text-slate-950 leading-tight">PEAN</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 max-w-sm font-normal leading-relaxed">
                The high-performance Operating System for Indian Retail. Built with sub-2s offline-first POS billing, WhatsApp Khata, multi-counter sync, and thermal receipt studios.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>99.9% Uptime SLA</span>
                </span>
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Direct Merchant Helpline: <span className="font-bold text-slate-900">7016430577</span> · officialdukaan.in
              </div>
            </div>

            {/* Col 2: Retail Plans */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                Retail Plans
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li>
                  <Link to="/starter-plan" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Starter Plan</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">₹79</span>
                  </Link>
                </li>
                <li>
                  <Link to="/business-plan" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Business Plan</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">₹119</span>
                  </Link>
                </li>
                <li>
                  <Link to="/premium-plan" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Premium Plan</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.2 rounded">₹239</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pro-plan" className="hover:text-blue-600 transition-colors flex items-center justify-between font-bold text-blue-700">
                    <span>Dukaan Pro (1+1 Free)</span>
                    <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">₹499</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pro-studio" className="hover:text-purple-700 transition-colors flex items-center justify-between text-purple-700 font-bold">
                    <span>Dukaan Pro Studio</span>
                    <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded uppercase">Included</span>
                  </Link>
                </li>
                <li className="pt-1">
                  <a href="#pricing" className="text-xs font-bold text-blue-600 hover:underline">
                    Compare All Plans →
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Platform & Features */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Sub-2s Fast POS</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Khata & WhatsApp Reminders</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Multi-Shop HQ Central</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Thermal Designer & Soundbox</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition-colors">CA Audit & GST Reports</a></li>
                <li><a href="#faq" className="hover:text-blue-600 transition-colors">Frequently Asked Questions</a></li>
              </ul>
            </div>

            {/* Col 4: Support & Legal */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                Company & Legal
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600">
                <li>
                  <Link to="/careers" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold text-blue-600">
                    <span>Careers</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">Hiring 🚀</span>
                  </Link>
                </li>
                <li><Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-blue-600 transition-colors">Refund Policy</Link></li>
                <li><a href="#faq" className="hover:text-blue-600 transition-colors">Support & Help Desk</a></li>
                <li><a href="mailto:support@officialdukaan.in" className="hover:text-blue-600 transition-colors">Email Support</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Identity Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>© 2026 Dukaan · A Flagship Product by PEAN. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
              <span>for Indian Retailers & Vyaparis</span>
            </div>
          </div>

        </div>
      </footer>

      {/* =========================================================
          MOBILE STICKY ACTION BAR (PEAN RETAIL OS)
          Comfortable 44px thumb controls for effortless mobile use
      ========================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 shadow-2xl flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo.png" alt="Dukaan" className="h-7 w-auto object-contain shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-slate-900 leading-tight truncate">PEAN Retail OS</span>
            <span className="text-[9px] font-bold text-emerald-700 leading-none">Starting ₹79/mo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:7016430577"
            aria-label="Call Helpline"
            className="h-11 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 active:scale-95 shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call</span>
          </a>
          <Button
            onClick={() => nav("/app")}
            className="h-11 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-500/25 flex items-center gap-1.5 active:scale-95"
          >
            <span>Open App</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
