import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await register(name, email, password);
    setBusy(false);
    if (res.ok) { toast.success("Account created!"); nav("/subscribe"); }
    else setErr(res.error);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-brand-sand">
      <div className="flex items-center justify-center p-6 order-2 md:order-1">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5" data-testid="register-form">
          <div>
            <Link to="/" className="font-display text-3xl text-brand-indigo">दुकान · Dukaan</Link>
            <h1 className="mt-6 font-heading text-2xl font-bold">Create your shop</h1>
            <p className="text-brand-indigo/60 text-sm">Free to start. No card required.</p>
          </div>
          <div className="space-y-2">
            <Label>Your name</Label>
            <Input data-testid="register-name" value={name} onChange={(e)=>setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input data-testid="register-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password (min 6)</Label>
            <Input data-testid="register-password" type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          {err && <div data-testid="register-error" className="text-sm text-destructive">{err}</div>}
          <Button data-testid="register-submit" disabled={busy} className="w-full h-11 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
            {busy ? "Creating…" : "Create account"}
          </Button>
          <div className="text-sm text-brand-indigo/70">
            Already have an account? <Link to="/login" className="text-brand-terracotta font-semibold">Log in</Link>
          </div>
        </form>
      </div>
      <div className="hidden md:block relative order-1 md:order-2">
        <img src="https://images.pexels.com/photos/12935051/pexels-photo-12935051.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-indigo/80 via-brand-indigo/25 to-transparent" />
        <div className="relative h-full flex items-start p-10">
          <div>
            <div className="font-display text-5xl text-white">Start selling smarter.</div>
            <div className="mt-3 text-white/85 max-w-sm">Billing, stock, udhaar — all from your phone.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
