import axios from "axios";

// Use the configured backend URL in deployment; fall back to the live Dukaan API
// so the production site does not break if the hosting environment variable is missing.
const BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
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
