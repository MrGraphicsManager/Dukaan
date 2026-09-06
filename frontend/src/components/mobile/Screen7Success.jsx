import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Screen7Success({ onNext }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between px-6 pt-8 pb-7 max-w-md mx-auto select-none">
      
      <div />

      {/* Central Illustration & Checklist */}
      <main className="w-full flex flex-col items-center text-center my-auto">
        
        {/* Animated Checkmark Circle with Confetti dots */}
        <div className="relative mb-6">
          {/* Confetti particles */}
          <div className="absolute -top-3 -left-4 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <div className="absolute -top-2 right-1 w-2.5 h-1 rounded-full bg-amber-400 rotate-45" />
          <div className="absolute bottom-2 -left-5 w-2 h-2 rounded-full bg-emerald-400" />
          <div className="absolute -bottom-1 -right-3 w-1.5 h-2 rounded-full bg-rose-400 rotate-12" />

          <div className="w-20 h-20 rounded-full bg-[#EAF2FF] border-4 border-[#D4E5FF] flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 text-[#0066FF] stroke-[3]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
          You're All Set!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-[270px] mt-2 leading-relaxed">
          Your Dukaan account is ready. Let's set up your first product and start selling.
        </p>

        {/* Checklist */}
        <div className="w-full max-w-[280px] bg-slate-50/70 border border-slate-100 rounded-2xl p-4 mt-7 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-slate-800">
              Account created
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold text-slate-800">
              Business details added
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white shrink-0" />
            <span className="text-xs font-semibold text-slate-500">
              Add your first product
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white shrink-0" />
            <span className="text-xs font-semibold text-slate-500">
              Explore dashboard
            </span>
          </div>
        </div>

      </main>

      {/* CTA Button */}
      <footer className="w-full pt-4">
        <Button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </footer>

    </div>
  );
}
