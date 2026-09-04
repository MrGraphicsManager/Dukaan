import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Lock, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  KeyRound,
  AlertCircle
} from "lucide-react";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const emailParam = params.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const hasMinLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(pw);
  const isPasswordValid = hasMinLength && hasUpper && hasNumber && hasSymbol;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!token && (!code.trim() || !email.trim())) {
      setErr("Please provide your email and the 6-digit reset code.");
      return;
    }

    if (!isPasswordValid) {
      setErr("Password must be at least 8 characters and contain an uppercase letter, a number, and a symbol.");
      return;
    }

    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      await api.post("/auth/reset-password", { 
        token: token || undefined,
        code: code ? code.trim() : undefined,
        email: cleanEmail || undefined,
        new_password: pw 
      });

      // Also update local registered accounts if offline
      try {
        let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        regUsers = regUsers.map(u => u.email.toLowerCase() === cleanEmail ? { ...u, password: pw } : u);
        localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      } catch {}

      toast.success("Password reset successfully! You can now log in.");
      nav("/login");
    } catch (e) {
      // Local fallback reset checking
      try {
        let resets = JSON.parse(localStorage.getItem("dukaan_password_resets") || "[]");
        const match = resets.find(r => 
          (token && r.token === token) || 
          (code && r.code === code.trim() && r.email === cleanEmail)
        );

        if (match) {
          let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
          regUsers = regUsers.map(u => u.email.toLowerCase() === match.email.toLowerCase() ? { ...u, password: pw } : u);
          localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
          toast.success("Password reset successfully! You can now log in.");
          nav("/login");
          return;
        }
      } catch {}

      setErr(formatApiError(e.response?.data?.detail) || "Invalid or expired reset code. Please request a new one.");
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans selection:bg-blue-500/20 flex flex-col justify-between">
      <ThreeDBackground />

      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Dukaan" 
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
            Retail OS
          </span>
        </Link>
        <Link 
          to="/login" 
          className="text-xs font-bold px-4 py-2 rounded-full border-2 border-blue-200 text-blue-700 hover:border-blue-600 bg-white/80 backdrop-blur-md shadow-xs active:scale-95 transition-all"
        >
          Back to Login
        </Link>
      </header>

      {/* Main Card */}
      <main className="relative z-20 max-w-md mx-auto w-full px-6 py-6 my-auto animate-fade-up">
        <Card3D depth={12}>
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Password Reset</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Set New Password
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter your security details and choose a strong new password.
              </p>
            </div>

            {err && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" data-testid="reset-form">
              
              {!token && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      Registered Email
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourdukaan.com"
                        className="pl-11 pr-4 h-11 rounded-xl border-brand-mitti bg-brand-sand/40 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      6-Digit Reset Code
                    </Label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type="text"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="pl-11 pr-4 h-11 rounded-xl border-brand-mitti bg-brand-sand/40 text-sm font-mono tracking-widest font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                  <Input 
                    data-testid="reset-pw" 
                    type={showPw ? "text" : "password"} 
                    value={pw} 
                    onChange={(e) => setPw(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="pl-11 pr-11 h-12 rounded-2xl border-2 border-brand-mitti bg-brand-sand/40 text-sm font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-indigo/40 hover:text-brand-indigo p-1"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Rules Checklist */}
                <div className="pt-2 p-3 bg-brand-sand/60 rounded-2xl border border-brand-mitti/80 space-y-1.5 text-[11px]">
                  <div className="font-bold text-brand-indigo/70 text-[10px] uppercase tracking-wider mb-1">
                    Requirements:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? "text-emerald-700 font-bold" : "text-brand-indigo/50"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasMinLength ? "text-emerald-600" : "text-brand-indigo/30"}`} />
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${hasUpper ? "text-emerald-700 font-bold" : "text-brand-indigo/50"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasUpper ? "text-emerald-600" : "text-brand-indigo/30"}`} />
                      <span>1 Capital Letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${hasNumber ? "text-emerald-700 font-bold" : "text-brand-indigo/50"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasNumber ? "text-emerald-600" : "text-brand-indigo/30"}`} />
                      <span>1 Number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${hasSymbol ? "text-emerald-700 font-bold" : "text-brand-indigo/50"}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${hasSymbol ? "text-emerald-600" : "text-brand-indigo/30"}`} />
                      <span>1 Symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                  <Input 
                    data-testid="reset-pw2" 
                    type={showPw ? "text" : "password"} 
                    value={pw2} 
                    onChange={(e) => setPw2(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="pl-11 pr-4 h-12 rounded-2xl border-2 border-slate-200 bg-slate-50/70 text-sm font-medium font-mono"
                  />
                </div>
              </div>

              <Button 
                data-testid="reset-submit" 
                disabled={busy || !isPasswordValid || pw !== pw2} 
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all mt-3 flex items-center justify-center gap-2"
              >
                <span>{busy ? "Saving New Password..." : "Update Password & Log In"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

            </form>
          </div>
        </Card3D>
      </main>

      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-400">
        © 2026 Dukaan Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
