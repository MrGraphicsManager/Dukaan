import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function RenewalBanner() {
  const [s, setS] = useState(null);
  useEffect(() => {
    try {
      api.get("/auth/me")
        .then((r) => {
          if (r && r.data && r.data.subscription) {
            setS(r.data.subscription);
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  if (!s || !s.expires_at) return null;

  try {
    const expDate = new Date(s.expires_at).getTime();
    if (isNaN(expDate)) return null;
    const d = Math.ceil((expDate - Date.now()) / 86400000);
    if (d < 0 || d > 5) return null;

    return (
      <div className="mb-5 rounded-xl border border-brand-terracotta/30 bg-brand-terracotta/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <b>Your {s.plan_name || s.plan || "Dukaan"} plan expires in {Math.max(0, d)} days.</b>
          <div className="text-xs opacity-70">
            Renew early and the new plan starts after the current one ends.
          </div>
        </div>
        <Link
          to={`/subscribe?plan=${s.plan || "starter"}&renew=1`}
          className="rounded-lg bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white"
        >
          Renew Subscription →
        </Link>
      </div>
    );
  } catch {
    return null;
  }
}