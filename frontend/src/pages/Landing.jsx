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
  Smartphone, 
  CheckCircle2, 
  Heart, 
  Clock, 
  Menu, 
  X, 
  Phone, 
  HelpCircle, 
  LogIn, 
  Crown, 
  Sliders, 
  Printer, 
  Building2, 
  Lock, 
  Volume2, 
  Share2, 
  FileText, 
  TrendingUp, 
  RotateCcw, 
  Shield, 
  Cloud, 
  ChevronRight, 
  ShoppingBag, 
  Plus, 
  Minus, 
  QrCode, 
  Banknote, 
  Star, 
  ArrowUpRight, 
  CheckCheck, 
  IndianRupee, 
  MessageCircle, 
  Laptop, 
  Tablet, 
  HardDrive
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import InstallAppButton from "@/components/InstallAppButton";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";
import { playVoiceSoundbox } from "@/lib/soundbox";
import useButterSmoothScroll from "@/lib/useButterSmoothScroll";

// 4 Official Subscription Plans
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For New & Single-Counter Stores",
    monthlyPrice: 79,
    originalMonthly: 99,
    yearlyPrice: 799,
    yearlyMonthlyEffective: 66,
    setupFee: 299,
    accentColor: "emerald",
    route: "/starter-plan",
    badge: "Essential",
    popular: false,
    perks: [
      "Sub-2s Fast POS Billing & Cart",
      "Unlimited Products & Inventory",
      "58mm & 80mm Thermal Receipts",
      "Standard Daily Sales Ledger",
      "Zero Hardware Lock-In (Any Device)"
    ]
  },
  {
    id: "business",
    name: "Business",
    tagline: "For Busy Kiranas with Udhaar & Customers",
    monthlyPrice: 119,
    originalMonthly: 149,
    yearlyPrice: 1199,
    yearlyMonthlyEffective: 99,
    setupFee: 499,
    accentColor: "blue",
    route: "/business-plan",
    badge: "Most Popular",
    popular: true,
    perks: [
      "Everything in Starter",
      "Customer Khata Udhaar Ledger",
      "1-Tap WhatsApp Payment Reminders",
      "Dynamic UPI QR in WhatsApp Bills",
      "Automated Low-Stock Alerts",
      "Barcode Printing & Camera Scanning"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For Multi-Shop Chains & GST Retailers",
    monthlyPrice: 239,
    originalMonthly: 299,
    yearlyPrice: 2239,
    yearlyMonthlyEffective: 186,
    setupFee: 999,
    accentColor: "indigo",
    route: "/premium-plan",
    badge: "Multi-Shop HQ",
    popular: false,
    perks: [
      "Everything in Business",
      "Multi-Shop HQ (Up to 3 Branches)",
      "Full FY CA Tax & Profit Audit",
      "Official GST Invoicing (A4 & A5)",
      "Branch-Wise Cashier Staff Roles",
      "Priority WhatsApp Support (<15m)"
    ]
  },
  {
    id: "pro",
    name: "Dukaan Pro",
    tagline: "The Flagship Enterprise Retail Operating System",
    monthlyPrice: 499,
    originalMonthly: null,
    yearlyPrice: 4999,
    yearlyMonthlyEffective: 416,
    setupFee: 0,
    accentColor: "amber",
    route: "/pro-plan",
    badge: "Flagship Enterprise",
    popular: false,
    offerBadge: "1+1 Month Free",
    perks: [
      "Everything in Premium",
      "Dukaan Pro Studio Included (₹499 value)",
      "Cashier PIN Security (Mask Wholesale Rates)",
      "Shift Handover F9 Drawer Reconciliation",
      "Virtual Voice Soundbox (5 Indian Languages)",
      "AI Restock Run-Out Velocity Predictor",
      "24/7 VIP Dedicated Helpline"
    ]
  }
];

