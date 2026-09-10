import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    let token = localStorage.getItem("nx_token") || localStorage.getItem("dukaan_token");
    if (!token || token === "undefined" || token === "null") {
      // Check if dukaan_user is already logged in
      const dukaanUserStr = localStorage.getItem("dukaan_user");
      if (dukaanUserStr) {
        try {
          const du = JSON.parse(dukaanUserStr);
          if (du && (du.email || du.id)) {
            if (!du.role) du.role = du.is_admin ? "admin" : "owner";
            setUser(du);
            setCafe({
              id: du.cafe_id || du.id || "cafe_main",
              name: du.shop_name || (du.name ? `${du.name}'s Café` : "Nexora Café"),
              is_pro: true
            });
            setLoading(false);
            return;
          }
        } catch {}
      }
      setUser(false);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      const u = data?.user || data;
      if (u && (u.email || u.id || u.name)) {
        if (!u.role) u.role = u.is_admin ? "admin" : "owner";
        setUser(u);
        const c = data?.cafe || {
          id: u.cafe_id || u.id || "cafe_main",
          name: u.shop_name || u.cafe_name || (u.name ? `${u.name}'s Café` : "Nexora Café"),
          is_pro: true
        };
        setCafe(c);
        localStorage.setItem("nx_user", JSON.stringify(u));
        localStorage.setItem("nx_cafe", JSON.stringify(c));
      } else {
        throw new Error("Invalid user payload");
      }
    } catch {
      // Fallback to locally saved session if API fails or is offline
      const savedUserStr = localStorage.getItem("nx_user") || localStorage.getItem("dukaan_user");
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (!u.role) u.role = u.is_admin ? "admin" : "owner";
          setUser(u);
          setCafe({
            id: u.cafe_id || u.id || "cafe_main",
            name: u.shop_name || (u.name ? `${u.name}'s Café` : "Nexora Café"),
            is_pro: true
          });
        } catch {
          setUser(false);
          localStorage.removeItem("nx_token");
        }
      } else {
        setUser(false);
        localStorage.removeItem("nx_token");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data?.token || data?.access_token;
    if (token) {
      localStorage.setItem("nx_token", token);
      localStorage.setItem("dukaan_token", token);
    }
    const u = data?.user || data;
    if (u && (u.email || u.id)) {
      if (!u.role) u.role = u.is_admin ? "admin" : "owner";
      setUser(u);
      const c = data?.cafe || {
        id: u.cafe_id || u.id || "cafe_main",
        name: u.shop_name || u.cafe_name || (u.name ? `${u.name}'s Café` : "Nexora Café"),
        is_pro: true
      };
      setCafe(c);
      localStorage.setItem("nx_user", JSON.stringify(u));
      localStorage.setItem("nx_cafe", JSON.stringify(c));
    }
    await refresh();
    return u;
  };

  const logout = () => {
    localStorage.removeItem("nx_token");
    localStorage.removeItem("nx_user");
    localStorage.removeItem("nx_cafe");
    setUser(false);
    setCafe(null);
  };

  const setTokenAndUser = async (token, userObj = null, cafeObj = null) => {
    if (token) localStorage.setItem("nx_token", token);
    if (userObj) {
      if (!userObj.role) userObj.role = userObj.is_admin ? "admin" : "owner";
      setUser(userObj);
      localStorage.setItem("nx_user", JSON.stringify(userObj));
    }
    if (cafeObj) {
      setCafe(cafeObj);
      localStorage.setItem("nx_cafe", JSON.stringify(cafeObj));
    }
    await refresh();
  };

  return (
    <AuthCtx.Provider value={{ user, cafe, loading, login, logout, refresh, setTokenAndUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
