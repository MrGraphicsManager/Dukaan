import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Receipt, 
  Users, 
  Wallet, 
  Package, 
  Warehouse, 
  ClipboardList, 
  Monitor, 
  ArrowRight, 
  Sparkles,
  Command,
  Zap
} from "lucide-react";
import Card3D from "./Card3D";

export default function ThreeDCounterModeShowcase() {
  const nav = useNavigate();
  const [selectedKey, setSelectedKey] = useState("F1");

  const SHORTCUTS = [
    {
      key: "F1",
      label: "New Bill",
      icon: Receipt,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-600",
      desc: "Fast POS checkout with barcode support, instant discounts, and auto-resetting cart.",
      stat: "1.2s Average Billing Time"
    },
    {
      key: "F2",
      label: "Customers",
      icon: Users,
      color: "from-orange-500 to-amber-600",
      bgLight: "bg-orange-50 text-brand-terracotta",
      desc: "Customer purchase history, phone numbers, and instant ledger balance tracking.",
      stat: "Instant Customer Ledger"
    },
    {
      key: "F3",
      label: "Udhaar",
      icon: Wallet,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-600",
      desc: "1-Click WhatsApp payment reminders, FIFO settlements, and overdue interest alerts.",
      stat: "92% Recovery Rate"
    },
    {
      key: "F4",
      label: "Products",
      icon: Package,
      color: "from-sky-500 to-blue-600",
      bgLight: "bg-sky-50 text-sky-600",
      desc: "Quick catalog search, purchase vs selling margin calculation, and unlimited stock mode.",
      stat: "5,000+ Items Supported"
    },
    {
      key: "F5",
      label: "Stock",
      icon: Warehouse,
      color: "from-purple-500 to-indigo-600",
      bgLight: "bg-purple-50 text-purple-600",
      desc: "Live inventory deduction on every bill, stock movement audits, and restock logs.",
      stat: "Automatic Low-Stock Warnings"
    },
    {
      key: "F6",
      label: "Orders",
      icon: ClipboardList,
      color: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50 text-rose-600",
      desc: "Filter by Paid, Udhaar, or Payment Type with instant PDF invoice downloads and prints.",
      stat: "Clean Printable Tax Invoices"
    },
  ];

  const active = SHORTCUTS.find(s => s.key === selectedKey) || SHORTCUTS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="py-20 border-t border-brand-mitti">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta mb-4 shadow-xs">
            <Monitor className="w-3.5 h-3.5" /> High-Speed Counter Mode
          </div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight text-brand-indigo">
            Built for the Counter. <br />
            <span className="text-brand-terracotta">Zero Mouse Needed.</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-brand-indigo/70 leading-relaxed">
            Serve a rush of customers effortlessly. Use physical keyboard shortcuts F1-F6 to jump between bills, stock, and udhaar instantly.
          </p>
        </div>

        {/* 3D Interactive Keyboard & Screen Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 3D Mechanical Keycaps Selector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/60 mb-2 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5" /> Click or Tap a 3D Key to Preview:
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              {SHORTCUTS.map((item) => {
                const isSelected = item.key === selectedKey;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => setSelectedKey(item.key)}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.95, y: 2 }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all preserve-3d select-none ${
                      isSelected 
                        ? "bg-white border-brand-terracotta shadow-xl" 
                        : "bg-white/70 border-brand-mitti hover:bg-white hover:border-brand-indigo/30 shadow-sm"
                    }`}
                    style={{
                      boxShadow: isSelected 
                        ? "0 14px 28px -6px rgba(212, 98, 59, 0.22), 0 0 0 1px rgba(212, 98, 59, 0.5)" 
                        : "0 4px 10px rgba(27, 20, 100, 0.04)"
                    }}
                  >
                    {/* 3D Physical Keycap Top Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-mono font-extrabold shadow-inner border ${
                        isSelected 
                          ? "bg-brand-terracotta text-white border-brand-terracotta" 
                          : "bg-brand-sand text-brand-indigo border-brand-mitti"
                      }`}>
                        {item.key}
                      </span>
                      <Icon className={`w-4 h-4 ${isSelected ? "text-brand-terracotta" : "text-brand-indigo/50"}`} />
                    </div>

                    <div className="font-heading font-bold text-sm text-brand-indigo">
                      {item.label}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-brand-indigo/60 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Includes dedicated Fullscreen Mode & 20s counter startup</span>
              </span>
              <button
                onClick={() => nav("/app/counter")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-terracotta hover:underline"
              >
                Launch Counter Mode <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: 3D Screen Simulation Card */}
          <div className="lg:col-span-6">
            <Card3D depth={15} glow={true} className="w-full">
              <div className="relative bg-white rounded-3xl border-2 border-brand-mitti p-8 shadow-3d-card overflow-hidden">
                {/* Simulated Monitor Bezel Top */}
                <div className="flex items-center justify-between pb-5 border-b border-brand-mitti">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-mono text-brand-indigo/50">Dukaan Counter · {active.key} View</span>
                  </div>
                  <span className="text-xs font-bold text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-1 rounded-full">
                    Active Shortcut: {active.key}
                  </span>
                </div>

                {/* Simulated Content Area with Smooth Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.key}
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="py-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-4 rounded-2xl ${active.bgLight} shrink-0 shadow-sm`}>
                        <ActiveIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/50">
                          MODULE {active.key}
                        </div>
                        <h3 className="font-heading text-2xl font-extrabold text-brand-indigo mt-0.5">
                          {active.label} Management
                        </h3>
                        <p className="text-sm text-brand-indigo/70 mt-1 leading-relaxed">
                          {active.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-2xl bg-brand-sand border border-brand-mitti flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-terracotta" />
                        <span className="text-xs font-bold text-brand-indigo">{active.stat}</span>
                      </div>
                      <span className="text-xs text-brand-indigo/50 font-mono">100% Offline-Ready</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-brand-mitti flex items-center justify-between">
                  <span className="text-xs text-brand-indigo/60">Press <b>{active.key}</b> anytime in Counter Mode</span>
                  <button
                    onClick={() => nav("/app")}
                    className="px-5 py-2.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-medium text-xs shadow-glow active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    Try in App <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card3D>
          </div>

        </div>

      </div>
    </div>
  );
}
