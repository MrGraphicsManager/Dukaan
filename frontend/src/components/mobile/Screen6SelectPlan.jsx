import React from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹ 0",
    period: "/ forever",
    sub: "Perfect for small businesses",
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹ 149",
    period: "/ month",
    sub: "For growing businesses",
    recommended: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹ 299",
    period: "/ month",
    sub: "For advanced businesses",
    recommended: false,
  },
];

export default function Screen6SelectPlan({ selectedPlan, onSelectPlan, onNext, onBack, onSkip }) {
  const current = selectedPlan || "free";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between px-6 pt-3 pb-6 max-w-md mx-auto select-none">
      
      {/* Top Header */}
      <header className="w-full flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip || onNext}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
        >
          Skip
        </button>
      </header>

      {/* Title */}
      <div className="mt-3 mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Choose a Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Start free and upgrade anytime.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {PLANS.map((p) => {
          const isSelected = current === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlan(p.id)}
              className={`relative rounded-2xl p-4 border transition-all cursor-pointer active:scale-98 ${
                isSelected
                  ? "border-blue-500 bg-[#F7FAFF] shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {p.recommended && (
                <span className="inline-block bg-[#0066FF] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1.5 shadow-2xs">
                  Recommended
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">{p.price}</span>
                    <span className="text-xs font-medium text-slate-500">{p.period}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {p.sub}
                  </p>
                </div>

                {/* Radio selection circle */}
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all mt-1 ${
                    isSelected
                      ? "bg-[#0066FF] text-white shadow-xs"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Compare Plans Link */}
        <div className="pt-2 text-center">
          <a
            href="#compare"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Compare Plans</span>
          </a>
        </div>
      </div>

      {/* Bottom CTA */}
      <footer className="w-full pt-3">
        <Button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </footer>

    </div>
  );
}
