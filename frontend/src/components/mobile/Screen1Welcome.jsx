import React, { useState } from "react";
import { ChevronDown, ArrowRight, Receipt, Package, Users, BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "udhaar", label: "Udhaar", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function Screen1Welcome({ onNext, onSkip, onLogin }) {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between px-6 pt-3 pb-6 max-w-md mx-auto relative select-none">
      
      {/* Top Bar: Back & Skip */}
      <header className="w-full flex items-center justify-between pt-1">
        <div className="w-8" />
        <button
          onClick={onSkip || onNext}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
        >
          Skip
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center text-center my-auto py-1">
        
        {/* Dukaan Official Logo with Tagline */}
        <div className="relative flex justify-center mt-1 mb-1">
          <img
            src="/assets/mobile/dukaan_mobile_logo.png"
            alt="Dukaan - Business Made Simple"
            className="h-28 sm:h-32 w-auto object-contain drop-shadow-xs"
          />
        </div>

        {/* Heading: Manage · Sell · Grow */}
        <h1 className="text-[25px] sm:text-[27px] font-extrabold text-slate-900 tracking-tight leading-snug mt-2">
          Manage · Sell · <span className="text-[#0066FF]">Grow</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1 max-w-[290px]">
          Everything your business needs, in one simple app.
        </p>

        {/* 4 Feature Quick-Pills */}
        <div className="grid grid-cols-4 gap-2.5 w-full max-w-[320px] mt-4 mb-2">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isActive = activeSlide === idx;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveSlide(idx)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? "bg-[#E6F0FF] text-[#0066FF] shadow-sm scale-105" 
                      : "bg-[#F3F6FA] text-[#0066FF] hover:bg-[#E6F0FF]"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mt-1.5 tracking-tight group-hover:text-blue-600">
                  {feat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3D Indian Storefront Illustration */}
        <div className="w-full max-w-[360px] my-1 relative flex justify-center">
          <img
            src="/assets/mobile/dukaan_storefront_3d.png"
            alt="Dukaan Storefront - Bade Vyapaar ki Simple Shuruaat"
            className="w-full h-auto max-h-[230px] object-contain select-none pointer-events-none"
          />
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 my-2">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              onClick={() => setActiveSlide(dot)}
              aria-label={`Go to slide ${dot + 1}`}
              className={`transition-all ${
                activeSlide === dot
                  ? "w-2 h-2 rounded-full bg-[#0066FF]"
                  : "w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

      </main>

      {/* Action Buttons & Footer */}
      <footer className="w-full space-y-2.5 pt-2">
        <Button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          onClick={onLogin}
          variant="outline"
          className="w-full h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm active:scale-98 transition-all"
        >
          <span>I Already Have an Account</span>
        </Button>

        <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
          Made with <span className="text-red-500">❤️</span> in India
        </div>
      </footer>

    </div>
  );
}
