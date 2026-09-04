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
          const hasActiveSub = currentUser?.is_admin || (currentUser?.subscription && currentUser?.subscription.status === "active");
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
    <div className="min-h-screen relative overflow-hidden bg-[#FAF6F0] font-sans selection:bg-brand-terracotta/20 flex flex-col justify-between">
      
      {/* 3D Particle Ambient Canvas */}
      <ThreeDBackground />

      {/* Ambient 3D Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-terracotta/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Navbar */}
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
          <span className="text-xs font-semibold text-brand-indigo/60 hidden sm:inline">New to Dukaan?</span>
          <Link 
            to="/register" 
            className="text-xs font-bold px-4 py-2 rounded-full border-2 border-brand-mitti text-brand-indigo hover:border-brand-indigo bg-white/60 backdrop-blur-md shadow-xs active:scale-95 transition-all"
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-brand-mitti shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                <span className="text-xs font-bold text-brand-indigo uppercase tracking-wider font-mono">
                  Retail Command Center
                </span>
              </div>
              <h1 className="font-display text-5xl xl:text-6xl font-extrabold text-brand-indigo leading-[1.1] tracking-tight">
                Run your shop.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-terracotta via-amber-600 to-brand-terracotta">
                  Smarter & Faster.
                </span>
              </h1>
              <p className="text-base text-brand-indigo/70 max-w-lg font-medium leading-relaxed">
                Log in to access high-speed POS billing, digital customer khata, WhatsApp payment reminders, and multi-year tax reports.
              </p>
            </div>

            {/* 3D Floating Interactive Widgets Stage */}
            <div className="relative pt-4 pb-8">
              
              {/* Main 3D Showcase Card */}
              <Card3D depth={18} className="w-full max-w-md">
                <div className="bg-gradient-to-br from-white via-white/95 to-brand-sand/50 p-6 rounded-3xl border-2 border-white/80 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  
                  {/* Decorative background grid line */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1B1464_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
                  
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-brand-mitti">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-brand-indigo font-mono uppercase tracking-wider">
                        COUNTER 01 · READY
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-sand text-brand-indigo border border-brand-mitti">
                      F1 Billing Active
                    </span>
                  </div>

                  {/* Bill Simulation Preview */}
                  <div className="mt-4 p-4 rounded-2xl bg-brand-sand/60 border border-brand-mitti/70 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-brand-indigo/70">Walk-in Customer Memo</span>
                      <span className="font-mono font-bold text-brand-indigo">#OD-8821</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-brand-indigo">Total Collected</span>
                      <span className="font-display font-extrabold text-2xl text-emerald-700">₹450.00</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 pt-1 border-t border-brand-mitti/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid via UPI · E-Receipt Dispatched
                    </div>
                  </div>

                  {/* 3 Live Mini Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-brand-mitti shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Speed</div>
                      <div className="font-mono font-bold text-brand-indigo text-xs">0.8s / Bill</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-brand-mitti shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Recovery</div>
                      <div className="font-mono font-bold text-emerald-700 text-xs">92% Khata</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-brand-mitti shadow-2xs">
                      <div className="text-[10px] uppercase font-bold text-brand-terracotta">Stock</div>
                      <div className="font-mono font-bold text-brand-terracotta text-xs">Live Sync</div>
                    </div>
                  </div>

                </div>
              </Card3D>

              {/* Floating Hologram Soundbox Pill */}
              <div className="absolute -bottom-4 right-6 bg-gradient-to-r from-brand-indigo to-[#2A2375] text-white px-4 py-2.5 rounded-2xl shadow-xl border-2 border-brand-indigo/40 flex items-center gap-2.5 animate-bounce">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold">Soundbox: ₹450 Prapt Hue!</span>
              </div>

            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-6 text-xs font-medium text-brand-indigo/70 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted Khata</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-terracotta" />
                <span>GST & Thermal Ready</span>
              </div>
            </div>

          </div>

          {/* =========================================================
              RIGHT COLUMN: 3D CARD LOGIN FORM
          ========================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto animate-fade-up">
            
            <Card3D depth={12}>
              <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-brand-mitti shadow-2xl relative overflow-hidden">
                
                {/* Top Subtle Light Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-terracotta via-amber-500 to-brand-indigo" />

                {/* Form Header */}
                <div className="mb-7">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-[11px] font-bold text-brand-indigo mb-2">
                    <Store className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>Owner Portal</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-brand-indigo tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-brand-indigo/60 font-medium mt-1">
                    Sign in to open your shop counter and billing register.
                  </p>
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
                          className="text-xs font-bold text-brand-terracotta underline hover:text-brand-terracotta/80 block"
                        >
                          Click here to enter your verification code →
                        </Link>
                      </div>
                    )}
                    {err.toLowerCase().includes("no account found") && (
                      <div className="pt-1 pl-4">
                        <Link 
                          to="/register" 
                          className="text-xs font-bold text-brand-terracotta underline hover:text-brand-terracotta/80 block"
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
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      Shop Email
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourdukaan.com"
                        className="pl-11 pr-4 h-12 rounded-2xl border-2 border-brand-mitti focus-visible:border-brand-terracotta bg-brand-sand/40 text-sm font-medium text-brand-indigo"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                        Password
                      </Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs font-bold text-brand-terracotta hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-11 pr-11 h-12 rounded-2xl border-2 border-brand-mitti focus-visible:border-brand-terracotta bg-brand-sand/40 text-sm font-medium text-brand-indigo font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-indigo/40 hover:text-brand-indigo p-1"
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
                      className="border-2 border-brand-mitti data-[state=checked]:bg-brand-indigo data-[state=checked]:border-brand-indigo rounded-md"
                    />
                    <Label htmlFor="remember" className="text-xs font-semibold text-brand-indigo/70 cursor-pointer select-none">
                      Keep me logged in on this device
                    </Label>
                  </div>

                  {/* 3D Main Submit Button */}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full h-13 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    <span>{busy ? "Authenticating..." : "Log in to Dukaan"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                </form>

                {/* Register Footer */}
                <div className="pt-6 mt-6 border-t border-brand-mitti text-center text-xs font-semibold text-brand-indigo/70">
                  <span>Don't have a shop account? </span>
                  <Link to="/register" className="text-brand-terracotta font-bold hover:underline">
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
