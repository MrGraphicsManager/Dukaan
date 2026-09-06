import React, { useState } from "react";
import { ArrowLeft, KeyRound, Phone, ArrowRight } from "lucide-react";

export default function MobileForgotPassword({ onBack, onSendOtp, onBackToLogin }) {
  const [phone, setPhone] = useState("9876543210");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSendOtp) onSendOtp(phone);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-800">Forgot Password</span>
          <div className="w-10" />
        </div>

        {/* Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] mx-auto mb-4 shadow-sm">
            <KeyRound className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h1>
          <p className="text-sm text-slate-500 mt-2 px-4 leading-relaxed">
            Enter your registered mobile number and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Registered Mobile Number
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
              <div className="px-3 py-3.5 border-r border-slate-200 text-sm font-bold text-slate-600 bg-slate-100/60 select-none">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 10 digit number"
                className="w-full px-3.5 py-3.5 text-sm text-slate-800 bg-transparent outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pt-6 pb-2 text-center text-xs text-slate-600">
        Remember your password?{" "}
        <button
          onClick={onBackToLogin}
          className="font-bold text-[#0066FF] hover:underline cursor-pointer ml-1"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
