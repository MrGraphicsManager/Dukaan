import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import OnboardingLoader from "@/components/OnboardingLoader";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      // Store remember preference
      if (rememberMe) {
        localStorage.setItem("dukaan_remember", "true");
      } else {
        localStorage.removeItem("dukaan_remember");
        // Token is already in localStorage from login, keep it for session
      }
      toast.success("Welcome back!");
      setShowLoader(true);
    } else {
      setErr(res.error || "Invalid email or password. Please try again.");
    }
  };

  // Show onboarding loader after successful login
  if (showLoader) {
    return <OnboardingLoader onComplete={() => nav("/app")} />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-brand-sand">
      <div className="hidden md:block relative">
        <img src="https://images.pexels.com/photos/38178433/pexels-photo-38178433.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo/90 via-brand-indigo/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <Link to="/" className="font-display text-4xl text-white">दुकान</Link>
          <div>
            <div className="font-display text-6xl text-white leading-tight mb-4">Run your<br/>business<br/>smoothly.</div>
            <div className="text-white/80 text-lg max-w-sm">Welcome back. Your ledger is waiting.</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 animate-fade-up">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-lift border border-brand-mitti">
          <form onSubmit={submit} className="space-y-6" data-testid="login-form">
            <div className="mb-8">
              <div className="md:hidden mb-8"><Link to="/" className="font-display text-4xl text-brand-indigo">दुकान</Link></div>
              <h1 className="font-display text-4xl mb-2">Log in</h1>
              <p className="text-brand-indigo/60">Continue managing your shop.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-brand-indigo/80">Email</Label>
              <Input data-testid="login-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="h-12 rounded-xl bg-brand-sand border-brand-mitti focus-visible:ring-brand-terracotta" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-brand-indigo/80">Password</Label>
                <Link to="/forgot-password" data-testid="forgot-password-link" className="text-sm text-brand-terracotta font-semibold hover:underline">Forgot?</Link>
              </div>
              <Input data-testid="login-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="h-12 rounded-xl bg-brand-sand border-brand-mitti focus-visible:ring-brand-terracotta" />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                data-testid="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                className="border-brand-mitti data-[state=checked]:bg-brand-indigo data-[state=checked]:border-brand-indigo"
              />
              <Label htmlFor="remember-me" className="text-sm text-brand-indigo/70 cursor-pointer select-none">
                Remember me
              </Label>
            </div>

            {err && <div data-testid="login-error" className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">{err}</div>}
            <Button data-testid="login-submit" disabled={busy} className="w-full h-14 rounded-full text-lg font-medium bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-all shadow-glow mt-4">
              {busy ? "Signing in…" : "Log in"}
            </Button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-brand-mitti w-full" />
              <span className="bg-white px-3 text-[11px] uppercase font-bold text-brand-indigo/40 absolute">or quick access</span>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await login("owner@officialdukaan.in", "demo123");
                setBusy(false);
                toast.success("Welcome back!");
                nav("/app");
              }}
              className="w-full h-12 rounded-full border-2 border-brand-mitti text-brand-indigo font-bold text-sm hover:border-brand-indigo flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Demo 1-Click Login (Shop Owner)
            </Button>

            <div className="pt-4 text-center text-brand-indigo/70">
              New to Dukaan? <Link to="/register" className="text-brand-terracotta font-semibold hover:underline">Create an account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
