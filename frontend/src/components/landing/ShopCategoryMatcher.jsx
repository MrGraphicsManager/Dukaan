import React, { useState } from "react";
import { 
  Store, 
  ShoppingBag, 
  Pill, 
  Coffee, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    id: "kirana",
    name: "Kirana & General Store",
    icon: ShoppingBag,
    headline: "Fast Barcode Billing for Kirana & Supermarkets",
    desc: "Scan FMCG barcodes instantly with built-in master catalog, manage weighed items, track customer udhaar khata, and print 58mm/80mm thermal bills in 2 seconds.",
    perks: [
      "Instant 890 FMCG barcode auto-recognition",
      "Loose items & custom unit support (kg, gm, pack)",
      "1-Tap WhatsApp Udhaar payment reminders",
      "Rapid F1-F6 counter keyboard shortcuts"
    ],
    badge: "Most Popular"
  },
  {
    id: "medical",
    name: "Medical & Pharmacy",
    icon: Pill,
    headline: "Expiry Date Guard & Batch Number Tracking",
    desc: "Dedicated compliance suite for medical stores and chemists. Automatically catch expiring drugs 30 days before, print lot numbers on tax invoices, and prevent dead stock.",
    perks: [
      "Medicine Expiry Date Alert Guard (Feature #45)",
      "Batch & Lot number printing on invoices",
      "Tablets, strips, syrup & liquid categories",
      "GST HSN code compliant medical memos"
    ],
    badge: "Zero Expired Drugs"
  },
  {
    id: "bakery",
    name: "Dairy, Bakery & Snacks",
    icon: Coffee,
    headline: "Touch POS for Fast Food, Chai & Bakeries",
    desc: "Designed for high-speed morning and evening rushes. Unlimited prepared stock mode for tea, snacks, and fresh baked goods with visual touch tiles.",
    perks: [
      "Unlimited stock mode (no out-of-stock blockers)",
      "Touch-friendly visual item grid layout",
      "Rapid cash change calculation",
      "Instant UPI QR display on counter screen"
    ],
    badge: "Queue Buster"
  },
  {
    id: "hardware",
    name: "Hardware & Electricals",
    icon: Wrench,
    headline: "B2B Tax Invoicing & Wholesale Ledger",
    desc: "For hardware, sanitary, electrical and paint retailers who need proper GST tax invoices, contractor udhaar ledgers, and multi-branch catalog sync.",
    perks: [
      "A4 & 80mm GST compliant tax invoices",
      "Contractor & builder running ledger accounts",
      "Wholesale cost masking in Cashier Mode",
      "Multi-branch inventory synchronization"
    ],
    badge: "Full Tax Compliance"
  }
];

export default function ShopCategoryMatcher() {
  const [activeTab, setActiveTab] = useState("kirana");
  const current = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-brand-mitti" id="industries">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs mb-3">
          <Store className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>Tailored For Your Business</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo">
          Made for Every Type of Dukaan
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-indigo/70 font-medium">
          Whether you run a neighbourhood Kirana, Medical store, Bakery, or Hardware shop — Dukaan adapts to your workflow.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${
                activeTab === c.id
                  ? "bg-brand-indigo text-white shadow-md ring-2 ring-brand-indigo/20"
                  : "bg-white text-brand-indigo border border-brand-mitti hover:bg-brand-sand"
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === c.id ? "text-amber-400" : "text-brand-terracotta"}`} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Feature Showcase Card */}
      <div className="bg-white rounded-3xl border-2 border-brand-mitti p-7 sm:p-10 shadow-xl grid lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-terracotta bg-brand-terracotta/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{current.badge}</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-indigo leading-snug">
            {current.headline}
          </h3>

          <p className="text-sm text-brand-indigo/75 leading-relaxed font-medium">
            {current.desc}
          </p>

          <div className="pt-2 grid sm:grid-cols-2 gap-3">
            {current.perks.map(p => (
              <div key={p} className="flex items-start gap-2 text-xs font-semibold text-brand-indigo">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-brand-terracotta hover:bg-brand-terracotta/90 px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
            >
              <span>Set up your {current.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Visual Graphic Representation */}
        <div className="lg:col-span-5 bg-brand-sand/60 rounded-2xl p-6 border border-brand-mitti flex flex-col justify-center items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white border border-brand-mitti shadow-md flex items-center justify-center text-brand-terracotta">
            <current.icon className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-extrabold text-base text-brand-indigo">
            {current.name} Ready
          </h4>
          <p className="text-xs text-brand-indigo/60 max-w-xs">
            Pre-configured master categories, shortcuts, and default units included right after signup.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span>✓ Zero Extra Setup Needed</span>
          </div>
        </div>

      </div>

    </section>
  );
}
