import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";

export default function MobileVerifyOtp({ phone = "9876543210", onBack, onVerifySuccess }) {
  const [otp, setOtp] = useState(["4", "2", "8", "1", "9", "0"]);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(45);
    setCanResend(false);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onVerifySuccess) onVerifySuccess();
    }, 600);
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
          <span className="text-sm font-bold text-slate-800">Verify OTP</span>
          <div className="w-10" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] mx-auto mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">OTP Verification</h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter the 6-digit code sent to{" "}
            <span className="font-bold text-slate-800">+91 {phone}</span>
          </p>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#0066FF] hover:underline mt-1 cursor-pointer"
          >
            Edit Number
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 text-center">
            {error}
          </div>
        )}

        {/* OTP Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-xs font-bold text-[#0066FF] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend OTP
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              Resend OTP in{" "}
              <span className="font-bold text-slate-800">
                00:{timer < 10 ? `0${timer}` : timer}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="text-center py-4 text-[11px] text-slate-400">
        Secure OTP Verification · Dukaan Cloud
      </div>
    </div>
  );
}