// Interactive Demo Catalog Items
const SIMULATOR_ITEMS = [
  { id: "p1", name: "Amul Butter 100g", price: 65, emoji: "🧈", category: "Dairy" },
  { id: "p2", name: "Fortune Oil 1L", price: 145, emoji: "🌻", category: "Pantry" },
  { id: "p3", name: "Maggi 2-Min Noodles", price: 14, emoji: "🍜", category: "Snacks" },
  { id: "p4", name: "Tata Tea Gold 250g", price: 135, emoji: "☕", category: "Beverages" }
];

// Retail Category Profiles
const RETAIL_CATEGORIES = [
  {
    id: "kirana",
    title: "Grocery & Kirana",
    icon: "🛒",
    tagline: "Fast checkout, Khata balance & loose items",
    features: [
      "1-Tap WhatsApp Udhaar reminders with QR",
      "Gram & kilogram loose pricing calculation",
      "Expiry date alerts for dairy & packaged goods"
    ],
    highlight: "Recover pending udhaar 3x faster without awkward phone calls"
  },
  {
    id: "garments",
    title: "Apparel & Garments",
    icon: "👗",
    tagline: "Size, color, barcode tags & exchange tracking",
    features: [
      "Barcode tag printing on standard thermal sheets",
      "Track inventory by Size (S, M, L, XL) & Color",
      "Easy 1-click customer exchange & store credit"
    ],
    highlight: "Scan clothing tags directly using your smartphone camera"
  },
  {
    id: "electronics",
    title: "Electronics & Mobile",
    icon: "📱",
    tagline: "Serial / IMEI numbers & GST invoices",
    features: [
      "Serial number & IMEI warranty tracking",
      "Professional A4 & A5 GST invoice printing",
      "Customer purchase history & service logs"
    ],
    highlight: "Print official GST tax invoices with HSN/SAC codes in 2 clicks"
  },
  {
    id: "pharmacy",
    title: "Pharmacy & Chemists",
    icon: "💊",
    tagline: "Batch tracking, expiry warnings & doctor notes",
    features: [
      "Strict batch number & expiry date management",
      "Substitute generic medicine lookup",
      "Doctor name & prescription memo tracking"
    ],
    highlight: "Zero expired stock loss with automated 30-day expiry notifications"
  },
  {
    id: "cafe",
    title: "Cafes & Bakeries",
    icon: "☕",
    tagline: "Order tokens, quick thermal KOT & UPI QR",
    features: [
      "Instant order token generation for kitchen",
      "Quick item modifier buttons (Extra Cheese, Sugar-Free)",
      "Dynamic UPI QR code on customer-facing screen"
    ],
    highlight: "Cut customer counter wait times by more than 60%"
  }
];

// Merchant Testimonials
const TESTIMONIALS = [
  {
    name: "Ramesh Patel",
    store: "Patel Superstore & Provisions",
    city: "Surat, Gujarat",
    avatar: "RP",
    rating: 5,
    text: "Pehle purane register me udhaar likhne me daily 2 ghante lagte the. Dukaan ke 1-Tap WhatsApp reminder se customers bina bole UPI se payment kar dete hain. Billing speed sach me 2 second ki hai!",
    plan: "Business Plan"
  },
  {
    name: "Vikas Sharma",
    store: "Sharma Garments & Hosiery",
    city: "Jaipur, Rajasthan",
    avatar: "VS",
    rating: 5,
    text: "Mujhe naya computer ya POS machine lene ki zaroorat nahi padi. Apne Android phone ke camera se barcode scan hota hai aur Bluetooth printer se 2 inch ka pakka bill nikal jata hai.",
    plan: "Starter Plan"
  },
  {
    name: "Anil Gupta",
    store: "Gupta Electronics & Mobile World",
    city: "New Delhi",
    avatar: "AG",
    rating: 5,
    text: "Dukaan Pro ka Virtual Voice Soundbox kamal hai. Counter par mobile me seedha Hindi me bolta hai ki payment mil gaya. 3 branches ka hisab ghar baithe dekh sakta hoon.",
    plan: "Dukaan Pro"
  }
];

