import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) { toast.success("Welcome back!"); nav("/app"); }
    else setErr(res.error);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-brand-sand">
      <div className="hidden md:block relative">
        <img src="https://images.pexels.com/photos/38178433/pexels-photo-38178433.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo/85 via-brand-indigo/30 to-transparent" />
        <div className="relative h-full flex items-end p-10">
          <div>
            <div className="font-display text-5xl text-white">दुकान</div>
            <div className="mt-2 text-white/80 max-w-sm">Welcome back. Your ledger is waiting.</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5" data-testid="login-form">
          <div>
            <Link to="/" className="font-display text-3xl text-brand-indigo">दुकान · Dukaan</Link>
            <h1 className="mt-6 font-heading text-2xl font-bold">Log in</h1>
            <p className="text-brand-indigo/60 text-sm">Continue managing your shop.</p>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input data-testid="login-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input data-testid="login-password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          {err && <div data-testid="login-error" className="text-sm text-destructive">{err}</div>}
          <Button data-testid="login-submit" disabled={busy} className="w-full h-11 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
            {busy ? "Signing in…" : "Log in"}
          </Button>
          <div className="text-sm text-brand-indigo/70 flex items-center justify-between">
            <Link to="/forgot-password" data-testid="forgot-password-link" className="text-brand-terracotta font-semibold hover:underline">Forgot password?</Link>
            <span>New? <Link to="/register" className="text-brand-terracotta font-semibold">Create an account</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
}
