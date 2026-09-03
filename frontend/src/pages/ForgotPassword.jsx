import { useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-sand px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-3xl font-bold text-brand-indigo">Dukaan</Link>
        {sent ? (
          <div className="mt-8 rounded-xl border border-brand-mitti bg-white p-6 shadow-card text-center" data-testid="forgot-sent">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-leaf/10 text-brand-leaf grid place-items-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="mt-4 font-heading text-xl font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-brand-indigo/70">
              If an account exists for <b>{email}</b>, we've sent a password reset link. Valid for 1 hour.
            </p>
            <Link to="/login" className="mt-4 inline-block text-brand-terracotta font-semibold">← Back to login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="forgot-form">
            <h1 className="font-heading text-2xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-brand-indigo/70">Enter your email and we'll send you a reset link.</p>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input data-testid="forgot-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            {err && <div className="text-sm text-destructive">{err}</div>}
            <Button data-testid="forgot-submit" disabled={busy} className="w-full h-11 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <div className="text-sm text-brand-indigo/70">
              Remember it? <Link to="/login" className="text-brand-terracotta font-semibold">Log in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
