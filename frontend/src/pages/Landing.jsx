import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Download,
  Laptop
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import InstallAppButton from "@/components/InstallAppButton";
import Card3D from "@/components/Card3D";
import ThreeDHeroKiosk from "@/components/ThreeDHeroKiosk";
import ThreeDCounterModeShowcase from "@/components/ThreeDCounterModeShowcase";
import ThreeDBackground from "@/components/ThreeDBackground";

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
  { q: "Do I need an expensive computer to run Dukaan?", a: "No. Dukaan works seamlessly on any smartphone, tablet, laptop or desktop browser. Touchscreen and keyboard friendly." },
  { q: "How does UPI payment collection work?", a: "Dukaan displays your shop's own UPI QR code directly on the counter screen. Customers scan and pay using any UPI app (GPay, PhonePe, Paytm). You confirm and the bill is generated." },
  { q: "What is Counter Mode?", a: "Counter Mode is a dedicated high-speed screen built for fast billing. It supports keyboard shortcuts F1-F6 so you can bill, check stock, and manage udhaar without ever touching a mouse." },
  { q: "Can I manage multiple shops?", a: "Yes. With Dukaan's multi-shop architecture, you can add and switch between multiple shop branches with a single tap." },
  { q: "Which languages are supported?", a: "English, हिन्दी (Hindi) and ગુજરાતી (Gujarati). You can toggle the language instantly from the top menu bar." },
];

const reveal = { hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } } };

