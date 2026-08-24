import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=loading, false=guest, obj=user
  const [shops, setShops] = useState([]);
  const [currentShopId, setCurrentShopId] = useState(localStorage.getItem("dukaan_shop_id") || null);
  const [lang, setLang] = useState(localStorage.getItem("dukaan_lang") || "en");

  const setActiveShop = useCallback((id) => {
    setCurrentShopId(id);
    if (id) localStorage.setItem("dukaan_shop_id", id);
    else localStorage.removeItem("dukaan_shop_id");
  }, []);

  const loadShops = useCallback(async (fallbackId) => {
    try {
      const { data } = await api.get("/shops");
      setShops(data);
      const stored = localStorage.getItem("dukaan_shop_id");
      const validStored = data.find((s) => s.id === stored);
      const next = validStored?.id || fallbackId || data[0]?.id || null;
      setActiveShop(next);
    } catch (e) {
      setShops([]);
    }
  }, [setActiveShop]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      await loadShops(data.default_shop_id);
    } catch {
      setUser(false);
      setShops([]);
    }
  }, [loadShops]);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await refresh();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e.response?.data?.detail) || e.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      await refresh();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiError(e.response?.data?.detail) || e.message };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setUser(false);
    setShops([]);
    setActiveShop(null);
  };

  const changeLang = (l) => { setLang(l); localStorage.setItem("dukaan_lang", l); };

  return (
    <AuthCtx.Provider value={{
      user, shops, currentShopId, setActiveShop, loadShops,
      login, register, logout, refresh, lang, setLang: changeLang,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
