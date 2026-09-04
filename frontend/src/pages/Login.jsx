import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Zap, 
  Store, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Receipt, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Volume2,
  TrendingUp
} from "lucide-react";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";
import OnboardingLoader from "@/components/OnboardingLoader";
import SocialAuthButtons from "@/components/SocialAuthButtons";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [needVerify, setNeedVerify] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setNeedVerify(false);
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      if (rememberMe) {
        localStorage.setItem("dukaan_remember", "true");
      } else {
        localStorage.removeItem("dukaan_remember");
      }
      toast.success("Welcome back to Dukaan!");
      setShowLoader(true);
    } else {
      if (res.needVerification) {
        setNeedVerify(true);
        setErr(res.error || "Please verify your email address to continue.");
        toast.warning("Please verify your email first.");
      } else {
        setErr(res.error || "Invalid email or password. Please try again.");
      }
    }
  };

  if (showLoader) {
    return (
      <OnboardingLoader 
        onComplete={() => {
          let currentUser = null;
          try {
            currentUser = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
          } catch {}
          const isSubActive = (sub) => {
            if (!sub) return false;
            const st = (sub.status || "").toLowerCase();
            const valid = st === "active" || st === "trial" || sub.is_trial === true;
            if (!valid) return false;
            if (!sub.expires_at) return true;
            const exp = new Date(sub.expires_at).getTime();
            return !isNaN(exp) && exp > Date.now();
          };
          const hasActiveSub = Boolean(currentUser?.is_admin || isSubActive(currentUser?.subscription));
          if (!hasActiveSub) {
            nav("/subscribe");
          } else {
            nav("/app");
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans selection:bg-blue-500/20 flex flex-col justify-between">
      
      {/* 3D Particle Ambient Canvas */}
      <ThreeDBackground />

      {/* Ambient 3D Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Dukaan" 
            className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">
            Retail OS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">New to Dukaan?</span>
          <Link 
            to="/register" 
            className="text-xs font-bold px-4 py-2 rounded-full border-2 border-blue-200 text-blue-700 hover:border-blue-600 bg-white/80 backdrop-blur-md shadow-xs active:scale-95 transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main 3D Dual-Pane Stage */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-6 py-4 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* =========================================================
              LEFT COLUMN: 3D INTERACTIVE HERO SHOWCASE (DESKTOP)
          ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 animate-fade-up">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-blue-200 shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider font-mono">
                  Retail Command Center
                </span>
              </div>
              <h1 className="font-display text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Run your shop.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600">
                  Smarter & Faster.
                </span>
              </h1>
              <p className="text-base text-slate-600 max-w-lg font-medium leading-relaxed">
                Log in to access high-speed POS billing, digital customer khata, WhatsApp payment reminders, and multi-year tax reports.
              </p>
            </div>

            {/* 3D Floating Interactive Widgets Stage */}
            <div className="relative pt-4 pb-8">
              
              {/* Main 3D Showcase Card */}
              <Card3D depth={18} className="w-full max-w-md">
                <div className="bg-gradient-to-br from-white via-white/95 to-blue-50/50 p-6 rounded-3xl border-2 border-white/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  
                  {/* Decorative background grid line */}
                  <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
                  
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                        COUNTER 01 · READY
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      F1 Billing Active
                    </span>
                  </div>

                  {/* Bill Simulation Preview */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600">Walk-in Customer Memo</span>
                      <span className="font-mono font-bold text-slate-900">#OD-8821</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-700">Total Collected</span>
                      <span className="font-display font-extrabold text-2xl text-emerald-700">₹450.00</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 pt-1 border-t border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid via UPI · E-Receipt Dispatched
                    </div>
                  </div>

                  {/* 3 Live Mini Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Speed</div>
                      <div className="font-mono font-bold text-slate-800 text-xs">0.8s / Bill</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Recovery</div>
                      <div className="font-mono font-bold text-emerald-700 text-xs">92% Khata</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-blue-600">Stock</div>
                      <div className="font-mono font-bold text-blue-600 text-xs">Live Sync</div>
                    </div>
                  </div>

                </div>
              </Card3D>

              {/* Floating Hologram Soundbox Pill */}
              <div className="absolute -bottom-4 right-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5 rounded-2xl shadow-xl border-2 border-blue-400/40 flex items-center gap-2.5 animate-bounce">
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-mono font-bold">Soundbox: ₹450 Prapt Hue!</span>
              </div>

            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-6 text-xs font-medium text-slate-600 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted Khata</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>GST & Thermal Ready</span>
              </div>
            </div>

          </div>

          {/* =========================================================
              RIGHT COLUMN: 3D CARD LOGIN FORM
          ========================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto animate-fade-up">
            
            <Card3D depth={12}>
              <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-2xl relative overflow-hidden">
                
                {/* Top Subtle Light Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

                {/* Form Header */}
                <div className="text-center mb-6">
                  <Link to="/" className="inline-block mb-3 transition-transform hover:scale-105">
                    <img 
                      src="/logo.png" 
                      alt="Dukaan" 
                      className="h-12 sm:h-14 w-auto object-contain mx-auto drop-shadow-xs" 
                    />
                  </Link>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Retail OS · Owner Portal</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Sign in to open your shop counter and billing register.
                  </p>
                </div>

                {/* 1-Click Social Sign In (Google & Apple) */}
                <div className="mb-5">
                  <SocialAuthButtons mode="login" />
                </div>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold font-mono tracking-wider">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {err && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold space-y-1.5 animate-shake">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                      <span>{err}</span>
                    </div>
                    {needVerify && (
                      <div className="pt-1 pl-4">
                        <Link 
                          to={`/verify-email?email=${encodeURIComponent(email)}`} 
                          className="text-xs font-bold text-blue-600 underline hover:text-blue-700 block"
                        >
                          Click here to enter your verification code →
                        </Link>
                      </div>
                    )}
                    {err.toLowerCase().includes("no account found") && (
                      <div className="pt-1 pl-4">
                        <Link 
                          to="/register" 
                          className="text-xs font-bold text-blue-600 underline hover:text-blue-700 block"
                        >
                          Create a new account now →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={submit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Shop Email
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourdukaan.com"
                        className="pl-11 pr-4 h-12 rounded-2xl border-2 border-slate-200 focus-visible:border-blue-600 bg-slate-50/70 text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Password
                      </Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-11 pr-11 h-12 rounded-2xl border-2 border-slate-200 focus-visible:border-blue-600 bg-slate-50/70 text-sm font-medium text-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      className="border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
                    />
                    <Label htmlFor="remember" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      Keep me logged in on this device
                    </Label>
                  </div>

                  {/* Main Submit Button */}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    <span>{busy ? "Authenticating..." : "Log in to Dukaan"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                </form>

                {/* Register Footer */}
                <div className="pt-6 mt-6 border-t border-slate-200 text-center text-xs font-semibold text-slate-600">
                  <span>Don't have a shop account? </span>
                  <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Create your free shop
                  </Link>
                </div>

              </div>
            </Card3D>

          </div>

        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-20 py-4 text-center text-xs text-brand-indigo/40 font-medium">
        Dukaan Retail OS · Designed for Indian Small Businesses · 2026
      </footer>

    </div>
  );
}
