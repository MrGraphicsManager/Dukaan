import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function MobileResetSuccess({ onGoToLogin }) {
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col justify-between p-6 select-none animate-in zoom-in-95 duration-200">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Animated Badge */}
        <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 mb-6 shadow-xl shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-14 h-14 stroke-[2.2]" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Password Reset Successfully!
        </h1>
        <p className="text-sm text-slate-500 mt-2.5 max-w-xs leading-relaxed">
          Your password has been changed securely. You can now log in using your new credentials.
        </p>

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 w-full max-w-xs text-left">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Security Notice
          </div>
          <div className="text-xs text-slate-600 font-medium">
            A confirmation SMS has been dispatched to your mobile number.
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={onGoToLogin}
          className="w-full py-4 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Go to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
