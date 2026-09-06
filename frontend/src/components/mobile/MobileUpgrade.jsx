import React, { useState } from "react";
import { ArrowLeft, Crown, Check, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function MobileUpgrade({ onBack }) {
  const [billingCycle, setBillingCycle] = useState("yearly");

  const perks = [
    "Unlimited Digital Invoices & Estimates",
    "Automated WhatsApp Payment Reminders",
    "Bluetooth 2-inch & 3-inch Printer Support",
    "Multi-device Cloud Sync & Staff Access",
    "Advanced Profit & Loss Analytics",
    "Dedicated 24/7 VIP Phone Support",
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
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
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
            Everything your shop needs to sell faster, track profit & recover udhaar.
          </p>
        </div>

        {/* Pricing toggle */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 mb-6">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-[#0066FF] text-white shadow-md" : "text-slate-400"
            }`}
          >
            Monthly · ₹149
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              billingCycle === "yearly" ? "bg-[#0066FF] text-white shadow-md" : "text-slate-400"
            }`}
          >
            <span>Yearly · ₹1,490</span>
            <span className="absolute -top-2 right-2 bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              Save 20%
            </span>
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
          onClick={() => alert("Proceeding to Razorpay checkout for ₹" + (billingCycle === "yearly" ? "1,490" : "149"))}
          className="w-full py-3.5 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Upgrade to Pro Now</span>
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
