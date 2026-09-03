import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Clock, AlertTriangle } from "lucide-react";

export default function RenewalBanner() {
  const getSub = () => {
    try {
      const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
      return u?.subscription || null;
    } catch {
      return null;
    }
  };

  const [s, setS] = useState(() => getSub());

  useEffect(() => {
    // If online, refresh from server to ensure perfect sync
    try {
      api.get("/auth/me")
        .then((r) => {
          if (r?.data?.subscription) {
            setS(r.data.subscription);
            try {
              const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
              u.subscription = r.data.subscription;
              localStorage.setItem("dukaan_user", JSON.stringify(u));
            } catch {}
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  if (!s || !s.expires_at) return null;

  try {
    const expDate = new Date(s.expires_at).getTime();
    if (isNaN(expDate)) return null;
    const d = Math.ceil((expDate - Date.now()) / (1000 * 60 * 60 * 24));

    // If expired (d <= 0):
    if (d <= 0) {
      return (
        <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-900 shadow-sm flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-200 text-red-800 grid place-items-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <b className="text-sm">⚠️ Your {s.plan_name || s.plan || "Dukaan"} subscription has expired!</b>
              <div className="text-xs text-red-700/80">Renew now to maintain active store billing, cloud backup and khata ledger.</div>
            </div>
          </div>
          <Link
            to={`/subscribe?plan=${s.plan || "starter"}&renew=1`}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
          >
            Renew Now →
          </Link>
        </div>
      );
    }

    // If more than 5 days remaining, don't show banner yet
    if (d > 5) return null;

    return (
      <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 grid place-items-center shrink-0">
            <Clock className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <b className="text-sm">⏳ Your {s.plan_name || s.plan || "Dukaan"} plan expires in {d} {d === 1 ? "day" : "days"}.</b>
            <div className="text-xs text-amber-700/80">
              Renew early — your remaining {d} {d === 1 ? "day will" : "days will"} NOT be lost; the new period will be added after your current plan ends.
            </div>
          </div>
        </div>
        <Link
          to={`/subscribe?plan=${s.plan || "business"}&renew=1`}
          className="rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
        >
          Renew Subscription →
        </Link>
      </div>
    );
  } catch {
    return null;
  }
}