// FAQs
const FAQS = [
  {
    q: "Kya mujhe koi naya computer ya mehengi machine kharidni padegi?",
    a: "Bilkul nahi! Dukaan aapke paas jo phone, tablet ya laptop hai usi par chalega. Phone camera se barcode scan hota hai aur kisi bhi standard Bluetooth ya USB printer se bill print ho jata hai."
  },
  {
    q: "Kaun-kaun se thermal receipt printers support hote hain?",
    a: "Dukaan sabhi 58mm (2-inch) aur 80mm (3-inch) thermal printers support karta hai — chahe Bluetooth ho, USB ho ya WiFi. Iske alawa standard A4/A5 laser/inkjet printers bhi support hain."
  },
  {
    q: "Agar dukaan me internet band ho jaye toh kya bill banega?",
    a: "Haan! Dukaan me offline mode built-in hai. Internet na hone par bhi aapka counter chalta rahega aur bill bante rahenge. Jaise hi internet aayega, sabhi bills cloud me auto-sync ho jayenge."
  },
  {
    q: "Customer ka Khata aur WhatsApp bill kaise kaam karta hai?",
    a: "Har customer ka ek digital Khata banta hai. Jab bhi wo udhaar ya cash leta hai, uske WhatsApp par itemized digital bill aur UPI QR chala jata hai. Ek click me polite reminder bheja ja sakta hai."
  },
  {
    q: "Kya mera dukaan ka data safe aur private rahega?",
    a: "100% safe. Aapka pura stock, sales aur customer data enterprise-grade 256-bit encryption ke sath cloud me secure rehta hai. Roz automated cloud backups hote hain taaki phone khone par bhi hisab surakshit rahe."
  },
  {
    q: "Kya Free Trial ke baad turant paise katenge?",
    a: "Nahi. Free trial lene ke liye koi credit card ya advance payment nahi chahiye. Aap pehle trial me counter chala kar dekhein, pasand aane par hi ₹79/month se shuru karein."
  }
];

