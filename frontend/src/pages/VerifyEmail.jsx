import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  RotateCw, 
  Store, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";

export default function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();

  const emailParam = params.get("email") || "";
  const tokenParam = params.get("token") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);

  // If direct link token is in URL (clicked from real email), auto-verify
  useEffect(() => {
    if (tokenParam && emailParam) {
      handleAutoVerify(emailParam, tokenParam);
    }
  }, [tokenParam, emailParam]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleAutoVerify = async (targetEmail, token) => {
    setBusy(true);
    setErr("");
    const res = await verifyEmail(targetEmail, token);
    setBusy(false);
    if (res.ok) {
      setVerified(true);
      toast.success("Email verified successfully! Please select your subscription plan.");
      setTimeout(() => {
        nav("/subscribe");
      }, 1500);
    } else {
      setErr(res.error || "Failed to verify email link. Please enter the 6-digit code manually.");
    }
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setErr("Please enter your registered email address.");
      return;
    }
    if (!code || code.trim().length < 6) {
      setErr("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setBusy(true);
    setErr("");
    const res = await verifyEmail(email, code.trim());
    setBusy(false);
    if (res.ok) {
      setVerified(true);
      toast.success("Email verified successfully! Welcome to Dukaan.");
      setTimeout(() => {
        nav("/subscribe");
      }, 1500);
    } else {
      setErr(res.error || "Invalid verification code. Please check your email and try again.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address to resend the code.");
      return;
    }
    setResending(true);
    const res = await resendVerification(email);
    setResending(false);
    if (res.ok) {
      setCooldown(60);
      toast.success("A fresh verification code has been dispatched to your email!");
    } else {
      toast.error(res.error || "Failed to resend email. Please check your email address.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF6F0] font-sans selection:bg-brand-terracotta/20 flex flex-col justify-between">
      
      {/* 3D Ambient Background */}
      <ThreeDBackground />

      {/* Top Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-terracotta/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-indigo text-white grid place-items-center shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-display font-bold text-2xl text-brand-indigo tracking-tight">Dukaan</div>
            <div className="text-[10px] text-brand-indigo/50 uppercase tracking-widest font-mono font-bold">Smart Retail OS</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="text-xs font-bold px-4 py-2 rounded-full border border-brand-mitti text-brand-indigo hover:border-brand-indigo bg-white/60 backdrop-blur-md shadow-xs"
          >
            Back to Sign In
          </Link>
        </div>
      </header>

      {/* Verification Card Stage */}
      <main className="relative z-20 max-w-md mx-auto w-full px-6 py-6 my-auto animate-fade-up">
        <Card3D depth={12}>
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-brand-mitti shadow-2xl relative overflow-hidden">
            
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-terracotta via-amber-500 to-brand-indigo" />

            {verified ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 grid place-items-center shadow-sm">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>
                <h2 className="font-display text-2xl font-bold text-brand-indigo">
                  Email Verified!
                </h2>
                <p className="text-xs text-brand-indigo/70 font-medium">
                  Your account is now verified. Redirecting you to choose your subscription plan...
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => nav("/subscribe")}
                    className="w-full h-11 rounded-full bg-brand-terracotta text-white font-bold shadow-md"
                  >
                    Continue to Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-terracotta/10 text-brand-terracotta grid place-items-center">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-[10px] font-bold text-brand-indigo mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>Secure Verification</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-brand-indigo">
                    Verify Your Email
                  </h2>
                  <p className="text-xs text-brand-indigo/60 font-medium mt-1">
                    We've sent a 6-digit verification code to:
                  </p>
                  <p className="text-xs font-bold font-mono text-brand-terracotta mt-0.5 break-all">
                    {email || "your registered email"}
                  </p>
                  <p className="text-[11px] text-brand-indigo/50 mt-1">
                    Please check your inbox & spam folder.
                  </p>
                </div>

                {err && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{err}</span>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                  {!emailParam && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-brand-indigo/70 block mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-11 rounded-xl border-brand-mitti"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-indigo/70 block mb-1">
                      Enter 6-Digit Code from Email
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="h-14 text-center text-2xl font-bold font-mono tracking-widest rounded-2xl border-2 border-brand-mitti focus:border-brand-terracotta text-brand-indigo"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={busy || code.length < 6}
                    className="w-full h-12 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {busy ? "Verifying Code..." : "Verify & Activate Account"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-brand-mitti/60 text-center space-y-2">
                  <p className="text-xs text-brand-indigo/60">
                    Didn't receive the email in your inbox or spam?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resending || cooldown > 0}
                    onClick={handleResend}
                    className="rounded-full border-brand-mitti text-xs font-bold text-brand-indigo hover:border-brand-indigo"
                  >
                    <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${resending ? "animate-spin" : ""}`} />
                    {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}
                  </Button>
                  <div className="pt-2">
                    <Link 
                      to="/register" 
                      className="text-[11px] text-brand-indigo/50 hover:text-brand-terracotta underline"
                    >
                      Entered wrong email? Register again
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </Card3D>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-brand-indigo/50">
        © 2026 Dukaan Technologies Private Limited. All rights reserved.
      </footer>

    </div>
  );
}
