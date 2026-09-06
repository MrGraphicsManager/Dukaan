import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";

export default function MobileResetPassword({ onBack, onResetSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Criteria
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const matches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasMinLength) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!matches) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onResetSuccess) onResetSuccess();
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
          <span className="text-sm font-bold text-slate-800">Set New Password</span>
          <div className="w-10" />
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a strong password that you don't use for other accounts.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-3 text-sm text-slate-800 bg-transparent outline-none font-medium pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-[#0066FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-3 text-sm text-slate-800 bg-transparent outline-none font-medium pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2 mt-4 text-xs font-medium">
            <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
              {hasMinLength ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
              {hasNumber ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>At least 1 number</span>
            </div>
            <div className={`flex items-center gap-2 ${hasSpecial ? "text-emerald-600" : "text-slate-400"}`}>
              {hasSpecial ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>At least 1 special character</span>
            </div>
            <div className={`flex items-center gap-2 ${matches ? "text-emerald-600" : "text-slate-400"}`}>
              {matches ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !hasMinLength || !matches}
            className="w-full py-3.5 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>

      <div className="text-center py-4 text-[11px] text-slate-400">
        Password Reset Protection · Dukaan Cloud
      </div>
    </div>
  );
}