function Reveal({ children, className = "", id }) {
  return (
    <motion.div id={id} className={className} variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.16 }}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-sand text-brand-indigo noise relative overflow-x-hidden">
      
      {/* 3D Ambient Depth Canvas Background */}
      <ThreeDBackground />

      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-30 bg-brand-cream/85 backdrop-blur-xl border-b border-brand-mitti shadow-xs">
        <div className="mx-auto max-w-6xl px-5 h-20 flex items-center justify-between">
          <Link to="/" className="font-display text-3xl tracking-tight flex items-center gap-2" data-testid="landing-logo">
            <span>दुकान</span>
            <span className="text-brand-indigo/60 text-xl font-sans font-medium">· Dukaan</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-indigo/80">
            <a href="#features" className="hover:text-brand-terracotta transition-colors">Features</a>
            <a href="#download" className="text-brand-terracotta font-bold hover:underline flex items-center gap-1 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download Apps</span>
            </a>
            <a href="#counter-mode" className="hover:text-brand-terracotta transition-colors flex items-center gap-1">
              <span>Counter Mode</span>
              <span className="bg-brand-terracotta/10 text-brand-terracotta text-[10px] font-bold px-1.5 py-0.5 rounded-full">3D</span>
            </a>
            <a href="#pricing" className="hover:text-brand-terracotta transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-brand-terracotta transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => nav("/login")} 
              variant="ghost"
              className="hidden sm:inline-flex text-brand-indigo hover:text-brand-terracotta rounded-full px-4 h-11 text-sm font-semibold transition-all"
            >
              Log in
            </Button>
            <Button 
              onClick={() => nav("/register")} 
              variant="outline"
              className="hidden sm:inline-flex border-brand-indigo/30 text-brand-indigo hover:bg-brand-indigo/5 rounded-full px-4 h-11 text-sm font-semibold transition-all"
            >
              Sign Up Free
            </Button>
            <Button 
              onClick={() => nav("/app")} 
              data-testid="cta-open-app" 
              className="bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-full px-5 h-11 text-sm font-semibold active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Open Dukaan</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO SECTION (3D Interactive Kiosk)
      ========================================================= */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-12 md:pt-20 pb-16 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Value Proposition */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} 
          className="lg:col-span-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-mitti bg-white/80 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Made for Indian Local Shops & Kiranas
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-[4.75rem] leading-[1.04] tracking-tight text-brand-indigo">
            Run Your <br />
            <span className="text-brand-terracotta relative">
              Dukaan.
              <span className="absolute left-0 bottom-1 w-full h-2 bg-brand-terracotta/20 rounded-full -z-10" />
            </span> <br />
            Smarter.
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-brand-indigo/75 max-w-lg leading-relaxed font-normal">
            Billing, inventory, stock alerts, customers, udhaar ledger and business insights — all in one simple platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Button 
              size="lg" 
              onClick={() => nav("/register")} 
              className="h-14 px-8 text-lg rounded-full bg-brand-terracotta text-white hover:bg-brand-terracotta/90 active:scale-95 transition-all shadow-glow flex items-center gap-2"
            >
              <span>Start Free Now</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <a 
              href="#download"
              className="h-14 px-7 text-base rounded-full border-2 border-brand-indigo/30 hover:border-brand-indigo bg-white text-brand-indigo font-bold active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-brand-terracotta" />
              <span>Get PC (.exe) & APK</span>
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 flex items-center gap-6 text-xs text-brand-indigo/65 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Secure & Private
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" /> Fast 1-Tap Billing
            </span>
            <span>·</span>
            <span>Plans from ₹99/mo</span>
          </div>
        </motion.div>

        {/* Right: Interactive 3D Dukaan POS Kiosk */}
        <motion.div 
          initial={{ opacity: 0, x: 35, scale: 0.95 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} 
          className="lg:col-span-6"
        >
          <ThreeDHeroKiosk />
        </motion.div>

      </section>

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
          3D DEDICATED COUNTER MODE SHOWCASE
      ========================================================= */}
      <section id="counter-mode" className="relative z-10">
        <ThreeDCounterModeShowcase />
      </section>

      {/* =========================================================
          HOW IT WORKS (3D STEPS)
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-6xl px-5 py-24 border-t border-brand-mitti" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-4">
            Easy Setup
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-brand-indigo">
            How it works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-indigo/70">
            Start managing your Dukaan in 3 easy steps. No technical skills needed.
          </p>
        </div>

        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: "01", 
              title: "Create your Dukaan", 
              desc: "Enter your shop name, contact details, and optional GST settings. Ready in 30 seconds." 
            },
            { 
              step: "02", 
              title: "Add Products & Customers", 
              desc: "Quickly enter your inventory with selling price and low-stock alerts, or add customer khata." 
            },
            { 
              step: "03", 
              title: "Start Managing Business", 
              desc: "Bill customers via Cash or UPI, record Udhaar, track profits, and download PDF receipts." 
            }
          ].map((s) => (
            <Card3D key={s.step} depth={15} glow={true} className="w-full">
              <div className="bg-white rounded-3xl border-2 border-brand-mitti p-8 shadow-3d-card relative text-center preserve-3d h-full flex flex-col items-center justify-between">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-brand-indigo text-white font-display text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md translate-z-20">
                    {s.step}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-brand-indigo mb-3 translate-z-10">
                    {s.title}
                  </h3>
                  <p className="text-sm text-brand-indigo/70 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Step {s.step} Verified
                </div>
              </div>
            </Card3D>
          ))}
        </motion.div>
      </Reveal>

      {/* =========================================================
          DOWNLOAD SECTION (WINDOWS PC .EXE & ANDROID .APK)
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-6xl px-5 py-20 border-t border-brand-mitti" id="download">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-mitti bg-white text-xs font-bold uppercase tracking-widest text-brand-terracotta mb-4 shadow-2xs">
            <Download className="w-3.5 h-3.5" />
            Native Desktop & Mobile Apps
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-brand-indigo">
            Download Dukaan for Your Counter & Mobile
          </h2>
          <p className="mt-4 text-base sm:text-lg text-brand-indigo/70">
            No browser required. Launch straight into billing with 100% offline device storage.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Windows PC Software Card */}
          <div className="rounded-3xl p-8 border-2 border-brand-mitti bg-white shadow-lift flex flex-col justify-between hover:border-brand-indigo transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center mb-5">
                <Laptop className="w-8 h-8" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Desktop Software</div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo">Windows PC (.exe)</h3>
              <p className="mt-2 text-sm text-brand-indigo/70 leading-relaxed">
                Counter billing software for Windows 10 & 11. Fullscreen kiosk mode (F11), barcode scanner support, and direct thermal receipt printing.
              </p>

              <div className="mt-6 space-y-2 text-xs font-semibold text-brand-indigo/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct launch into POS (No landing page)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Works 100% offline once registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Single-file executable + Portable zip</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-mitti">
              <a
                href="https://github.com/MrGraphicsManager/Dukaan/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Windows Software (.exe)</span>
              </a>
              <div className="mt-2 text-center text-[10px] text-brand-indigo/50">
                Windows 10 / 11 64-bit · Installer & Portable
              </div>
            </div>
          </div>

          {/* Android Mobile App Card */}
          <div className="rounded-3xl p-8 border-2 border-brand-mitti bg-white shadow-lift flex flex-col justify-between hover:border-brand-terracotta transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mb-5">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Android Mobile App</div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo">Android App (.apk)</h3>
              <p className="mt-2 text-sm text-brand-indigo/70 leading-relaxed">
                Take your Dukaan billing and customer khata ledger in your pocket. Touch-friendly mobile interface with 1-tap WhatsApp digital bills.
              </p>

              <div className="mt-6 space-y-2 text-xs font-semibold text-brand-indigo/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct launch into Shop Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1-Tap WhatsApp customer bill sender</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Safe-area native bottom dock navigation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-mitti">
              <a
                href="https://github.com/MrGraphicsManager/Dukaan/actions/runs/33747305367"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK (5.7 MB)</span>
              </a>
              <div className="mt-2 text-center text-[10px] text-brand-indigo/50">
                Android 8.0+ · Direct APK install
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* =========================================================
          PRICING SECTION (3D ELEVATED CARDS)
      ========================================================= */}
      <Reveal className="relative z-10 mx-auto max-w-6xl px-5 py-24 border-t border-brand-mitti" id="pricing">
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

        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p) => (
            <Card3D 
              key={p.name} 
              depth={p.featured ? 22 : 12} 
              glow={true} 
              className="w-full"
            >
              <div 
                className={`rounded-3xl p-8 border-2 shadow-3d-card relative flex flex-col justify-between h-full preserve-3d ${
                  p.featured 
                    ? "bg-brand-indigo text-white border-brand-indigo shadow-2xl" 
                    : "bg-white text-brand-indigo border-brand-mitti"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-terracotta text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md translate-z-30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular for Shops
                  </div>
                )}

                <div>
                  <div className={`text-xs uppercase tracking-widest font-extrabold ${p.featured ? "text-brand-terracotta" : "text-brand-terracotta"}`}>
                    {p.name} PLAN
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-extrabold">₹{p.price}</span>
                    <span className={`text-sm font-semibold ${p.featured ? "text-white/60" : "text-brand-indigo/50"}`}>/month</span>
                  </div>
                  <div className={`mt-1 text-xs font-medium ${p.featured ? "text-white/60" : "text-brand-indigo/50"}`}>
                    + ₹{p.setup} one-time setup fee
                  </div>

                  <div className={`my-6 h-px w-full ${p.featured ? "bg-white/15" : "bg-brand-mitti"}`} />

                  <ul className="space-y-3.5 mb-8">
                    {p.perks.map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${p.featured ? "bg-brand-terracotta text-white" : "bg-brand-leaf/10 text-brand-leaf"}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-sm font-medium ${p.featured ? "text-white/90" : "text-brand-indigo/80"}`}>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
                  <Button 
                    onClick={() => nav(`/subscribe?plan=${p.name.toLowerCase()}`)} 
                    data-testid={`price-cta-${p.name.toLowerCase()}`} 
                    className={`w-full h-13 rounded-full text-base font-bold active:scale-95 transition-all shadow-md ${
                      p.featured 
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
          <div className="bg-gradient-to-br from-brand-indigo to-[#2A2375] text-white rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl border-2 border-brand-indigo/40 preserve-3d">
            
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Start in 30 Seconds
              </div>

              <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-tight">
                Everything your Dukaan needs. <br />
                <span className="text-brand-terracotta">In one place.</span>
              </h2>

              <p className="mt-6 text-lg text-white/75 leading-relaxed">
                Join thousands of modern shops across India managing billing, inventory, and udhaar effortlessly.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => nav("/app")} 
                  className="h-14 px-10 text-lg rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold active:scale-95 transition-all shadow-glow flex items-center gap-2"
                >
                  <span>Open Your Dukaan</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <InstallAppButton variant="outline" className="h-14 px-8 text-base rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20" />
              </div>
            </div>

          </div>
        </Card3D>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-brand-mitti bg-white py-12 text-center relative z-10">
        <div className="font-display text-3xl mb-3 text-brand-indigo">दुकान · Dukaan</div>
        <p className="text-xs text-brand-indigo/60 mb-6">Run Your Dukaan. Smarter.</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8 text-sm font-medium">
          <a href="#features" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Features</a>
          <a href="#pricing" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Pricing Plans</a>
          <Link to="/subscribe" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Buy Subscription</Link>
          <Link to="/privacy-policy" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Privacy Policy</Link>
          <Link to="/refund-policy" className="text-brand-indigo/70 hover:text-brand-terracotta transition-colors">Refund Policy</Link>
        </div>
        <div className="text-xs text-brand-indigo/50 flex items-center justify-center gap-1">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-brand-terracotta fill-brand-terracotta inline" />
          <span>for Indian Small Businesses · © 2026 Dukaan</span>
        </div>
      </footer>

    </div>
  );
}
