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
  Monitor,
  Clock,
  Laptop,
  Briefcase,
  Menu,
  X,
  Phone,
  HelpCircle,
  LogIn,
  UserPlus,
  Rocket,
  Crown,
  Sliders
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import InstallAppButton from "@/components/InstallAppButton";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";
import DukaanProInstagramCards from "@/components/landing/DukaanProInstagramCards";
import DukaanProShowcase from "@/components/landing/DukaanProShowcase";
import useButterSmoothScroll from "@/lib/useButterSmoothScroll";

const FEATURES = [
  { 
    icon: Receipt, 
    title: "Smart Billing (POS)", 
    body: "Lightning fast billing for Cash, UPI, and Udhaar. Instant receipt generation and auto-resetting cart.",
    badge: "Under 2s per bill"
  },
  { 
    icon: Package, 
    title: "Inventory & Stock", 
    body: "Live stock tracking, low-stock warnings, purchase price margins, and unlimited-stock mode.",
    badge: "Real-time updates"
  },
  { 
    icon: Bell, 
    title: "Instant Stock Alerts", 
    body: "Never run out of essential Kirana items. Automatic alerts when stock drops below threshold.",
    badge: "Smart thresholds"
  },
  { 
    icon: Users, 
    title: "Customer Directory", 
    body: "Keep track of customer phone numbers, lifetime purchases, ledgers, and visit history.",
    badge: "Full purchase ledger"
  },
  { 
    icon: Wallet, 
    title: "Udhaar & WhatsApp", 
    body: "Send polite WhatsApp payment reminders with one tap. FIFO payment settlement and overdue tracking.",
    badge: "1-Click WhatsApp"
  },
  { 
    icon: BarChart3, 
    title: "Business Reports", 
    body: "Daily, weekly, and monthly sales graphs, top-selling products, and profit insights.",
    badge: "Clear charts"
  },
];

const PLANS = [
  { 
    id: "starter",
    name: "Starter", 
    setup: 299, 
    price: 79, 
    originalPrice: 99,
    discount: "20% OFF",
    perks: [
      "Fast POS Billing & Invoices", 
      "Unlimited Products & Inventory", 
      "Order History & Basic Reports",
      "Standard Dashboard Access"
    ] 
  },
  { 
    id: "business",
    name: "Business", 
    setup: 499, 
    price: 119, 
    originalPrice: 149,
    discount: "20% OFF",
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
    id: "premium",
    name: "Premium", 
    setup: 999, 
    price: 239, 
    originalPrice: 299,
    discount: "20% OFF",
    perks: [
      "Everything in Business", 
      "Multi-Shop Headquarter Support", 
      "Full FY Tax & Profit Audit", 
      "GST Invoicing & Verification",
      "Priority Support & Soundbox"
    ] 
  },
  {
    id: "pro",
    name: "Dukaan Pro",
    setup: 0,
    price: 499,
    originalPrice: null,
    offerBadge: "1+1 Month Free",
    is_pro: true,
    perks: [
      "Everything in Premium",
      "Custom Billing & Invoices",
      "Custom Dashboard & Widgets",
      "Customize Everything",
      "Early Access to New Updates",
      "24/7 Dedicated Support"
    ]
  }
];

const FAQS = [
  { q: "What devices can run Dukaan?", a: "Dukaan Store Management & POS is built for desktop PCs, laptops, and counter billing terminals with keyboard shortcuts and thermal printer support. A dedicated mobile companion app is currently in design." },
  { q: "How does UPI payment collection work?", a: "Dukaan displays your shop's own UPI QR code directly on the counter screen. Customers scan and pay using any UPI app (GPay, PhonePe, Paytm). You confirm and the bill is generated." },
  { q: "What is Counter Mode?", a: "Counter Mode is a dedicated high-speed screen built for fast billing. It supports keyboard shortcuts F1-F6 so you can bill, check stock, and manage udhaar without ever touching a mouse." },
  { q: "Can I manage multiple shops?", a: "Yes. With Dukaan's multi-shop architecture, you can add and switch between multiple shop branches with a single tap." },
  { q: "Which languages are supported?", a: "English, हिन्दी (Hindi) and ગુજરાતી (Gujarati). You can toggle the language instantly from the top menu bar." },
];

