import React from "react";
import { ArrowLeft, ArrowRight, Store, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const BUSINESS_TYPES = [
  "Grocery Store",
  "Kirana & General Store",
  "Clothing & Garments",
  "Footwear & Shoes",
  "Electronics & Mobile",
  "Medical & Pharmacy",
  "Hardware & Sanitary",
  "Bakery & Sweets",
  "Restaurant & Cafe",
  "Other Retail",
];

const CATEGORIES = [
  "Retail",
  "Wholesale",
  "Distributor",
  "Services",
  "Manufacturing",
];

export default function Screen4BusinessDetails({ formData, updateFormData, onNext, onBack }) {
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
      </header>

      {/* Title */}
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tell Us About Your Business
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          This helps us personalize your experience.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5 flex-1 overflow-y-auto">
        
        {/* Business Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Business Name
          </label>
          <div className="border border-slate-200 rounded-2xl px-3.5 py-3 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input
              type="text"
              value={formData.businessName || ""}
              onChange={(e) => updateFormData({ businessName: e.target.value })}
              placeholder="ABC General Store"
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Business Type */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Business Type
          </label>
          <div className="relative border border-slate-200 rounded-2xl px-3.5 py-3 bg-white focus-within:border-blue-500 transition-all">
            <select
              value={formData.businessType || "Grocery Store"}
              onChange={(e) => updateFormData({ businessType: e.target.value })}
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent appearance-none pr-8 cursor-pointer"
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Business Category */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Business Category
          </label>
          <div className="relative border border-slate-200 rounded-2xl px-3.5 py-3 bg-white focus-within:border-blue-500 transition-all">
            <select
              value={formData.category || "Retail"}
              onChange={(e) => updateFormData({ category: e.target.value })}
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent appearance-none pr-8 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Business Address */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Business Address
          </label>
          <div className="border border-slate-200 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Navsari, Gujarat"
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

      </div>

      {/* Bottom Button */}
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
