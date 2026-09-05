import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "./api";

const AuthCtx = createContext(null);

const DEFAULT_SHOP = {
  id: "shop_main",
  name: "My Store",
  owner_name: "Merchant",
  phone: "9876543210",
  address: "Main Market, India",
  upi_id: "",
  store_category: "Kirana & General Store",
  gst_status: "pending",
  gst_enabled: false,
  financial_year: "2026-27",
  store_active: true,
};

export const ADMIN_EMAIL = "contact@officialdukaan.in";
export const isAdminEmail = (email) => (email || "").toLowerCase().trim() === ADMIN_EMAIL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("dukaan_user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Admin account (contact@officialdukaan.in) must NOT auto-login!
      // Every time login is required.
      if (parsed && (isAdminEmail(parsed.email) || parsed.is_admin)) {
        const isSessionAuth = sessionStorage.getItem("dukaan_admin_authenticated");
        if (!isSessionAuth) {
          return null; // Never auto-login admin across browser restarts/reloads
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [shops, setShops] = useState(() => {
    try {
      const stored = localStorage.getItem("dukaan_shops");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_SHOP];
  });
  const [currentShopId, setCurrentShopId] = useState(localStorage.getItem("dukaan_shop_id") || DEFAULT_SHOP.id);
  const [lang, setLang] = useState(localStorage.getItem("dukaan_lang") || "en");

  const setActiveShop = useCallback((id) => {
    setCurrentShopId(id);
    if (id) localStorage.setItem("dukaan_shop_id", id);
    else localStorage.removeItem("dukaan_shop_id");
  }, []);

  const updateShop = useCallback((shopData) => {
    setShops((prev) => {
      const list = Array.isArray(prev) ? prev : [DEFAULT_SHOP];
      const targetId = shopData.id || currentShopId || DEFAULT_SHOP.id;
      const idx = list.findIndex(s => s.id === targetId);
      let next;
      if (idx >= 0) {
        next = [...list];
        next[idx] = { ...next[idx], ...shopData };
      } else {
        next = [...list, { ...shopData, id: targetId }];
      }
      try {
        localStorage.setItem("dukaan_shops", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [currentShopId]);

  const loadShops = useCallback(async (fallbackId) => {
    let localShops = [];
    try {
      const raw = localStorage.getItem("dukaan_shops");
      if (raw) localShops = JSON.parse(raw);
    } catch {}

    try {
      const { data } = await api.get("/shops");
      if (Array.isArray(data) && data.length > 0) {
        const merged = data.map(ds => {
          const loc = localShops.find(ls => ls.id === ds.id);
          return loc ? { ...ds, ...loc } : ds;
        });
        setShops(merged);
        localStorage.setItem("dukaan_shops", JSON.stringify(merged));
        const stored = localStorage.getItem("dukaan_shop_id");
        const validStored = merged.find((s) => s.id === stored);
        const next = validStored?.id || fallbackId || merged[0]?.id || null;
        setActiveShop(next);
        return;
      }
    } catch (e) {}

    // Fallback: If local shops exist, use them
    if (Array.isArray(localShops) && localShops.length > 0) {
      setShops(localShops);
      const stored = localStorage.getItem("dukaan_shop_id");
      const valid = localShops.find(s => s.id === stored);
      setActiveShop(valid ? valid.id : localShops[0].id);
      return;
    }

    const existingShopId = localStorage.getItem("dukaan_shop_id") || DEFAULT_SHOP.id;
    const storedUser = localStorage.getItem("dukaan_user");
    let uName = "My";
    if (storedUser) {
      try { uName = JSON.parse(storedUser).name || "My"; } catch {}
    }
    const userShop = {
      ...DEFAULT_SHOP,
      id: existingShopId,
      name: `${uName}'s Store`,
      owner_name: uName
    };
    setShops([userShop]);
    localStorage.setItem("dukaan_shops", JSON.stringify([userShop]));
    setActiveShop(userShop.id);
  }, [setActiveShop]);

  const updateUser = useCallback((updater) => {
    setUser((prev) => {
      const current = prev || {};
      const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
      try {
        localStorage.setItem("dukaan_user", JSON.stringify(next));
        
        // Also update token so serverless functions see latest state
        try {
          const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(next))));
          localStorage.setItem("dukaan_access_token", "duk_" + b64);
        } catch {}

        // Persist to registered users directory
        if (next.email) {
          const regRaw = localStorage.getItem("dukaan_registered_users") || "[]";
          let regUsers = JSON.parse(regRaw);
          const idx = regUsers.findIndex((u) => u.email && u.email.toLowerCase() === next.email.toLowerCase());
          if (idx >= 0) {
            regUsers[idx] = { ...regUsers[idx], ...next };
          } else {
            regUsers.push(next);
          }
          localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
        }
      } catch (e) {
        console.warn("Failed to persist user update:", e);
      }
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data && data.email) {
        // If this is an admin account, ensure session is authenticated in this browser tab
        if (isAdminEmail(data.email) || data.is_admin) {
          const isSessionAuth = sessionStorage.getItem("dukaan_admin_authenticated");
          if (!isSessionAuth) {
            setUser(null);
            return null;
          }
        }
        // Retain local subscription if backend doesn't return one or if local one has valid active days
        const stored = localStorage.getItem("dukaan_user");
        let localSub = null;
        let localIsPremium = false;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localSub = parsed.subscription;
            localIsPremium = Boolean(parsed.is_premium);
          } catch {}
        }
        // Query subscriptions endpoint directly for any live admin-granted plans
        let activeSubscription = data.subscription;
        try {
          const subRes = await api.get("/subscriptions/me");
          if (subRes.data?.active) {
            activeSubscription = subRes.data.active;
          }
        } catch {}

        const isUserAdmin = isAdminEmail(data.email);
        const finalUser = {
          ...data,
          is_admin: isUserAdmin,
          subscription: activeSubscription || localSub || null,
          is_premium: data.is_premium || localIsPremium || (activeSubscription?.plan === "premium") || (localSub?.plan === "premium")
        };
        setUser(finalUser);
        localStorage.setItem("dukaan_user", JSON.stringify(finalUser));
        await loadShops(finalUser.default_shop_id);
        return finalUser;
      }
    } catch {
      // If there's a stored user, keep using it (offline mode)
      const stored = localStorage.getItem("dukaan_user");
      if (stored) {
        try {
          const current = JSON.parse(stored);
          if (current && current.email) {
            if (isAdminEmail(current.email) || current.is_admin) {
              const isSessionAuth = sessionStorage.getItem("dukaan_admin_authenticated");
              if (!isSessionAuth) {
                setUser(null);
                return null;
              }
            }
            current.is_admin = isAdminEmail(current.email);
            setUser(current);
            return current;
          }
        } catch {
          // corrupt stored data — stay logged out
          localStorage.removeItem("dukaan_user");
          setUser(null);
        }
      }
      return null;
    }
  }, [loadShops]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const login = async (email, password) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) return { ok: false, error: "Please enter your email address." };
    if (!password) return { ok: false, error: "Please enter your password." };

    let regUsers = [];
    try {
      regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
    } catch {}

    const isUserAdmin = isAdminEmail(cleanEmail);
    if (isUserAdmin && password !== "Viral@1979") {
      return { ok: false, error: "Incorrect admin password. Please try again." };
    }

    const localFound = regUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (localFound) {
      if (!isUserAdmin && localFound.password && localFound.password !== password) {
        return { ok: false, error: "Incorrect password. Please try again." };
      }
      if (localFound.is_verified === false && !isUserAdmin) {
        return {
          ok: false,
          error: "Please verify your email address before signing in.",
          needVerification: true,
          email: cleanEmail
        };
      }
    }

    try {
      const { data } = await api.post("/auth/login", { 
        email: cleanEmail, 
        password,
        name: localFound?.name || undefined 
      });
      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      
      if (isUserAdmin) {
        sessionStorage.setItem("dukaan_admin_authenticated", "true");
      } else {
        sessionStorage.removeItem("dukaan_admin_authenticated");
      }

      const u = await refresh();
      const finalUser = {
        ...(localFound || {}),
        ...(data?.user || {}),
        ...(u || {}),
        name: localFound?.name || data?.user?.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        is_admin: isUserAdmin,
        subscription: localFound?.subscription || data?.user?.subscription || u?.subscription || null
      };
      setUser(finalUser);
      localStorage.setItem("dukaan_user", JSON.stringify(finalUser));
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

      if (!localFound) {
        return { ok: false, error: "No account found with this email. Please create an account." };
      }

      if (isUserAdmin) {
        sessionStorage.setItem("dukaan_admin_authenticated", "true");
      } else {
        sessionStorage.removeItem("dukaan_admin_authenticated");
      }

      localFound.is_admin = isUserAdmin;
      setUser(localFound);
      localStorage.setItem("dukaan_user", JSON.stringify(localFound));
      return { ok: true, user: localFound };
    }
  };

  const register = async (name, email, password, referral_code = "") => {
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
      const { data } = await api.post("/auth/register", { name: cleanName, email: cleanEmail, password, referral_code: (referral_code || "").trim() });
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

  const loginWithSocial = async ({ email, name, provider = "google", avatar, idToken }) => {
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanName = (name || (provider === "google" ? "Google User" : "Apple User")).trim();

    // 1. Clear any old session so old admin/owner account never persists
    localStorage.removeItem("dukaan_user");
    localStorage.removeItem("dukaan_access_token");
    localStorage.removeItem("dukaan_shop_id");

    let socialUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatar: avatar || "",
      is_verified: true,
      is_admin: false,
      provider,
      subscription: null
    };

    try {
      const { data } = await api.post("/auth/social-login", {
        email: cleanEmail,
        name: cleanName,
        provider,
        id_token: idToken,
        avatar: avatar || ""
      });

      if (data?.access_token) {
        localStorage.setItem("dukaan_access_token", data.access_token);
      }
      if (data?.user) {
        socialUser = {
          ...socialUser,
          ...data.user,
          name: cleanName,
          email: cleanEmail,
          avatar: avatar || data.user.avatar || "",
          provider
        };
      }
    } catch (err) {
      console.warn("Backend social login offline fallback:", err);
    }

    // 2. Check local database for existing subscriptions / account history
    const isUserAdmin = isAdminEmail(cleanEmail);
    socialUser.is_admin = isUserAdmin;
    if (isUserAdmin) {
      sessionStorage.setItem("dukaan_admin_authenticated", "true");
    } else {
      sessionStorage.removeItem("dukaan_admin_authenticated");
    }

    try {
      let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
      const existing = regUsers.find(ru => ru.email && ru.email.toLowerCase() === cleanEmail);
      if (existing) {
        socialUser.id = existing.id || socialUser.id;
        if (existing.subscription) socialUser.subscription = existing.subscription;
        socialUser.is_admin = isUserAdmin;
        existing.is_admin = isUserAdmin;
        existing.is_verified = true;
        existing.provider = provider;
        existing.name = cleanName;
        if (avatar) existing.avatar = avatar;
      } else {
        regUsers.push(socialUser);
      }
      localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
    } catch {}

    // 3. Set the authenticated user state
    setUser(socialUser);
    localStorage.setItem("dukaan_user", JSON.stringify(socialUser));

    // 4. Setup merchant store for this specific Google user, reusing existing configuration if available
    const merchantShopId = `shop_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    let savedShops = [];
    try {
      savedShops = JSON.parse(localStorage.getItem("dukaan_shops") || "[]");
    } catch {}

    let merchantShop = savedShops.find(s => s.id === merchantShopId || s.owner_email === cleanEmail);
    if (!merchantShop) {
      merchantShop = {
        id: merchantShopId,
        owner_email: cleanEmail,
        name: `${cleanName}'s Store`,
        owner_name: cleanName,
        phone: "",
        address: "India",
        upi_id: "",
        store_category: "General Store",
        gst_status: "pending",
        gst_enabled: false,
        financial_year: "2026-27",
        store_active: true,
      };
      savedShops.push(merchantShop);
      localStorage.setItem("dukaan_shops", JSON.stringify(savedShops));
    }
    setShops([merchantShop]);
    setActiveShop(merchantShop.id);

    return { ok: true, user: socialUser };
  };

  const updateProfile = async ({ name, phone, avatar }) => {
    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name.trim();
    if (phone !== undefined) updatedFields.phone = phone.trim();
    if (avatar !== undefined) updatedFields.avatar = avatar;

    updateUser(updatedFields);

    try {
      await api.post("/auth/update-profile", updatedFields);
    } catch (e) {
      console.warn("Backend update-profile offline fallback:", e);
    }

    return { ok: true, user: { ...(user || {}), ...updatedFields } };
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: "New password must be at least 8 characters long." };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return { ok: false, error: "New password must contain at least one capital letter (A-Z)." };
    }
    if (!/[0-9]/.test(newPassword)) {
      return { ok: false, error: "New password must contain at least one number (0-9)." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(newPassword)) {
      return { ok: false, error: "New password must contain at least one special symbol (!@#$%...)." };
    }

    const cleanEmail = (user?.email || "").toLowerCase();
    let regUsers = [];
    try {
      regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
    } catch {}

    const idx = regUsers.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      if (regUsers[idx].password && regUsers[idx].password !== currentPassword) {
        return { ok: false, error: "Current password is incorrect." };
      }
      regUsers[idx].password = newPassword;
      localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
    }

    try {
      await api.post("/auth/change-password", { current_password: currentPassword, new_password: newPassword });
    } catch (e) {
      console.warn("Backend change-password offline fallback:", e);
    }

    return { ok: true, message: "Password updated successfully!" };
  };

  const loginWithGoogle = (payload) => loginWithSocial({ ...payload, provider: "google" });
  const loginWithApple = (payload) => loginWithSocial({ ...payload, provider: "apple" });

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    sessionStorage.removeItem("dukaan_admin_authenticated");
    localStorage.removeItem("dukaan_access_token");
    localStorage.removeItem("dukaan_user");
    setUser(null);
  };

  const lockAdminConsole = async () => {
    sessionStorage.removeItem("dukaan_admin_authenticated");
    await logout();
  };

  const verifyAdminSession = async (password) => {
    return login(ADMIN_EMAIL, password);
  };

  const changeLang = (l) => { setLang(l); localStorage.setItem("dukaan_lang", l); };

  return (
    <AuthCtx.Provider value={{
      user, shops, currentShopId, setActiveShop, loadShops, updateShop,
      login, register, verifyEmail, resendVerification, logout, refresh, lang, setLang: changeLang,
      loginWithGoogle, loginWithApple, updateUser, updateProfile, changePassword,
      lockAdminConsole, verifyAdminSession, ADMIN_EMAIL, isAdminEmail
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
