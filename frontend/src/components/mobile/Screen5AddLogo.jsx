import React, { useRef } from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Screen5AddLogo({ formData, updateFormData, onNext, onBack, onSkip }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateFormData({ logoUrl: url });
    }
  };

  const nameInitial = (formData.businessName || "A").trim().charAt(0).toUpperCase();

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
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Add Your Store Logo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Make your business stand out. You can change this later.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-5 flex-1">
        
        {/* Upload Box */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-44 rounded-3xl border-2 border-dashed border-blue-200 bg-[#F6F9FF] hover:bg-[#EEF4FF] cursor-pointer flex flex-col items-center justify-center p-4 transition-all active:scale-98"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center shadow-md mb-2.5">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Tap to upload logo
          </span>
          <span className="text-[11px] font-medium text-slate-400 mt-0.5">
            PNG, JPG (Max 5MB)
          </span>
        </div>

        {/* Live Preview Box */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Preview
          </span>

          <div className="border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3.5 bg-white shadow-xs">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo Preview"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                {nameInitial}
              </div>
            )}

            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                {formData.businessName || "ABC General Store"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {formData.address || "Navsari, Gujarat"}
              </p>
            </div>
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
