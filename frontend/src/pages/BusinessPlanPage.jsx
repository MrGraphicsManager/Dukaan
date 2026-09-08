import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Wallet, 
  Bell, 
  BarChart3, 
  ArrowRight, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  Crown,
  Share2,
  MessageCircle,
  AlertTriangle,
  QrCode,
  Package,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Card3D from "@/components/Card3D";

const DEMO_CUSTOMERS = [
  {
    id: 1,
    name: "Ramesh Sharma",
    phone: "+91 98765 43210",
    balance: 1450,
    daysOverdue: 12,
    lastPurchase: "3 bags Atta, 2L Oil, Salt",
    avatar: "👨"
  },
  {
    id: 2,
    name: "Priya Verma",
    phone: "+91 98111 22334",
    balance: 820,
    daysOverdue: 5,
    lastPurchase: "Amul Butter, Cheese, Bread",
    avatar: "👩"
  },
  {
    id: 3,
    name: "Sanjay Gupta",
    phone: "+91 99222 33445",
    balance: 3250,
    daysOverdue: 19,
    lastPurchase: "Monthly Grocery & Spices",
    avatar: "🧔"
  }
];

export default function BusinessPlanPage() {
  const nav = useNavigate();
  
  // Interactive Khata State
  const [selectedCustomer, setSelectedCustomer] = useState(DEMO_CUSTOMERS[0]);
  const [reminderSent, setReminderSent] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);

  const handleSendReminder = () => {
    setReminderSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Dukaan" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="hidden sm:flex flex-col border-l border-slate-200 pl-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
                <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">PEAN</span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dukaan Business Plan</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-black">POPULAR</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/premium-plan"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
            >
              <span>Explore Premium</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link 
              to="/subscribe?plan=business"
              className="px-5 sm:px-6 h-10 sm:h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>Get Business (₹119/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* =========================================================
          HERO SECTION: DUKAAN BUSINESS PLAN
      ========================================================= */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24 border-b border-slate-200 bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/15 via-amber-300/10 to-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase tracking-widest mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Most Popular Choice for Indian Kirana & Retail</span>
          </div>

          <h1 className="font-sans font-black text-4xl sm:text-6xl lg:text-7xl tracking-[-0.03em] leading-[1.05] text-slate-950 max-w-4xl mx-auto">
            Recover Customer Udhaar & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
              Stop Stockouts Fast.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            The complete operating system for active retail counters. 
            Includes everything in Starter, plus <strong>Customer Khata Ledger</strong>, <strong>1-Tap WhatsApp Payment Reminders</strong>, automated <strong>Low-Stock Alerts</strong>, and deep profit analytics for just <strong>₹119/month</strong>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/subscribe?plan=business"
              className="w-full sm:w-auto h-14 px-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Get Business Plan — ₹119/month</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link 
              to="/premium-plan"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-600 text-slate-800 hover:text-blue-700 font-bold text-base active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Have Multiple Shops? Explore Premium →</span>
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1-Tap WhatsApp Udhaar Reminders
            </span>
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Auto Low-Stock Threshold Alerts
            </span>
            <span className="flex items-center gap-1.5 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Barcode Print & Profit Charts
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================
          INTERACTIVE KHATA & WHATSAPP REMINDER SIMULATOR
      ========================================================= */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Interactive Khata Sandbox
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            See How 1-Tap WhatsApp Collects Udhaar
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Select a customer with pending balance below and click <strong>Send 1-Tap Reminder</strong> to see the real message sent to their WhatsApp.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Customer Khata Directory (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Customer Khata Register</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                3 Pending Balances
              </span>
            </div>

            <div className="space-y-3">
              {DEMO_CUSTOMERS.map((cust) => {
                const isSelected = selectedCustomer.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setReminderSent(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? "bg-blue-50/70 border-blue-600 shadow-sm" 
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cust.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{cust.name}</h4>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            {cust.daysOverdue}d overdue
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{cust.phone}</p>
                        <p className="text-[11px] text-slate-600 mt-1">Last: {cust.lastPurchase}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium block">Balance</span>
                      <span className="text-base font-black text-red-600">₹{cust.balance}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Low-stock interactive callout */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs text-amber-900">Automated Kirana Stock Alert (Included)</h5>
                <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                  "⚠️ Alert: <strong>Amul Butter 100g</strong> is down to 2 units (Threshold: 5). Reorder now."
                </p>
              </div>
            </div>
          </div>

          {/* Right: WhatsApp Preview Simulator (6 cols) */}
          <div className="lg:col-span-6">
            <Card3D depth={15} glow={true} className="w-full">
              <div className="rounded-3xl bg-[#ECE5DD] border-2 border-slate-300 overflow-hidden shadow-xl">
                
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedCustomer.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{selectedCustomer.name}</h4>
                      <span className="text-[10px] text-emerald-200">online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded text-white font-medium">
                      WhatsApp Verified
                    </span>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="p-4 space-y-4 min-h-[300px] flex flex-col justify-between bg-repeat" style={{ backgroundImage: "radial-gradient(#00000008 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
                  
                  <div className="text-center">
                    <span className="text-[10px] bg-white/80 text-slate-500 px-2.5 py-1 rounded-full shadow-2xs">
                      TODAY
                    </span>
                  </div>

                  {reminderSent ? (
                    <div className="self-end max-w-[85%] bg-[#DCF8C6] text-slate-900 p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2">
                      <p className="leading-relaxed">
                        Namaste <strong>{selectedCustomer.name}</strong> ji 🙏
                      </p>
                      <p className="leading-relaxed">
                        Aapka <strong>Shri Ram Kirana Store</strong> me <strong>₹{selectedCustomer.balance}</strong> ka Udhaar balance baki hai ({selectedCustomer.daysOverdue} days).
                      </p>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200 space-y-1">
                        <div className="flex items-center justify-between font-bold text-[11px] text-slate-800">
                          <span>Click to Pay via UPI:</span>
                          <span className="text-emerald-700">₹{selectedCustomer.balance}</span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-mono underline block break-all">
                          upi://pay?pa=shriramkirana@okhdfcbank&pn=ShriRamKirana&am={selectedCustomer.balance}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Shri Ram Kirana Store</span>
                        <span className="text-emerald-700 font-bold">✓✓ Read</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Click the button below to generate & preview the 1-Tap WhatsApp reminder message.
                    </div>
                  )}

                  {/* Send Action Trigger */}
                  <div className="pt-3 border-t border-slate-300/60">
                    <Button
                      onClick={handleSendReminder}
                      className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5 text-slate-950" />
                      <span>{reminderSent ? "Resend 1-Tap WhatsApp Reminder" : "Send 1-Tap WhatsApp Reminder"}</span>
                    </Button>
                  </div>

                </div>

              </div>
            </Card3D>
          </div>

        </div>
      </section>

      {/* =========================================================
          5 PILLARS OF DUKAAN BUSINESS PLAN
      ========================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Why 1,000+ Retailers Choose the Business Plan
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Engineered to protect cash flow, eliminate ledger confusion, and avoid lost sales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: "Digital Udhaar Khata Register",
                desc: "No more torn paper diaries. Track customer credit balances, payment history, and auto-settle on FIFO order."
              },
              {
                icon: MessageCircle,
                title: "1-Tap WhatsApp Reminders",
                desc: "Send polite, automated WhatsApp collection messages with your dynamic UPI payment link embedded directly."
              },
              {
                icon: Bell,
                title: "Automated Low-Stock Alerts",
                desc: "Set minimum threshold levels for high-margin Kirana items. Receive auto alerts before you run out of stock."
              },
              {
                icon: Package,
                title: "Barcode Printing & Scanner",
                desc: "Print barcode price tags for unpackaged dry fruits, spices, and loose pulses. Scan at checkout in 0.5s."
              },
              {
                icon: TrendingUp,
                title: "Profit Margins & Sales Analytics",
                desc: "Know your daily net profit, weekly revenue peaks, best-selling grocery brands, and top 20 loyal customers."
              },
              {
                icon: ShieldCheck,
                title: "Automated Cloud Sync",
                desc: "Continuous real-time cloud sync ensures your customer khata and sales data is always secure and recoverable."
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          FULL 4-PLAN COMPARISON TABLE (BUSINESS HIGHLIGHTED)
      ========================================================= */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            Plan Matrix
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            How Business Plan Compares
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Everything your busy Kirana counter needs at just ₹119/month.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-4 px-4 sm:px-6 font-bold text-slate-700">Feature</th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-slate-800">Starter (₹79/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-black text-blue-700 bg-blue-50/50">
                    Business (₹119/mo) ★
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-slate-800">Premium (₹239/mo)</th>
                  <th className="py-4 px-3 sm:px-4 font-black text-blue-700">Dukaan Pro (₹499/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Fast POS Billing</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold bg-blue-50/30">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4">Unlimited Bills</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Unlimited + Priority</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Khata & WhatsApp Reminders</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">Manual Ledger</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold bg-blue-50/30">1-Click WhatsApp + UPI</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">1-Click WhatsApp + UPI</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Auto Reminders</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Low Stock Automated Alerts</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold bg-blue-50/30">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Predictive Alerts</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Barcode Label Generator</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold bg-blue-50/30">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Multi-Shop HQ Support</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">1 Counter</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-600 bg-blue-50/30">1 Shop</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">Up to 3 Shops</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Unlimited Shops</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">FY Financial Year Tax Audit</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-slate-400 bg-blue-50/30">—</td>
                  <td className="py-3.5 px-3 sm:px-4 text-blue-700 font-bold">Included</td>
                  <td className="py-3.5 px-3 sm:px-4 font-semibold text-blue-700">Included + Export</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQS FOR BUSINESS MERCHANTS
      ========================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-3xl text-slate-900 tracking-tight">Business Plan FAQs</h2>
          <p className="mt-2 text-slate-600 text-sm">Common questions regarding Khata and WhatsApp integration.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="faq-1" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              Are there extra per-message SMS or WhatsApp charges?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              No extra charges! Dukaan uses standard WhatsApp Web / native app triggers from your PC or browser, so you don't pay any costly third-party SMS API bills.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              How does the UPI link in the WhatsApp message work?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              When you click Send Reminder, Dukaan embeds your store's VPA UPI address (e.g. yourstore@upi) and the exact outstanding amount. When the customer taps the link on their smartphone, Google Pay, PhonePe, or Paytm opens automatically with the exact amount filled in!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="bg-white rounded-2xl border border-slate-200 px-6">
            <AccordionTrigger className="font-bold text-slate-900 hover:no-underline text-left">
              Can I generate barcode stickers for loose dry grocery?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-sm leading-relaxed">
              Yes! Business Plan includes a built-in barcode generator. You can print standard barcode labels for unbranded pulses, dry fruits, or bakery items on any thermal sticker roll.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* =========================================================
          HIGH-IMPACT UPGRADE BANNER
      ========================================================= */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-[40px] bg-gradient-to-b from-blue-600 via-indigo-700 to-slate-950 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-3xl bg-white/15 border border-white/30 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Sparkles className="w-9 h-9 fill-amber-300 text-amber-300" />
          </div>

          <h2 className="font-sans font-black text-3xl sm:text-5xl tracking-tight text-white">
            Upgrade to the Business Plan Today.
          </h2>

          <p className="text-blue-100 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed font-normal">
            Start collecting Udhaar on WhatsApp, prevent out-of-stock items, and get full control over customer balances for just ₹119/month.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/subscribe?plan=business"
              className="w-full sm:w-auto h-14 px-9 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xl shadow-amber-400/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Business Plan (₹119/mo)</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Link>

            <Link
              to="/premium-plan"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Premium Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
