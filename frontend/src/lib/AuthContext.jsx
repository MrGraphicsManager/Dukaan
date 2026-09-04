import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "./api";

const AuthCtx = createContext(null);

const DEFAULT_USER = {
  id: "user_owner",
  name: "Shop Owner",
  email: "owner@officialdukaan.in",
  is_admin: false,
  subscription: { plan: "starter", status: "active" },
  default_shop_id: "shop_main",
};

const DEFAULT_SHOP = {
  id: "shop_main",
  name: "Apni Dukaan",
  owner_name: "Shop Owner",
  phone: "9876543210",
  address: "Main Market, India",
  upi_id: "",
  store_category: "Kirana & General Store",
  gst_status: "pending",
  gst_enabled: false,
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
  const [shops, setShops] = useState([DEFAULT_SHOP]);
  const [currentShopId, setCurrentShopId] = useState(localStorage.getItem("dukaan_shop_id") || DEFAULT_SHOP.id);
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
        setShops([DEFAULT_SHOP]);
        setActiveShop(DEFAULT_SHOP.id);
      }
    } catch (e) {
      setShops([DEFAULT_SHOP]);
      setActiveShop(DEFAULT_SHOP.id);
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
          setShops([DEFAULT_SHOP]);
          setActiveShop(DEFAULT_SHOP.id);
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
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) return { ok: false, error: "Please enter your email address." };
    if (!password) return { ok: false, error: "Please enter your password." };

    try {
      const { data } = await api.post("/auth/login", { email: cleanEmail, password });
      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      const u = await refresh();
      const finalUser = u || data?.user;
      if (finalUser) {
        setUser(finalUser);
        localStorage.setItem("dukaan_user", JSON.stringify(finalUser));
      }
      return { ok: true, user: finalUser };
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (detail && typeof detail === "object" && detail.need_verification) {
        return { 
          ok: false, 
          error: detail.message || "Please verify your email address first.", 
          needVerification: true, 
          email: cleanEmail 
        };
      }
      if (status === 404) {
        return { ok: false, error: formatApiError(detail) || "No account found with this email. Please register." };
      }
      if (status === 401) {
        return { ok: false, error: formatApiError(detail) || "Incorrect password. Please try again." };
      }
      if (status === 403) {
        return { 
          ok: false, 
          error: formatApiError(detail) || "Please verify your email address to continue.", 
          needVerification: true, 
          email: cleanEmail 
        };
      }

      // Offline / client-side check against registered users
      let regUsers = [];
      try {
        regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
      } catch {}

      const found = regUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return { ok: false, error: "No account found with this email. Please create an account." };
      }

      if (found.password && found.password !== password) {
        return { ok: false, error: "Incorrect password. Please try again." };
      }

      if (found.is_verified === false) {
        return {
          ok: false,
          error: "Please verify your email address before signing in.",
          needVerification: true,
          email: cleanEmail
        };
      }

      // Valid credentials
      setUser(found);
      localStorage.setItem("dukaan_user", JSON.stringify(found));
      return { ok: true, user: found };
    }
  };

  const register = async (name, email, password) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanName = (name || "").trim();

    let regUsers = [];
    try {
      regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
    } catch {}

    if (regUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: "An account with this email already exists. Please sign in." };
    }

    const localCode = String(Math.floor(100000 + Math.random() * 900000));
    const localToken = "tok_" + Date.now();

    try {
      const { data } = await api.post("/auth/register", { name: cleanName, email: cleanEmail, password });
      const newUser = {
        id: data?.user?.id || `user_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password,
        is_verified: false,
        verification_code: data?.verification_code || localCode,
        verification_token: data?.verification_token || localToken,
        subscription: null,
        default_shop_id: data?.shop_id || `shop_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      regUsers.push(newUser);
      localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      return { 
        ok: true, 
        needVerification: true, 
        email: cleanEmail, 
        code: newUser.verification_code 
      };
    } catch (err) {
      if (err.response?.status === 409) {
        return { ok: false, error: "An account with this email already exists. Please sign in." };
      }
      if (err.response?.data?.detail) {
        return { ok: false, error: formatApiError(err.response.data.detail) };
      }

      // Client-side registration
      const newUser = {
        id: `user_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password,
        is_verified: false,
        verification_code: localCode,
        verification_token: localToken,
        subscription: null,
        default_shop_id: `shop_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      regUsers.push(newUser);
      localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      return { 
        ok: true, 
        needVerification: true, 
        email: cleanEmail, 
        code: localCode 
      };
    }
  };

  const verifyEmail = async (email, codeOrToken) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanInput = (codeOrToken || "").trim();

    try {
      const { data } = await api.post("/auth/verify-email", { 
        email: cleanEmail, 
        code: cleanInput, 
        token: cleanInput 
      });
      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      const u = await refresh();
      const verifiedUser = u || data?.user || { email: cleanEmail, is_verified: true };
      verifiedUser.is_verified = true;
      setUser(verifiedUser);
      localStorage.setItem("dukaan_user", JSON.stringify(verifiedUser));

      // Also update local registered users
      try {
        let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        regUsers = regUsers.map(ru => ru.email.toLowerCase() === cleanEmail ? { ...ru, is_verified: true } : ru);
        localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      } catch {}

      return { ok: true, user: verifiedUser };
    } catch (err) {
      // Local fallback verification
      try {
        let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        const idx = regUsers.findIndex(ru => ru.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          const u = regUsers[idx];
          if (u.verification_code && (u.verification_code === cleanInput || u.verification_token === cleanInput)) {
            u.is_verified = true;
            regUsers[idx] = u;
            localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
            setUser(u);
            localStorage.setItem("dukaan_user", JSON.stringify(u));
            return { ok: true, user: u };
          }
        }
      } catch {}

      return { 
        ok: false, 
        error: formatApiError(err.response?.data?.detail) || "Invalid verification code. Please try again." 
      };
    }
  };

  const resendVerification = async (email) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    try {
      const { data } = await api.post("/auth/resend-verification", { email: cleanEmail });
      return { ok: true, code: data?.verification_code, message: data?.message };
    } catch (err) {
      // Local fallback
      try {
        let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        const idx = regUsers.findIndex(ru => ru.email.toLowerCase() === cleanEmail);
        if (idx >= 0) {
          const newCode = String(Math.floor(100000 + Math.random() * 900000));
          regUsers[idx].verification_code = newCode;
          localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
          return { ok: true, code: newCode, message: "New verification code generated." };
        }
      } catch {}

      return { 
        ok: false, 
        error: formatApiError(err.response?.data?.detail) || "Failed to resend verification email." 
      };
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
      login, register, verifyEmail, resendVerification, logout, refresh, lang, setLang: changeLang,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