const reveal = { hidden: { opacity: 0, y: 32, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } };

function Reveal({ children, className = "", id }) {
  return (
    <motion.div id={id} className={className} variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.16 }}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  // Activate Apple / Ather style butter-smooth momentum scroll
  useButterSmoothScroll(true);

  const nav = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Announcement from Admin Panel
  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem("dukaan_platform_announcement") || "🚀 Dukaan Store Management: Seamlessly access your billing counter across PC, Laptop, and Mobile devices!";
  });

  // Landing Page Maintenance Mode & Countdown (Cloud Synchronized)
  const [landingMaintenance, setLandingMaintenance] = useState(() => {
    try {
      const raw = localStorage.getItem("dukaan_landing_maintenance");
      if (raw) return JSON.parse(raw);
    } catch {}
    return { enabled: false, ends_at: null, message: "", title: "Under Scheduled Maintenance" };
  });

  const [maintenanceRemaining, setMaintenanceRemaining] = useState(() => {
    if (!landingMaintenance?.enabled || !landingMaintenance?.ends_at) return 0;
    return Math.max(0, Math.floor((new Date(landingMaintenance.ends_at).getTime() - Date.now()) / 1000));
  });

  // Fetch live maintenance and announcement from Cloud API on mount & poll every 8 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchLiveMaintenance = async () => {
      try {
        const res = await api.get("/platform/landing-maintenance").catch(() => null);
        if (!isMounted) return;
        if (res?.data?.landing_maintenance) {
          setLandingMaintenance(res.data.landing_maintenance);
          localStorage.setItem("dukaan_landing_maintenance", JSON.stringify(res.data.landing_maintenance));
        }
        if (res?.data?.announcement !== undefined && res.data.announcement !== null) {
          setAnnouncement(res.data.announcement);
          localStorage.setItem("dukaan_platform_announcement", res.data.announcement);
        }
      } catch (_) {}
    };

    fetchLiveMaintenance();
    const interval = setInterval(fetchLiveMaintenance, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const syncSettings = () => {
      const ann = localStorage.getItem("dukaan_platform_announcement");
      if (ann !== null) setAnnouncement(ann);
      try {
        const maintRaw = localStorage.getItem("dukaan_landing_maintenance");
        if (maintRaw) {
          const parsed = JSON.parse(maintRaw);
          setLandingMaintenance(parsed);
        }
      } catch {}
    };
    window.addEventListener("storage", syncSettings);
    return () => window.removeEventListener("storage", syncSettings);
  }, []);

  useEffect(() => {
    if (!landingMaintenance?.enabled || !landingMaintenance?.ends_at) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(landingMaintenance.ends_at).getTime() - Date.now()) / 1000));
      setMaintenanceRemaining(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [landingMaintenance?.enabled, landingMaintenance?.ends_at]);

  // If maintenance mode is active (whether countdown is ticking or static lockdown)
  if (landingMaintenance?.enabled) {
    const hasCountdown = Boolean(landingMaintenance.ends_at && maintenanceRemaining > 0);
    const mDays = Math.floor(maintenanceRemaining / 86400);
    const mHours = Math.floor((maintenanceRemaining % 86400) / 3600);
    const mMins = Math.floor((maintenanceRemaining % 3600) / 60);
    const mSecs = maintenanceRemaining % 60;

    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-8 relative selection:bg-brand-terracotta selection:text-white">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Dukaan" className="h-9 sm:h-11 w-auto object-contain" />
            <div className="flex flex-col border-l border-slate-300 pl-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
              <span className="text-xs font-display font-extrabold tracking-tight text-slate-900 leading-tight">PEAN</span>
            </div>
          </Link>
          <Link
            to="/app"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 shadow-xs"
          >
            Merchant & Admin Login →
          </Link>
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto text-center py-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-orange-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Scheduled Platform Maintenance</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {landingMaintenance.title || "We'll Be Back In A Few Moments"}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            {landingMaintenance.message || "We are upgrading Dukaan systems with lightning-fast cloud synchronization. Your billing counter will resume automatically."}
          </p>

          {/* Live Countdown Clock Cards */}
          {hasCountdown ? (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto pt-4">
              {[
                { label: "DAYS", val: String(mDays).padStart(2, "0") },
                { label: "HOURS", val: String(mHours).padStart(2, "0") },
                { label: "MINS", val: String(mMins).padStart(2, "0") },
                { label: "SECS", val: String(mSecs).padStart(2, "0") }
              ].map((c) => (
                <div key={c.label} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm text-center">
                  <div className="font-mono text-2xl sm:text-4xl font-black text-slate-900">{c.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{c.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Core Platform Upgrade in Progress · Resuming Soon</span>
            </div>
          )}

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              className="w-full sm:w-auto px-6 h-11 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" /> Go to Merchant Portal
            </Link>
            <button
              onClick={async () => {
                try {
                  const r = await api.get("/platform/landing-maintenance");
                  if (r?.data?.landing_maintenance?.enabled === false) {
                    setLandingMaintenance(r.data.landing_maintenance);
                    window.location.reload();
                    return;
                  }
                } catch (_) {}
                window.location.reload();
              }}
              className="w-full sm:w-auto px-5 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm"
            >
              Check Live Status
            </button>
          </div>
        </main>

        <footer className="max-w-4xl mx-auto w-full text-center pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
          <span>officialdukaan.in</span>
          <span>Safe Cloud Ledger · 100% Data Protection Guaranteed</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sand text-brand-indigo noise relative overflow-x-clip">
      
      {/* 3D Ambient Depth Canvas Background */}
      <ThreeDBackground />

      {/* =========================================================
          TOP ANNOUNCEMENT BAR: CLOUD POS & STORE MANAGEMENT (ADMIN CONTROLLED - PURE WHITE THEME)
      ========================================================= */}
      {announcement && (
        <div className="bg-white border-b border-slate-200 text-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 text-center shadow-xs z-50 relative">
          <span className="bg-brand-terracotta text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shrink-0 shadow-2xs">
            Notice
          </span>
          <span className="text-slate-700 font-semibold">
            {announcement}
          </span>
        </div>
      )}

      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-xl border-b border-brand-mitti shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & by PEAN tag */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group" data-testid="landing-logo">
            <img src="/logo.png" alt="Dukaan" className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="hidden sm:flex flex-col border-l border-brand-mitti pl-2.5 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-indigo/40 font-mono leading-none">by</span>
              <span className="text-xs font-display font-extrabold tracking-tight text-brand-indigo leading-tight">PEAN</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Clean spacing, zero overlap) */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-xs xl:text-sm font-semibold text-brand-indigo/80 shrink-0">
            <a href="#dukaan-pro" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 whitespace-nowrap font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-3 py-1 rounded-full shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-blue-600" />
              <span>Pro & Studio</span>
              <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">New</span>
            </a>
            <a href="#features" className="hover:text-brand-terracotta transition-colors whitespace-nowrap">Features</a>
            <a href="#pricing" className="hover:text-brand-terracotta transition-colors whitespace-nowrap">Pricing</a>
            <a href="#faq" className="hover:text-brand-terracotta transition-colors whitespace-nowrap">FAQ</a>
            <Link to="/careers" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Hiring</span>
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">2</span>
            </Link>
            <Link to="/mobile" className="text-[#0066FF] font-bold hover:text-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap">
              <Smartphone className="w-3.5 h-3.5" />
              <span>App</span>
            </Link>
          </nav>

          {/* Right Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Hiring Badge on Tablets / Mobile */}
            <Link 
              to="/careers" 
              className="inline-flex lg:hidden items-center gap-1 text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-full transition-colors shrink-0 shadow-2xs"
            >
              <Briefcase className="w-3 h-3 text-blue-600" />
              <span className="hidden xs:inline">Hiring</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            </Link>

            <Button 
              onClick={() => nav("/login")} 
              variant="ghost"
              className="hidden xl:inline-flex text-brand-indigo hover:text-brand-terracotta rounded-full px-3.5 h-10 text-xs font-bold transition-all"
            >
              Log in
            </Button>
            <Button 
              onClick={() => nav("/register")} 
              variant="outline"
              className="hidden md:inline-flex border-brand-indigo/25 text-brand-indigo hover:bg-brand-indigo/5 rounded-full px-3.5 h-10 text-xs font-bold transition-all"
            >
              Sign Up Free
            </Button>
            <Button 
              onClick={() => nav("/app")} 
              data-testid="cta-open-app" 
              className="bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-full px-3.5 sm:px-5 h-9 sm:h-11 text-xs sm:text-sm font-bold active:scale-95 transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Open Dukaan</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden p-2 sm:p-2.5 rounded-2xl bg-brand-indigo/5 hover:bg-brand-indigo/10 text-brand-indigo active:scale-95 transition-all border border-brand-indigo/10 flex items-center justify-center shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-brand-indigo" /> : <Menu className="w-5 h-5 text-brand-indigo" />}
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
              className="lg:hidden border-b border-brand-mitti/80 bg-white/98 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-5 space-y-4 max-w-lg mx-auto">
                
                {/* 1. We're Hiring Banner */}
                <Link
                  to="/careers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/5 border border-blue-200 text-blue-900 group hover:border-blue-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">We're Hiring</span>
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">2 Roles Open</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Field Sales & Social Media · Check Status / Apply
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                {/* Mobile App Banner in Drawer */}
                <Link
                  to="/mobile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/5 border border-blue-200 text-blue-900 group hover:border-blue-400 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-md shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">Dukaan Mobile App</span>
                        <span className="bg-[#0066FF] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">New POS</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Billing, Stock, Khata & Reports on Mobile
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0066FF] group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>

                {/* 2. Navigation Quick Grid */}
                <div className="grid grid-cols-2 gap-2.5">


                  <a
                    href="#dukaan-pro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-blue-950 flex items-center gap-1">
                        <span>Pro & Studio</span>
                        <span className="text-[9px] bg-blue-600 text-white font-black px-1 rounded-sm">NEW</span>
                      </div>
                      <div className="text-[10px] text-blue-700/70 font-medium">Custom Invoices & PIN</div>
                    </div>
                  </a>


                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-brand-sand/50 hover:bg-brand-sand border border-brand-mitti/40 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-brand-indigo shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-brand-indigo">Features</div>
                      <div className="text-[10px] text-brand-indigo/60 font-medium">Billing, Stock, Khata</div>
                    </div>
                  </a>

                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-brand-sand/50 hover:bg-brand-sand border border-brand-mitti/40 flex items-center gap-2.5 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-brand-indigo shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-brand-indigo">Pricing Plans</div>
                      <div className="text-[10px] text-brand-indigo/60 font-medium">From ₹79/mo</div>
                    </div>
                  </a>
                </div>

                {/* 3. Helper Links (FAQ & Salary Helpline) */}
                <div className="pt-2 border-t border-brand-mitti/40 flex items-center justify-between text-xs font-semibold text-brand-indigo/70">
                  <a
                    href="#faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-brand-terracotta flex items-center gap-1.5 py-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-brand-indigo/50" />
                    <span>Frequently Asked Questions</span>
                  </a>

                  <a
                    href="tel:7016430577"
                    className="hover:text-blue-600 text-blue-600 flex items-center gap-1 py-1 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>HR: 7016430577</span>
                  </a>
                </div>

                {/* 4. Action Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        nav("/login");
                      }}
                      variant="outline"
                      className="w-full rounded-xl border-brand-indigo/20 text-brand-indigo font-bold text-xs h-11"
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1" />
                      <span>Log in</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        nav("/register");
                      }}
                      variant="outline"
                      className="w-full rounded-xl border-brand-indigo/20 text-brand-indigo font-bold text-xs h-11"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      <span>Sign Up Free</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      nav("/app");
                    }}
                    className="w-full h-12 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Launch Dukaan Store</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-center text-[11px] text-brand-indigo/60 font-medium">
                    🖥️ Counter Dashboard requires Desktop / Laptop
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================
          HERO SECTION (3D Interactive Kiosk)
      ========================================================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-10 md:pt-16 pb-14 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left: Value Proposition matching Instagram Campaign */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} 
          className="lg:col-span-6"
        >
          {/* Badges from Instagram Poster */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Now Available</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-blue-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Trusted by Small Businesses Across India</span>
            </div>
          </div>

          {/* Big Headline */}
          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-[4.25rem] leading-[1.06] tracking-tight text-slate-900">
            Take Your Business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative inline-block">
              Further.
              <span className="absolute left-0 bottom-1 w-full h-3 bg-blue-200/50 rounded-full -z-10" />
            </span>
          </h1>

          {/* Supporting Text */}
          <div className="mt-4 max-w-lg leading-relaxed">
            <div className="text-blue-700 font-extrabold text-lg sm:text-xl tracking-tight mb-1.5">
              More Power. More Possibilities.
            </div>
            <p className="text-base text-slate-600 font-normal">
              Effortless billing, stock, and khata ledger — now turbocharged with the all-new <strong>Dukaan Pro Plan</strong> and <strong>Dukaan Pro Studio</strong> for custom branded receipts, cashier Master PIN protection, and live voice soundbox.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-wrap gap-3.5 items-center">
            <Link 
              to="/subscribe?plan=pro" 
              className="h-13 sm:h-14 px-7 sm:px-8 text-sm sm:text-base rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold active:scale-95 transition-all shadow-glow flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Get Dukaan Pro (₹499)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a 
              href="#dukaan-pro"
              className="h-13 sm:h-14 px-6 sm:px-7 text-sm sm:text-base rounded-full border-2 border-blue-200 hover:border-blue-600 bg-white hover:bg-blue-50/50 text-blue-700 font-bold active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Dukaan Pro Studio ↓</span>
            </a>

            <Link 
              to="/app"
              className="h-13 sm:h-14 px-5 text-xs sm:text-sm rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 font-bold active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>Launch Store</span>
            </Link>
          </div>

          {/* Trust Points */}
          <div className="mt-7 flex items-center gap-3 sm:gap-4 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1.5 text-blue-800">
              <Crown className="w-3.5 h-3.5 text-blue-600" /> Pro Plan (1+1 Month Free)
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Sliders className="w-3.5 h-3.5 text-blue-600" /> Dukaan Pro Studio Included
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Setup Fee
            </span>
          </div>
        </motion.div>

        {/* Right: Instagram 3D Stage Cards (Dukaan Pro Plan & Dukaan Pro Studio) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 25 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} 
          className="lg:col-span-6 flex justify-center"
        >
          <DukaanProInstagramCards />
        </motion.div>

      </section>

      {/* =========================================================
          DUKAAN PRO & DUKAAN PRO STUDIO FLAGSHIP SHOWCASE
      ========================================================= */}
      <DukaanProShowcase />

      {/* =========================================================
          3D FEATURES GRID
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-6xl px-5 py-24 border-t border-brand-mitti" id="features">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-4">
            <Layers className="w-3.5 h-3.5" /> Complete Business Toolkit
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-brand-indigo">
            Everything your Dukaan needs
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-indigo/70">
            Simple enough for any shop owner. Powerful enough to manage your entire business.
          </p>
        </div>

        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body, badge }) => (
            <Card3D key={title} depth={18} glow={true} className="w-full">
              <div className="bg-white rounded-3xl border-2 border-brand-mitti p-8 shadow-3d-card hover:border-brand-indigo/30 transition-colors h-full flex flex-col justify-between preserve-3d">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-sand border border-brand-mitti flex items-center justify-center text-brand-indigo shadow-xs translate-z-20">
                      <Icon className="w-7 h-7 text-brand-terracotta" />
                    </div>
                    <span className="text-[11px] font-bold text-brand-indigo/60 bg-brand-sand px-2.5 py-1 rounded-full border border-brand-mitti">
                      {badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-brand-indigo mb-3 translate-z-10">
                    {title}
                  </h3>
                  <p className="text-sm text-brand-indigo/70 leading-relaxed">
                    {body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-mitti/60 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card3D>
          ))}
        </motion.div>
      </Reveal>

      {/* =========================================================
          PRICING SECTION (3D ELEVATED CARDS)
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-7xl px-5 py-24 border-t border-brand-mitti" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-4">
            Transparent Indian Pricing
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-brand-indigo">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-indigo/70">
            Start with our generous free trial. Upgrade only when your Dukaan grows.
          </p>
        </div>

        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((p) => (
            <Card3D 
              key={p.name} 
              depth={p.is_pro ? 24 : p.featured ? 22 : 12} 
              glow={true} 
              className="w-full"
            >
              <div 
                className={`rounded-3xl p-6 sm:p-7 border-2 shadow-3d-card relative flex flex-col justify-between h-full preserve-3d ${
                  p.is_pro
                    ? "bg-gradient-to-b from-amber-50/90 via-white to-amber-50/40 text-brand-indigo border-2 border-amber-400 shadow-xl ring-2 ring-amber-400/25"
                    : p.featured 
                    ? "bg-white text-slate-900 border-2 border-brand-terracotta shadow-xl ring-2 ring-brand-terracotta/20" 
                    : "bg-white text-brand-indigo border-brand-mitti"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-terracotta text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md translate-z-30 flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}
                {p.is_pro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md translate-z-30 flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Flagship Plan
                  </div>
                )}

                <div>
                  <div className={`text-xs uppercase tracking-widest font-extrabold ${p.is_pro ? "text-amber-800" : "text-brand-terracotta"}`}>
                    {p.name} PLAN
                  </div>

                  <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                    <span className="font-display text-4xl sm:text-5xl font-extrabold text-brand-indigo">₹{p.price}</span>
                    {p.originalPrice && (
                      <span className="text-base line-through text-slate-400 font-semibold">₹{p.originalPrice}</span>
                    )}
                    <span className={`text-xs font-semibold ${p.is_pro ? "text-amber-900/60" : p.featured ? "text-slate-500" : "text-brand-indigo/50"}`}>/month</span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {p.discount && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {p.discount}
                      </span>
                    )}
                    {p.offerBadge && (
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                        {p.offerBadge}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium ${p.is_pro ? "text-amber-900/70 font-semibold" : p.featured ? "text-slate-500" : "text-brand-indigo/50"}`}>
                      {p.setup > 0 ? `+ ₹${p.setup} setup` : "Zero setup fee"}
                    </span>
                  </div>

                  <div className={`my-5 h-px w-full ${p.is_pro ? "bg-amber-200" : p.featured ? "bg-slate-200" : "bg-brand-mitti"}`} />

                  <ul className="space-y-3 mb-8">
                    {p.perks.map((x) => (
                      <li key={x} className="flex items-start gap-2.5">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${p.is_pro ? "bg-amber-100 text-amber-800 border border-amber-300" : p.featured ? "bg-brand-leaf/15 text-brand-leaf" : "bg-brand-leaf/10 text-brand-leaf"}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium ${p.is_pro ? "text-slate-800" : p.featured ? "text-slate-700" : "text-brand-indigo/80"}`}>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
                  <Button 
                    onClick={() => nav(`/subscribe?plan=${(p.id || p.name).toLowerCase()}`)} 
                    data-testid={`price-cta-${(p.id || p.name).toLowerCase()}`} 
                    className={`w-full h-12 rounded-full text-sm font-bold active:scale-95 transition-all shadow-md ${
                      p.is_pro
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black shadow-amber-500/20"
                        : p.featured 
                        ? "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white" 
                        : "bg-brand-sand border-2 border-brand-mitti hover:border-brand-indigo text-brand-indigo"
                    }`}
                  >
                    Choose {p.name}
                  </Button>
                </div>
              </div>
            </Card3D>
          ))}
        </motion.div>
      </Reveal>

      {/* =========================================================
          FAQ SECTION
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-4xl px-5 py-24 border-t border-brand-mitti" id="faq">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl text-brand-indigo">Frequently Asked Questions</h2>
          <p className="mt-3 text-base text-brand-indigo/70">Clear answers for shop owners.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} className="bg-white rounded-2xl border-2 border-brand-mitti px-6 overflow-hidden shadow-xs">
              <AccordionTrigger data-testid={`faq-${i}`} className="text-left font-semibold text-base py-5 text-brand-indigo hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-brand-indigo/75 pb-5 leading-relaxed text-sm">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      {/* =========================================================
          FINAL 3D CTA BANNER
      ========================================================= */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <Card3D depth={14} glow={true} className="w-full">
          <div className="bg-white text-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-xl border-2 border-slate-200 preserve-3d">
            
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Start in 30 Seconds
              </div>

              <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-tight text-slate-900">
                Everything your Dukaan needs. <br />
                <span className="text-brand-terracotta">In one place.</span>
              </h2>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed font-medium">
                Join thousands of modern shops across India managing billing, inventory, and udhaar effortlessly.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => nav("/app")} 
                  className="h-14 px-10 text-lg rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold active:scale-95 transition-all shadow-md flex items-center gap-2"
                >
                  <span>Open Your Dukaan</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <InstallAppButton variant="outline" className="h-14 px-8 text-base rounded-full border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100" />
              </div>
            </div>

          </div>
        </Card3D>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-brand-mitti bg-white py-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/logo.png" alt="Dukaan" className="h-9 object-contain" />
          <div className="h-6 w-px bg-brand-mitti" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-indigo/80">
            <span className="text-brand-indigo/50 text-[10px] font-mono uppercase">A product of</span>
            <span className="font-display font-black text-sm tracking-tight text-brand-indigo">PEAN</span>
          </div>
        </div>
        <p className="text-xs text-brand-indigo/60 mb-6 font-medium">Run Your Dukaan. Smarter.</p>
        <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7 mb-8 text-sm font-medium">
          <a href="#dukaan-pro" className="text-blue-700 font-bold hover:text-blue-800 transition-colors">Dukaan Pro & Studio</a>
          <a href="#features" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Features</a>
          <a href="#pricing" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Pricing Plans</a>
          <a href="#faq" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">FAQ</a>
          <Link to="/subscribe" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Buy Subscription</Link>
          <Link to="/careers" className="text-blue-600 font-bold hover:underline transition-colors">Careers (We're Hiring 🚀)</Link>
          <Link to="/privacy-policy" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Privacy Policy</Link>
          <Link to="/refund-policy" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Refund Policy</Link>
        </div>
        <div className="text-xs text-brand-indigo/60 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-brand-terracotta fill-brand-terracotta inline" />
            <span>for Indian Small Businesses</span>
          </span>
          <span className="hidden sm:inline text-brand-indigo/30">·</span>
          <span>© 2026 Dukaan · A Product of PEAN · All rights reserved</span>
        </div>
      </footer>

    </div>
  );
}
