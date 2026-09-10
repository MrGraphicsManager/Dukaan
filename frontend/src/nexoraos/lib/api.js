import axios from "axios";

const rawBase = (process.env.REACT_APP_NEXORA_API_URL || process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
export const API = rawBase ? `${rawBase}/api` : "/api";

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nx_token") || localStorage.getItem("dukaan_token");
  if (token && token !== "undefined" && token !== "null") config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
