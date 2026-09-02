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
      <div className="flex items-center justify-center p-6 md:p-12 animate-fade-up order-2 md:order-1">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-lift border border-brand-mitti">
          <form onSubmit={submit} className="space-y-5" data-testid="register-form">
            <div className="mb-8">
              <div className="md:hidden mb-8"><Link to="/" className="font-display text-4xl text-brand-indigo">दुकान</Link></div>
              <h1 className="font-display text-4xl mb-2">Create shop</h1>
              <p className="text-brand-indigo/60">Free to start. No card required.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-brand-indigo/80">Your name</Label>
              <Input data-testid="register-name" value={name} onChange={(e)=>setName(e.target.value)} required className="h-12 rounded-xl bg-brand-sand border-brand-mitti focus-visible:ring-brand-terracotta" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-brand-indigo/80">Email</Label>
              <Input data-testid="register-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="h-12 rounded-xl bg-brand-sand border-brand-mitti focus-visible:ring-brand-terracotta" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-brand-indigo/80">Password (min 6)</Label>
              <Input data-testid="register-password" type="password" minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} required className="h-12 rounded-xl bg-brand-sand border-brand-mitti focus-visible:ring-brand-terracotta" />
            </div>
            {err && <div data-testid="register-error" className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">{err}</div>}
            <Button data-testid="register-submit" disabled={busy} className="w-full h-14 rounded-full text-lg font-medium bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-all shadow-glow mt-4">
              {busy ? "Creating…" : "Create account"}
            </Button>
            <div className="pt-6 text-center text-brand-indigo/70">
              Already have an account? <Link to="/login" className="text-brand-terracotta font-semibold hover:underline">Log in</Link>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block relative order-1 md:order-2">
        <img src="https://images.pexels.com/photos/12935051/pexels-photo-12935051.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo/90 via-brand-indigo/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-right items-end">
          <Link to="/" className="font-display text-4xl text-white">दुकान</Link>
          <div className="text-right">
            <div className="font-display text-6xl text-white leading-tight mb-4">Start<br/>selling<br/>smarter.</div>
            <div className="text-white/80 text-lg max-w-sm ml-auto">Billing, stock, udhaar — all from your phone.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
