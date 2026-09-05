import axios from "axios";

// Ensure the app always talks to the live Netlify serverless API on officialdukaan.in
// and never redirects to dead or legacy onrender.com endpoints
const rawEnvUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
const isLegacyRender = rawEnvUrl.includes("onrender.com");
const BASE = (rawEnvUrl && !isLegacyRender) ? rawEnvUrl.replace(/\/$/, "") : "";
export const API_BASE = BASE ? `${BASE}/api` : "/.netlify/functions/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach token, shop ID, and cache-busting timestamps to avoid stale browser disk cache
api.interceptors.request.use((config) => {
  const shopId = localStorage.getItem("dukaan_shop_id");
  const token = localStorage.getItem("dukaan_access_token") || localStorage.getItem("dukaan_token");
  if (shopId) {
    config.headers["X-Shop-Id"] = shopId;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Guarantee 100% fresh real-time responses by cache-busting all GET queries
  if (!config.method || config.method.toLowerCase() === "get") {
    config.params = {
      ...(config.params || {}),
      _t: Date.now()
    };
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
  }
  return config;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default api;
