import React, { useState } from "react";
import { ArrowLeft, ArrowRight, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Screen3CreateAccount({ formData, updateFormData, onNext, onBack, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

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
          onClick={onLogin}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
        >
          Log In
        </button>
      </header>

      {/* Title */}
      <div className="mt-3 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Let's set up your account to manage your business.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        
        {/* Full Name */}
        <div className="border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <User className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              placeholder="Priyen Naik"
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2.5 shrink-0">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-800">+91</span>
          </div>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="Mobile Number"
            className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>

        {/* Email Address (Optional) */}
        <div className="border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Mail className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="Email Address (Optional)"
            className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>

        {/* Create Password */}
        <div className="border border-slate-200 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-3 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="flex items-center gap-3 w-full">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) => updateFormData({ password: e.target.value })}
              placeholder="Create Password"
              className="w-full text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* T&C Checkbox */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span className="text-xs text-slate-500 leading-tight font-medium">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </span>
        </label>

      </div>

      {/* Buttons */}
      <footer className="w-full space-y-3 pt-3">
        <Button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Continue with Google */}
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "https://officialdukaan.in/auth/google";
          }}
          className="w-full h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 active:scale-98 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </footer>

    </div>
  );
}
