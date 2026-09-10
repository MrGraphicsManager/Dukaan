import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("nx_token");
    if (!token || token === "undefined" || token === "null") {
      setUser(false);
      setCafe(null);
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
          name: u.cafe_name || u.store_name || (u.name ? `${u.name}'s Café` : "My Café"),
          is_pro: true
        };
        setCafe(c);
        localStorage.setItem("nx_user", JSON.stringify(u));
        localStorage.setItem("nx_cafe", JSON.stringify(c));
      } else {
        throw new Error("Invalid user payload");
      }
    } catch {
      // Fallback strictly to locally saved Nexora session if offline
      const savedUserStr = localStorage.getItem("nx_user");
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          if (!u.role) u.role = u.is_admin ? "admin" : "owner";
          setUser(u);
          const c = localStorage.getItem("nx_cafe") ? JSON.parse(localStorage.getItem("nx_cafe")) : {
            id: u.cafe_id || u.id || "cafe_main",
            name: u.cafe_name || u.store_name || (u.name ? `${u.name}'s Café` : "My Café"),
            is_pro: true
          };
          setCafe(c);
        } catch {
          setUser(false);
          setCafe(null);
          localStorage.removeItem("nx_token");
        }
      } else {
        setUser(false);
        setCafe(null);
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
    }
    const u = data?.user || data;
    if (u && (u.email || u.id)) {
      if (!u.role) u.role = u.is_admin ? "admin" : "owner";
      setUser(u);
      const c = data?.cafe || {
        id: u.cafe_id || u.id || "cafe_main",
        name: u.cafe_name || u.store_name || (u.name ? `${u.name}'s Café` : "My Café"),
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
