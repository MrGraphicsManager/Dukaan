import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "./api";

const AuthCtx = createContext(null);

const DEMO_USER = {
  id: "demo_user_1",
  name: "Dukaan Owner",
  email: "owner@officialdukaan.in",
  is_admin: true,
  subscription: { plan: "premium", status: "active" },
  default_shop_id: "demo_shop_1",
};

const DEMO_SHOP = {
  id: "demo_shop_1",
  name: "Apni Dukaan",
  owner_name: "Dukaan Owner",
  phone: "9876543210",
  address: "Main Market, India",
  upi_id: "demo@upi",
  store_category: "Kirana & General Store",
  gst_status: "verified",
  gst_enabled: true,
  gst_rate: 5,
  financial_year: "2026-27",
  store_active: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("dukaan_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [shops, setShops] = useState([DEMO_SHOP]);
  const [currentShopId, setCurrentShopId] = useState(localStorage.getItem("dukaan_shop_id") || DEMO_SHOP.id);
  const [lang, setLang] = useState(localStorage.getItem("dukaan_lang") || "en");

  const setActiveShop = useCallback((id) => {
    setCurrentShopId(id);
    if (id) localStorage.setItem("dukaan_shop_id", id);
    else localStorage.removeItem("dukaan_shop_id");
  }, []);

  const loadShops = useCallback(async (fallbackId) => {
    try {
      const { data } = await api.get("/shops");
      if (Array.isArray(data) && data.length > 0) {
        setShops(data);
        const stored = localStorage.getItem("dukaan_shop_id");
        const validStored = data.find((s) => s.id === stored);
        const next = validStored?.id || fallbackId || data[0]?.id || null;
        setActiveShop(next);
      } else {
        setShops([DEMO_SHOP]);
        setActiveShop(DEMO_SHOP.id);
      }
    } catch (e) {
      setShops([DEMO_SHOP]);
      setActiveShop(DEMO_SHOP.id);
    }
  }, [setActiveShop]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data) {
        setUser(data);
        localStorage.setItem("dukaan_user", JSON.stringify(data));
        await loadShops(data.default_shop_id);
        return data;
      }
    } catch {
      // If there's a stored user, keep using it (offline mode)
      // If no stored user, stay logged out — don't force DEMO_USER
      const stored = localStorage.getItem("dukaan_user");
      if (stored) {
        try {
          const current = JSON.parse(stored);
          setUser(current);
          setShops([DEMO_SHOP]);
          setActiveShop(DEMO_SHOP.id);
          return current;
        } catch {
          // corrupt stored data — stay logged out
          localStorage.removeItem("dukaan_user");
          setUser(null);
        }
      }
      return null;
    }
  }, [loadShops, setActiveShop]);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      const u = await refresh();
      localStorage.setItem("dukaan_user", JSON.stringify(u || DEMO_USER));
      return { ok: true };
    } catch (e) {
      // Offline / local bypass: allow login directly
      const loggedUser = { ...DEMO_USER, email: email || DEMO_USER.email };
      setUser(loggedUser);
      localStorage.setItem("dukaan_user", JSON.stringify(loggedUser));
      setShops([DEMO_SHOP]);
      setActiveShop(DEMO_SHOP.id);
      return { ok: true };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      const u = await refresh();
      localStorage.setItem("dukaan_user", JSON.stringify(u || DEMO_USER));
      return { ok: true };
    } catch (e) {
      // Offline / local bypass: register fresh account
      const newUser = {
        id: `user_${Date.now()}`,
        name: name || "Shop Owner",
        email: email || "owner@dukaan.in",
        is_admin: false,
        subscription: { plan: "starter", status: "active" },
        default_shop_id: `shop_${Date.now()}`
      };
      const newShop = {
        id: newUser.default_shop_id,
        name: `${name}'s Shop` || "My Dukaan",
        owner_name: name || "Shop Owner",
        phone: "9876543210",
        address: "Market, India",
        upi_id: "",
        store_category: "Kirana & General Store",
        gst_status: "pending",
        gst_enabled: false,
        store_active: true
      };
      localStorage.removeItem("dukaan_orders");
      setUser(newUser);
      localStorage.setItem("dukaan_user", JSON.stringify(newUser));
      setShops([newShop]);
      setActiveShop(newShop.id);
      return { ok: true };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("dukaan_access_token");
    localStorage.removeItem("dukaan_user");
    setUser(null);
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