export default function Landing() {
  const { user } = useAuth();
  const nav = useNavigate();
  useButterSmoothScroll(true);

  // States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("yearly"); // "monthly" | "yearly"
  const [selectedCategory, setSelectedCategory] = useState("kirana");
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Live POS Simulator State
  const [cart, setCart] = useState([
    { id: "p1", name: "Amul Butter 100g", price: 65, qty: 1, emoji: "🧈" },
    { id: "p3", name: "Maggi 2-Min Noodles", price: 14, qty: 2, emoji: "🍜" }
  ]);
  const [paymentMode, setPaymentMode] = useState("upi"); // "upi" | "cash" | "khata"
  const [billPrinted, setBillPrinted] = useState(false);
  const [soundboxLanguage, setSoundboxLanguage] = useState("hi");

  // ROI Calculator State
  const [dailyCustomers, setDailyCustomers] = useState(120);
  const [monthlyUdhaar, setMonthlyUdhaar] = useState(45000);

  // Scroll listener for sticky mobile conversion bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart helper functions
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setBillPrinted(false);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.qty + delta;
            return next > 0 ? { ...item, qty: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
    setBillPrinted(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleChargeBill = () => {
    if (cart.length === 0) return;
    setBillPrinted(true);
    playVoiceSoundbox(cartTotal, paymentMode, soundboxLanguage);
  };

  const activeCategoryData = RETAIL_CATEGORIES.find((c) => c.id === selectedCategory) || RETAIL_CATEGORIES[0];

  // Estimated ROI Calculations
  const hoursSavedMonthly = Math.round((dailyCustomers * 1.5 * 30) / 60);
  const fasterUdhaarRecovered = Math.round(monthlyUdhaar * 0.75);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* 3D Background Lighting */}
      <ThreeDBackground />

      {/* =========================================================
          1. TOP ANNOUNCEMENT BANNER
      ========================================================= */}
      <div className="relative z-30 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-[11px] sm:text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-xs">
        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          Offer
        </span>
        <span className="truncate max-w-[280px] sm:max-w-none">
          Special: 2 Months Free on Annual Plans + Zero Setup Assistance!
        </span>
        <a href="#pricing" className="underline font-bold hover:text-amber-300 hidden xs:inline ml-1 shrink-0">
          View Plans →
        </a>
      </div>

      {/* =========================================================
          2. STICKY MODERN GLASS NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img 
              src="/logo.png" 
              alt="Dukaan" 
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col">
              <span className="text-[9px] font-black font-mono tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 self-start">
                Retail OS 2.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600">
            <a href="#features" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all">
              Features
            </a>
            <a href="#demo" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all">
              Live Demo
            </a>
            <a href="#categories" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all">
              Store Types
            </a>
            <a href="#pricing" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all flex items-center gap-1">
              <span>Plans</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md">
                ₹79
              </span>
            </a>
            <a href="#soundbox" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all">
              Voice Soundbox
            </a>
            <a href="#faq" className="px-3.5 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-100/80 transition-all">
              FAQ
            </a>
          </nav>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <Button
                onClick={() => nav(user.is_admin ? "/admin" : "/app")}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => nav("/login")}
                  variant="ghost"
                  className="h-10 px-3 sm:px-4 rounded-full text-slate-700 hover:text-blue-600 hover:bg-slate-100 text-xs sm:text-sm font-bold"
                >
                  Log In
                </Button>
                
                <Button
                  onClick={() => nav("/app")}
                  className="h-10 sm:h-11 px-4 sm:px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-90 transition-all"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-2xl shadow-xl overflow-hidden px-4 py-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Key Features</span>
                </a>
                <a
                  href="#demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Try POS Demo</span>
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2"
                >
                  <IndianRupee className="w-4 h-4 text-blue-600" />
                  <span>Plans (from ₹79)</span>
                </a>
                <a
                  href="#soundbox"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Voice Soundbox</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <InstallAppButton variant="secondary" className="flex-1 text-xs h-11" />
                <Button
                  onClick={() => { setMobileMenuOpen(false); nav("/app"); }}
                  className="flex-1 h-11 rounded-2xl bg-blue-600 text-white font-bold text-xs"
                >
                  Open Dukaan App
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================
          3. HERO SECTION (ENGINEERED FOR MOBILE-FIRST WOW FACTOR)
      ========================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 md:pt-16 pb-12 sm:pb-20">
        
        {/* Hero Copy & Value Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Smartest Retail Billing & Khata App for India</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-slate-950 leading-[1.12] sm:leading-[1.08]">
            Apni Dukaan Ko Banao <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
              Digital Superstore.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Say goodbye to paper khatas and slow billing. Manage fast counter sales, 1-tap WhatsApp udhaar collection, thermal receipts, and barcode inventory right from your phone, tablet, or PC.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Button
              onClick={() => nav("/app")}
              className="w-full sm:w-auto h-13 sm:h-14 px-7 sm:px-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Free Counter App</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <a
              href="#demo"
              className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-400 text-slate-800 font-extrabold text-sm sm:text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Try Live Simulator ↓</span>
            </a>
          </div>

          {/* Trust Micro-Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Works on Any Phone & Printer
            </span>
          </div>

        </div>

        {/* =========================================================
            INTERACTIVE SMARTPHONE POS DEMO (TOUCH READY)
        ========================================================= */}
        <div id="demo" className="mt-4 sm:mt-8 scroll-mt-24">
          <div className="relative mx-auto max-w-md sm:max-w-xl">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/20 via-indigo-500/10 to-amber-500/15 rounded-full blur-3xl" />

            {/* Smartphone Outer Casing */}
            <div className="relative bg-slate-900 p-3 sm:p-4 rounded-[36px] sm:rounded-[44px] shadow-2xl border-4 border-slate-800 ring-1 ring-white/10">
              
              {/* Dynamic Island / Camera Notch */}
              <div className="w-28 sm:w-32 h-4 sm:h-4.5 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="w-8 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Smartphone Screen Viewport */}
              <div className="bg-slate-50 rounded-[28px] sm:rounded-[36px] overflow-hidden p-3.5 sm:p-5 text-left flex flex-col justify-between min-h-[490px] sm:min-h-[520px] shadow-inner">
                
                {/* Screen Top Bar */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-slate-900">Sharma General Store</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Counter #1 · Active</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full text-[10px] font-bold text-blue-700">
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span>Soundbox Ready</span>
                    </div>
                  </div>

                  {/* Fast Item Selector (Tap to add) */}
                  <div className="mt-3">
                    <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>Tap Any Product to Add to Bill</span>
                      <span className="text-blue-600 font-bold">Touch POS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {SIMULATOR_ITEMS.map((item) => {
                        const inCart = cart.find((c) => c.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => addToCart(item)}
                            className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                              inCart
                                ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{item.emoji}</span>
                              <div>
                                <div className="text-[11px] font-bold text-slate-900 line-clamp-1">{item.name}</div>
                                <div className="text-[10px] font-black font-mono text-blue-600">₹{item.price}</div>
                              </div>
                            </div>

                            <span className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 transition-colors">
                              {inCart ? inCart.qty : "+"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Cart Tray */}
                  <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 pb-1.5 border-b border-slate-100">
                      <span>Active Cart ({totalItemsCount} items)</span>
                      {cart.length > 0 && (
                        <button
                          onClick={() => setCart([])}
                          className="text-[10px] text-rose-600 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Clear
                        </button>
                      )}
                    </div>

                    <div className="py-1 space-y-1.5 max-h-24 overflow-y-auto">
                      {cart.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">Cart is empty. Tap products above!</p>
                      ) : (
                        cart.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                              {it.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => updateQty(it.id, -1)}
                                className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-mono font-bold w-4 text-center">{it.qty}</span>
                              <button
                                onClick={() => updateQty(it.id, 1)}
                                className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                              <span className="text-xs font-mono font-bold text-slate-900 w-12 text-right">
                                ₹{it.price * it.qty}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Checkout Controls */}
                <div className="mt-3 pt-2">
                  
                  {/* Payment Mode Selector */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {[
                      { id: "upi", label: "UPI QR", icon: QrCode },
                      { id: "cash", label: "Cash", icon: Banknote },
                      { id: "khata", label: "Khata", icon: FileText }
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => { setPaymentMode(m.id); setBillPrinted(false); }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                            paymentMode === m.id
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Charge & Print Primary CTA */}
                  <Button
                    onClick={handleChargeBill}
                    disabled={cart.length === 0}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-between px-4"
                  >
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" />
                      <span>Charge & Print Bill</span>
                    </span>
                    <span className="font-mono text-base font-black">₹{cartTotal}</span>
                  </Button>

                  {/* Live Receipt & Voice Toast Feedback */}
                  {billPrinted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold">✓ Bill Paid via {paymentMode.toUpperCase()}!</div>
                          <div className="text-[10px] text-emerald-700">Digital WhatsApp slip & thermal memo dispatched.</div>
                        </div>
                      </div>
                      <Printer className="w-4 h-4 text-emerald-600 animate-bounce" />
                    </motion.div>
                  )}

                </div>

              </div>
            </div>

            {/* Badge beneath smartphone */}
            <div className="text-center mt-3 text-xs text-slate-500 font-medium">
              ⚡ Real Dukaan counter app runs at this exact speed on Android, iOS, and PC.
            </div>

          </div>
        </div>

      </section>

      {/* =========================================================
          4. KEY METRICS BANNER (PROVEN RESULTS)
      ========================================================= */}
      <section className="relative z-10 py-10 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400">10,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Active Retail Counters</div>
              <div className="text-[11px] text-slate-400">Across 28 Indian states</div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-black text-sky-400">Sub-2s</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Fast POS Billing</div>
              <div className="text-[11px] text-slate-400">No customer waiting in line</div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">₹0</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Extra Hardware Cost</div>
              <div className="text-[11px] text-slate-400">Runs on your current phone</div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-black text-indigo-400">99.9%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Offline & Cloud Sync</div>
              <div className="text-[11px] text-slate-400">Never stops during power cuts</div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          5. THE 4 PILLARS OF DUKAAN (MOBILE-OPTIMIZED FEATURE CARDS)
      ========================================================= */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
        
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-3 border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Built For Indian Shopkeepers</span>
          </div>
          <h2 className="font-sans font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
            Har Samasya Ka Ek Hi Hal: Dukaan OS
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 font-medium">
            Designed for high rush hours, paperless bookkeeping, and fast customer recovery.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Card 1: Lightning Fast POS */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mb-4 border border-blue-100">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-lg text-slate-900 mb-2">
                Sub-2s Fast POS Billing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Scan barcodes with phone camera or external gun. Add items, apply discounts, and split cash/UPI payments in under 2 seconds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-600 flex items-center gap-1">
              <span>Offline billing enabled</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: WhatsApp Khata */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mb-4 border border-emerald-100">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-lg text-slate-900 mb-2">
                1-Tap WhatsApp Khata
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Send itemized digital PDF bills directly to customer's WhatsApp with dynamic UPI QR code. Send polite pending balance reminders in 1 click.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <span>3x faster udhaar recovery</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Universal Thermal Printing */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center mb-4 border border-amber-100">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-lg text-slate-900 mb-2">
                Universal Thermal Printing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zero driver installation. Connect any 58mm or 80mm Bluetooth, USB, or WiFi thermal receipt printer. Also prints full A4/A5 GST invoices.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <span>Supports 58mm & 80mm</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Voice Soundbox */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center mb-4 border border-purple-100">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-black text-lg text-slate-900 mb-2">
                Virtual Voice Soundbox
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Save ₹1,500/year on hardware soundbox rentals. Your counter device speaks real-time voice confirmations in Hindi, Gujarati, Tamil, Marathi & English!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-600 flex items-center gap-1">
              <span>5 Indian languages</span>
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================
          6. VIRTUAL SOUNDBOX INTERACTIVE LIVE TESTER
      ========================================================= */}
      <section id="soundbox" className="py-12 sm:py-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black uppercase tracking-wider mb-4">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Interactive Voice Audio Tester</span>
          </div>

          <h2 className="font-sans font-black text-2xl sm:text-4xl tracking-tight">
            Test Dukaan Voice Soundbox Right Now
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto">
            Click any Indian language button below to hear how your phone or PC announces received payments instantly:
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
            {[
              { id: "hi", name: "Hindi (हिंदी)" },
              { id: "gu", name: "Gujarati (ગુજરાતી)" },
              { id: "en", name: "English" },
              { id: "mr", name: "Marathi (मराठी)" },
              { id: "ta", name: "Tamil (தமிழ்)" }
            ].map((lang) => (
              <Button
                key={lang.id}
                type="button"
                onClick={() => {
                  setSoundboxLanguage(lang.id);
                  playVoiceSoundbox(250, "upi", lang.id);
                }}
                className={`h-11 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  soundboxLanguage === lang.id
                    ? "bg-purple-600 text-white ring-2 ring-purple-400"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play in {lang.name}</span>
              </Button>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            🔊 Ensure your device volume is turned on. Included completely free in Dukaan Pro!
          </p>

        </div>
      </section>

      {/* =========================================================
          7. CATEGORY MATCHER ("BUILT FOR YOUR BUSINESS")
      ========================================================= */}
      <section id="categories" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
        
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider mb-3 border border-slate-200">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>Tailored For Any Retail Counter</span>
          </div>
          <h2 className="font-sans font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
            Aapki Dukaan Kaisi Bhi Ho, Dukaan OS Fits In
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Select your store type to see specialized features built for your daily workflow:
          </p>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-3 scrollbar-none touch-pan-x max-w-4xl mx-auto">
          {RETAIL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Category Profile Display Card */}
        <div className="mt-6 max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <span className="text-3xl">{activeCategoryData.icon}</span>
            <div>
              <h3 className="font-sans font-black text-xl text-slate-900">{activeCategoryData.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{activeCategoryData.tagline}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="text-xs uppercase font-black tracking-wider text-slate-400">
              Specialized Capabilities
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {activeCategoryData.features.map((feat, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span><strong>Primary Benefit:</strong> {activeCategoryData.highlight}</span>
          </div>
        </div>

      </section>

      {/* =========================================================
          8. TRANSPARENT PRICING SUITE (CLEAN MOBILE SWITCHER)
      ========================================================= */}
      <section id="pricing" className="py-16 sm:py-24 bg-slate-100/70 border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              <span>Affordable Indian Pricing · No Hidden Fees</span>
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
              Apni Zarurat Ke Anusar Plan Chunein
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
              Every plan includes unlimited product catalog, cloud backup, and zero hardware lock-in.
            </p>

            {/* Monthly vs Annual Toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                  billingCycle === "monthly"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annual (2 Months Free)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* 4 Plan Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const displayPrice = billingCycle === "yearly" ? plan.yearlyMonthlyEffective : plan.monthlyPrice;
              const totalAnnual = plan.yearlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 border-2 relative flex flex-col justify-between bg-white transition-all shadow-sm hover:shadow-xl ${
                    plan.popular
                      ? "border-blue-600 ring-4 ring-blue-500/10"
                      : plan.id === "pro"
                      ? "border-amber-400 ring-4 ring-amber-400/10"
                      : "border-slate-200"
                  }`}
                >
                  {/* Top Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md whitespace-nowrap">
                      ★ MOST POPULAR
                    </div>
                  )}
                  {plan.id === "pro" && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                      <Crown className="w-3 h-3" /> FLAGSHIP TIER
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {plan.name}
                      </span>
                      {plan.badge && !plan.popular && plan.id !== "pro" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans text-base font-black text-slate-900 mb-4 leading-snug">
                      {plan.tagline}
                    </h3>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-sans text-4xl sm:text-5xl font-black text-slate-950">
                        ₹{displayPrice}
                      </span>
                      <span className="text-xs font-bold text-slate-500">/month</span>
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      {billingCycle === "yearly" ? (
                        <span className="text-emerald-700 font-bold">
                          Billed ₹{totalAnnual}/year (Save ₹{plan.monthlyPrice * 12 - totalAnnual})
                        </span>
                      ) : (
                        plan.originalMonthly && (
                          <span>
                            Standard price <span className="line-through">₹{plan.originalMonthly}</span>
                          </span>
                        )
                      )}
                    </div>

                    {/* Setup Fee Tag */}
                    <div className="mt-2 text-[11px] font-medium text-slate-400">
                      {plan.setupFee > 0 ? `+ ₹${plan.setupFee} one-time onboarding` : "Zero setup fee"}
                    </div>

                    <div className="my-5 h-px w-full bg-slate-100" />

                    {/* Perks List */}
                    <ul className="space-y-2.5 mb-6 text-xs text-slate-700 font-medium">
                      {plan.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="mt-0.5 rounded-full p-0.5 bg-emerald-100 text-emerald-700 shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={() => nav(`/subscribe?plan=${plan.id}`)}
                      className={`w-full h-11 rounded-full text-xs font-black active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        plan.id === "pro"
                          ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20"
                          : plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>

                    <Link
                      to={plan.route}
                      className="w-full h-9 rounded-full text-[11px] font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                      Plan Details →
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          9. TIME & UDHAAR SAVINGS CALCULATOR (INTERACTIVE ROI)
      ========================================================= */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-xl">
          
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ROI & Profit Calculator
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-slate-900 mt-2">
              Dukaan Se Aapka Kitna Time & Paisa Bachega?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Drag sliders to match your store's average daily footfall:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            
            {/* Left: Sliders */}
            <div className="space-y-6">
              
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Daily Customers at Counter:</span>
                  <span className="font-mono text-base font-black text-blue-600">{dailyCustomers}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={dailyCustomers}
                  onChange={(e) => setDailyCustomers(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Average Monthly Udhaar:</span>
                  <span className="font-mono text-base font-black text-emerald-600">₹{monthlyUdhaar.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={monthlyUdhaar}
                  onChange={(e) => setMonthlyUdhaar(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
              </div>

            </div>

            {/* Right: Calculated Savings Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-6 rounded-2xl border border-blue-200 text-center space-y-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                  Estimated Monthly Time Saved
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-blue-600 mt-1">
                  ~{hoursSavedMonthly} Hours
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">That's {Math.round(hoursSavedMonthly / 8)} full working days saved on manual billing!</div>
              </div>

              <div className="pt-3 border-t border-blue-200/60">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                  Faster Udhaar Recovery via WhatsApp
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-1">
                  ₹{fasterUdhaarRecovered.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Collected within 10 days instead of 45-60 days delay.</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          10. REAL CUSTOMER TESTIMONIALS (SOCIAL PROOF)
      ========================================================= */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Verified Retailers
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-slate-950 mt-2">
              Dukaandaar Kya Kehte Hain?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs grid place-items-center">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.store} · {t.city}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {t.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          11. FAQS (EXPANDABLE ACCORDION)
      ========================================================= */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 scroll-mt-20">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Clear Answers
          </span>
          <h2 className="font-sans font-black text-2xl sm:text-4xl text-slate-950 mt-2">
            Aam Taur Par Puche Jane Wale Sawal (FAQ)
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-2xl border border-slate-200 px-5 shadow-2xs">
              <AccordionTrigger className="text-left font-bold text-sm sm:text-base text-slate-900 py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pb-4 pt-1">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </section>

      {/* =========================================================
          12. FINAL CALL-TO-ACTION BANNER
      ========================================================= */}
      <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl sm:rounded-[36px] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-sans font-black text-2xl sm:text-5xl tracking-tight text-white leading-tight">
              Apni Dukaan Ko Aaj Hi Modernize Karein.
            </h2>
            <p className="text-xs sm:text-base text-blue-100 font-medium max-w-lg mx-auto">
              Join 10,000+ Indian retailers saving time, stopping stock leaks, and growing daily sales with Dukaan OS.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => nav("/app")}
                className="w-full sm:w-auto h-13 px-8 rounded-full bg-white text-blue-900 hover:bg-slate-100 font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all"
              >
                Start Free Counter Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <InstallAppButton variant="secondary" className="w-full sm:w-auto h-13 px-6 bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-400/40" />
            </div>

            <p className="text-[11px] text-blue-200 pt-1">
              Zero hardware lock-in · Free trial included · Setup in under 60 seconds
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================
          13. STICKY MOBILE QUICK BAR (ON SCROLL)
      ========================================================= */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xl"
          >
            <div>
              <div className="text-[11px] font-black text-slate-900">Dukaan Retail OS</div>
              <div className="text-[10px] text-emerald-600 font-bold">Plans from ₹79/mo · Free Trial</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => nav("/app")}
                size="sm"
                className="h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Open Counter →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          14. MODERN FOOTER
      ========================================================= */}
      <footer className="bg-slate-900 text-white pt-14 pb-24 sm:pb-14 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          
          <div className="col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Dukaan" className="h-8 w-auto brightness-200" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Dukaan is the modern Retail Operating System for Indian shopkeepers. Lightning POS billing, WhatsApp Khata collection, universal thermal printing & virtual soundbox.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              © {new Date().getFullYear()} Dukaan Retail OS. All rights reserved.
            </div>
          </div>

          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Retail Plans</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/starter-plan" className="hover:text-white">Starter Plan (₹79)</Link></li>
              <li><Link to="/business-plan" className="hover:text-white">Business Plan (₹119)</Link></li>
              <li><Link to="/premium-plan" className="hover:text-white">Premium Plan (₹239)</Link></li>
              <li><Link to="/pro-plan" className="hover:text-white">Dukaan Pro (₹499)</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Company & Legal</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/careers" className="hover:text-white">Careers (We're Hiring)</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Direct Support</div>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span>WhatsApp:</span>
                <a href="https://wa.me/919825100000" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                  Chat Now
                </a>
              </li>
              <li><span>Email: contact@officialdukaan.in</span></li>
              <li><Link to="/login" className="text-blue-400 hover:underline font-bold">Merchant Sign In</Link></li>
              <li><Link to="/admin" className="text-slate-500 hover:text-slate-300">Admin Portal</Link></li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
