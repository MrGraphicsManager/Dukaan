import axios from "axios";

// Use the configured backend URL in deployment; fall back to the live Dukaan API
// so the production site does not break if the hosting environment variable is missing.
const BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
export const API_BASE = BASE ? `${BASE}/api` : "/.netlify/functions/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach the selected shop and, when available, the login token automatically.
// The token fallback keeps authentication working when the browser blocks
// cross-site cookies between officialdukaan.in and the Render API.
api.interceptors.request.use((config) => {
  const shopId = localStorage.getItem("dukaan_shop_id");
  const token = localStorage.getItem("dukaan_access_token");
  if (shopId) {
    config.headers["X-Shop-Id"] = shopId;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
