import React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", badge: "EN", name: "English" },
  { code: "hi", badge: "हि", name: "Hindi" },
  { code: "gu", badge: "ગુ", name: "Gujarati" },
  { code: "mr", badge: "म", name: "Marathi" },
  { code: "ta", badge: "த", name: "Tamil" },
  { code: "te", badge: "తె", name: "Telugu" },
  { code: "kn", badge: "ಕ", name: "Kannada" },
];

export default function Screen2Language({ selectedLang, onSelectLang, onNext, onBack }) {
  const current = selectedLang || "en";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between px-6 pt-3 pb-6 max-w-md mx-auto select-none">
      
      {/* Top Header with Back Arrow */}
      <header className="w-full flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      {/* Title & Subtitle */}
      <div className="mt-4 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Choose Language
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Select your preferred language to continue.
        </p>
      </div>

      {/* Language List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
        {LANGUAGES.map((lang) => {
          const isSelected = current === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSelectLang(lang.code)}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between border transition-all active:scale-98 ${
                isSelected
                  ? "border-blue-500 bg-[#F4F8FF] text-blue-600 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isSelected
                      ? "bg-[#0066FF] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {lang.badge}
                </div>
                <span className="font-semibold text-sm text-slate-900">
                  {lang.name}
                </span>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <footer className="w-full pt-4">
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
