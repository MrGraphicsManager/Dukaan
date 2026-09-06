import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ArrowRight, 
  Receipt, 
  Package, 
  Users, 
  BarChart3,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "udhaar", label: "Udhaar", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "gu", label: "ગુજરાતી" },
];

export default function MobileWelcome({ onGetStarted, onLogin }) {
  const nav = useNavigate();
  const [selectedLang, setSelectedLang] = useState("English");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      nav("/register");
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      nav("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between px-6 pt-4 pb-7 max-w-md mx-auto relative select-none overflow-x-hidden">
      
      {/* Top Bar: Language Dropdown */}
      <header className="w-full flex items-center justify-end relative z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
          >
            <span>{selectedLang}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Language Dropdown Menu */}
          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.label);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                    selectedLang === lang.label ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  <span>{lang.label}</span>
                  {selectedLang === lang.label && <Check className="w-3 h-3 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center text-center my-auto py-1">
        
        {/* Dukaan Official Logo with Tagline */}
        <div className="relative flex justify-center mt-1 mb-1">
          <img
            src="/assets/mobile/dukaan_mobile_logo.png"
            alt="Dukaan - Business Made Simple"
            className="h-32 sm:h-36 w-auto object-contain drop-shadow-xs"
          />
        </div>

        {/* Heading: Manage · Sell · Grow */}
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-snug mt-2">
          Manage · Sell · <span className="text-[#0066FF]">Grow</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1.5 max-w-[300px]">
          Everything your business needs, in one simple app.
        </p>

        {/* 4 Feature Quick-Pills */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-[340px] mt-5 mb-2">
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
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? "bg-[#E6F0FF] text-[#0066FF] shadow-sm scale-105" 
                      : "bg-[#F3F6FA] text-[#0066FF] hover:bg-[#E6F0FF]"
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 mt-1.5 tracking-tight group-hover:text-blue-600">
                  {feat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3D Indian Storefront Illustration */}
        <div className="w-full max-w-[380px] my-2 relative flex justify-center">
          <img
            src="/assets/mobile/dukaan_storefront_3d.png"
            alt="Dukaan Storefront - Bade Vyapaar ki Simple Shuruaat"
            className="w-full h-auto max-h-[250px] object-contain select-none pointer-events-none"
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
      <footer className="w-full space-y-3 pt-2">
        
        {/* Primary CTA: Get Started */}
        <Button
          onClick={handleGetStarted}
          data-testid="mobile-get-started-btn"
          className="w-full h-12 sm:h-13 rounded-2xl bg-[#0066FF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        {/* Secondary Button: I Already Have an Account */}
        <Button
          onClick={handleLogin}
          data-testid="mobile-login-btn"
          variant="outline"
          className="w-full h-12 sm:h-13 rounded-2xl border border-blue-200/80 bg-white hover:bg-blue-50/40 text-[#0066FF] font-bold text-sm sm:text-base active:scale-98 transition-all"
        >
          <span>I Already Have an Account</span>
        </Button>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400 font-medium pt-1">
          Made with <span className="text-red-500">❤️</span> in India
        </div>

      </footer>

    </div>
  );
}
