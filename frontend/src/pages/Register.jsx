import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Zap, 
  Store, 
  Mail, 
  Lock, 
  UserRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  BadgePercent,
  Receipt,
  MessageSquare
} from "lucide-react";
import Card3D from "@/components/Card3D";
import ThreeDBackground from "@/components/ThreeDBackground";

export default function Register() {
  const { register, login } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); 
    setBusy(true);
    const res = await register(name, email, password);
    setBusy(false);
    if (res.ok) {
      toast.success("Shop account created successfully!");
      nav("/subscribe");
    } else {
      setErr(res.error || "Failed to create account. Please try again.");
    }
  };

  const handleQuickDemo = async () => {
    setBusy(true);
    const res = await register("Apna Kirana Store", "newshop@dukaan.in", "demo12345");
    setBusy(false);
    if (res.ok) {
      toast.success("Fresh Demo Shop created!");
      nav("/app");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF6F0] font-sans selection:bg-brand-terracotta/20 flex flex-col justify-between">
      
      {/* 3D Particle Ambient Canvas */}
      <ThreeDBackground />

      {/* Ambient 3D Glowing Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-terracotta/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-indigo text-white grid place-items-center shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-display font-bold text-2xl text-brand-indigo tracking-tight">दुकान · Dukaan</div>
            <div className="text-[10px] text-brand-indigo/50 uppercase tracking-widest font-mono font-bold">Smart Retail OS</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-brand-indigo/60 hidden sm:inline">Already registered?</span>
          <Link 
            to="/login" 
            className="text-xs font-bold px-4 py-2 rounded-full border-2 border-brand-mitti text-brand-indigo hover:border-brand-indigo bg-white/60 backdrop-blur-md shadow-xs active:scale-95 transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main 3D Dual-Pane Stage */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-6 py-4 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* =========================================================
              LEFT COLUMN: 3D CARD SIGN IN / REGISTER FORM
          ========================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto animate-fade-up">
            
            <Card3D depth={12}>
              <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-brand-mitti shadow-2xl relative overflow-hidden">
                
                {/* Top Subtle Light Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-terracotta via-amber-500 to-brand-indigo" />

                {/* Form Header */}
                <div className="mb-7">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-[11px] font-bold text-brand-indigo mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>Instant Shop Setup</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-brand-indigo tracking-tight">
                    Open Your Shop
                  </h2>
                  <p className="text-xs text-brand-indigo/60 font-medium mt-1">
                    Free to start. No credit card required. Ready in 30 seconds.
                  </p>
                </div>

                {/* Error Banner */}
                {err && (
                  <div className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                    <span>{err}</span>
                  </div>
                )}

                {/* Register Form */}
                <form onSubmit={submit} className="space-y-4">
                  
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      Your Name / Shop Name
                    </Label>
                    <div className="relative">
                      <UserRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ramesh Bhai (Apna Kirana)"
                        className="pl-11 pr-4 h-12 rounded-2xl border-2 border-brand-mitti focus-visible:border-brand-terracotta bg-brand-sand/40 text-sm font-medium text-brand-indigo"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourshop.com"
                        className="pl-11 pr-4 h-12 rounded-2xl border-2 border-brand-mitti focus-visible:border-brand-terracotta bg-brand-sand/40 text-sm font-medium text-brand-indigo"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-indigo/70">
                      Create Password (min 6 characters)
                    </Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
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

                  {/* 3D Main Submit Button */}
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full h-13 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    <span>{busy ? "Setting up Shop..." : "Create My Free Shop"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-brand-mitti w-full" />
                    <span className="bg-white px-3 text-[10px] uppercase font-bold text-brand-indigo/40 absolute tracking-widest">
                      instant test
                    </span>
                  </div>

                  {/* 1-Click Quick Register Button */}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={handleQuickDemo}
                    className="w-full h-12 rounded-full border-2 border-brand-mitti text-brand-indigo font-bold text-xs hover:border-brand-indigo hover:bg-brand-sand/40 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>1-Click Instant Demo Setup</span>
                  </Button>

                </form>

                {/* Login Footer */}
                <div className="pt-6 mt-6 border-t border-brand-mitti text-center text-xs font-semibold text-brand-indigo/70">
                  <span>Already have an account? </span>
                  <Link to="/login" className="text-brand-terracotta font-bold hover:underline">
                    Sign in to your shop
                  </Link>
                </div>

              </div>
            </Card3D>

          </div>

          {/* =========================================================
              RIGHT COLUMN: 3D INTERACTIVE HIGHLIGHTS (DESKTOP)
          ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 animate-fade-up">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-brand-mitti shadow-xs backdrop-blur-md">
                <Store className="w-3.5 h-3.5 text-brand-terracotta" />
                <span className="text-xs font-bold text-brand-indigo uppercase tracking-wider font-mono">
                  Everything from Day 1
                </span>
              </div>
              <h1 className="font-display text-5xl xl:text-6xl font-extrabold text-brand-indigo leading-[1.1] tracking-tight">
                Modern billing for your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-terracotta via-amber-600 to-brand-terracotta">
                  Kirana & Retail store.
                </span>
              </h1>
              <p className="text-base text-brand-indigo/70 max-w-lg font-medium leading-relaxed">
                Join thousands of Indian small business owners managing sales, customer ledgers, and inventory effortlessly on any device.
              </p>
            </div>

            {/* 3D Features Showcase Card */}
            <Card3D depth={16} className="w-full max-w-md">
              <div className="bg-gradient-to-br from-white via-white/95 to-brand-sand/50 p-6 rounded-3xl border-2 border-white/80 shadow-2xl backdrop-blur-xl space-y-4">
                
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-sand/50 border border-brand-mitti/60">
                  <div className="w-10 h-10 rounded-xl bg-brand-terracotta text-white grid place-items-center shrink-0 shadow-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-brand-indigo">0.8-Sec POS Thermal Invoicing</div>
                    <div className="text-xs text-brand-indigo/60">F1-F6 shortcuts with instant print & WhatsApp slip</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-sand/50 border border-brand-mitti/60">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-brand-indigo">1-Tap WhatsApp Udhaar Reminders</div>
                    <div className="text-xs text-brand-indigo/60">Recover pending khata automatically with zero awkwardness</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-sand/50 border border-brand-mitti/60">
                  <div className="w-10 h-10 rounded-xl bg-brand-indigo text-white grid place-items-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-brand-indigo">100% Offline Local Backup</div>
                    <div className="text-xs text-brand-indigo/60">Your customer data and accounts stay safe and private</div>
                  </div>
                </div>

              </div>
            </Card3D>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-xs font-medium text-brand-indigo/70 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Installation Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-terracotta" />
                <span>Phone, Tablet & Laptop Friendly</span>
              </div>
            </div>

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
