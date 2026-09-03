import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) return setErr("Invalid reset link");
    if (pw.length < 6) return setErr("Password must be at least 6 characters");
    if (pw !== pw2) return setErr("Passwords do not match");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: pw });
      toast.success("Password reset. You can log in now.");
      nav("/login");
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-sand px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4" data-testid="reset-form">
        <Link to="/" className="font-display text-3xl font-bold text-brand-indigo">Dukaan</Link>
        <h1 className="font-heading text-2xl font-bold">Set new password</h1>
        {!token && <div className="text-sm text-destructive">Missing reset token. Use the link from your email.</div>}
        <div className="space-y-2">
          <Label>New password</Label>
          <Input data-testid="reset-pw" type="password" minLength={6} value={pw} onChange={(e)=>setPw(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Confirm password</Label>
          <Input data-testid="reset-pw2" type="password" minLength={6} value={pw2} onChange={(e)=>setPw2(e.target.value)} required />
        </div>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <Button data-testid="reset-submit" disabled={busy || !token} className="w-full h-11 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
          {busy ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
