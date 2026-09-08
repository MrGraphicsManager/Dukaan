import React, { useState } from "react";
import { ArrowLeft, Crown, Check, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function MobileUpgrade({ onBack }) {
  const [billingCycle, setBillingCycle] = useState("yearly");

  const perks = [
    "Custom Billing & Invoice Formats",
    "Custom Dashboard & KPI Widgets",
    "Customize Everything (Layout & Themes)",
    "Early Access to New Platform Updates",
    "Dedicated 24/7 Priority Support",
    "Automated WhatsApp Payment Reminders",
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white max-w-md mx-auto p-6 flex flex-col justify-between select-none relative overflow-hidden animate-in fade-in duration-200">
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" />
            <span>Dukaan Pro</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Hero title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Grow Your Business 10x with Pro
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Full custom billing, personalized dashboards & 24/7 dedicated support.
          </p>
        </div>

        {/* Pricing toggle */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 mb-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              billingCycle === "monthly" ? "bg-[#0066FF] text-white shadow-md" : "text-slate-400"
            }`}
          >
            <span>Monthly · ₹499</span>
            <span className="block text-[9px] text-amber-300 font-extrabold">1+1 Mo Free</span>
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              billingCycle === "yearly" ? "bg-[#0066FF] text-white shadow-md" : "text-slate-400"
            }`}
          >
            <span>Yearly · ₹4,999</span>
            <span className="block text-[9px] text-amber-300 font-extrabold">12+6 Mo Free (Save 16.5%)</span>
          </button>
        </div>

        {/* Feature List */}
        <div className="bg-slate-800/50 backdrop-blur-xs rounded-2xl p-4 border border-slate-700/60 space-y-3 mb-6">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            Included in Dukaan Pro
          </div>
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-slate-200 font-medium">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="space-y-3">
        <button
          onClick={() => alert("Proceeding to Razorpay checkout for ₹" + (billingCycle === "yearly" ? "4,999" : "499"))}
          className="w-full py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Upgrade to Dukaan Pro</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>7-Day 100% Money-Back Guarantee</span>
        </div>
      </div>
    </div>
  );
}
