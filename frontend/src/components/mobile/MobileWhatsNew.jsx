import React from "react";
import { ArrowLeft, Sparkles, Check, Zap, ShieldCheck } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileWhatsNew({ onBack, onTabChange }) {
  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">What's New</h1>
              <span className="px-1.5 py-0.2 bg-blue-100 text-[#0066FF] font-black text-[9px] rounded-full">
                v1.1.0
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">Latest Updates & Release Notes</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Release v1.1.0 */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#0066FF] text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Latest
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#0066FF]" />
            <span className="text-xs font-extrabold text-slate-900">Version 1.1.0 · September 2026</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 mt-3">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Ultra-Fast POS:</strong> Create bills with 1-tap product addition and live cart calculation.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>WhatsApp Bill PDF:</strong> Share polished digital bills directly to your customers with your shop logo.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Udhaar (Khata) Reminders:</strong> Automated gentle payment reminder links via WhatsApp.</span>
            </div>
          </div>
        </div>

        {/* Release v1.0.9 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-800">Version 1.0.9 · August 2026</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 mt-2">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Low Stock Alerts:</strong> Instant warnings when inventory drops below safety threshold.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong>Multi-Language Onboarding:</strong> Complete setup walkthrough for Indian shop owners.</span>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
