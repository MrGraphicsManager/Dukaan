import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { t } from "@/lib/i18n";
import { LayoutDashboard, Receipt, Package, Warehouse, Users, Wallet, ClipboardList, BarChart3, Settings as Cog, LogOut, Store, CreditCard, ShieldCheck, ShieldAlert, Lock, Monitor, Bell, CheckCheck, AlertTriangle, X, RotateCw, Eye } from "lucide-react";
import { PLAN_TIER, ROUTE_PLAN } from "@/components/SubGate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import RenewalBanner from "@/components/RenewalBanner";

const NAV = [
  { to: "/app", key: "dashboard", Icon: LayoutDashboard, end: true },
  { to: "/app/pos", key: "new_bill", Icon: Receipt },
  { to: "/app/products", key: "products", Icon: Package },
  { to: "/app/stock", key: "stock", Icon: Warehouse },
  { to: "/app/customers", key: "customers", Icon: Users },
  { to: "/app/udhaar", key: "udhaar", Icon: Wallet },
  { to: "/app/orders", key: "orders", Icon: ClipboardList },
  { to: "/app/reports", key: "reports", Icon: BarChart3 },
  { to: "/app/billing", key: "billing", Icon: CreditCard },
  { to: "/app/settings", key: "settings", Icon: Cog },
  { to: "/app/counter", key: "counter_mode", Icon: Monitor },
];

const MOBILE_NAV = NAV.filter(n => ["dashboard","new_bill","udhaar","orders","settings"].includes(n.key));


/* =========================================================
   NOTIFICATION BELL HOOK
========================================================= */

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      const notifs = [];
      const now = new Date();

      // Low stock notifications
      if (data?.low_stock && Array.isArray(data.low_stock)) {
        data.low_stock.slice(0, 3).forEach((p, i) => {
          notifs.push({
            id: `low_stock_${p._id || p.id || i}`,
            type: "warning",
            title: "Low Stock",
            message: `${p.name}: only ${p.stock} left (min: ${p.min_stock})`,
            time: now.toISOString(),
            read: false,
          });
        });
      }

      // Today's orders notification
      if (data?.today_orders > 0) {
        notifs.push({
          id: "today_orders",
          type: "info",
          title: "Today's Orders",
          message: `${data.today_orders} order${data.today_orders > 1 ? "s" : ""} received today`,
          time: now.toISOString(),
          read: false,
        });
      }

      // Pending udhaar notification
      if (data?.pending_udhaar > 0) {
        notifs.push({
          id: "pending_udhaar",
          type: "warning",
          title: "Pending Udhaar",
          message: `₹${Number(data.pending_udhaar || 0).toLocaleString("en-IN")} udhaar pending`,
          time: now.toISOString(),
          read: false,
        });
      }

      // Today's sales notification
      if (data?.today_sales > 0) {
        notifs.push({
          id: "today_sales",
          type: "success",
          title: "Today's Sales",
          message: `₹${Number(data.today_sales || 0).toLocaleString("en-IN")} in sales today`,
          time: now.toISOString(),
          read: true,
        });
      }

      // Cap at 10 (FIFO — keep latest 10)
      setNotifications(notifs.slice(0, 10));
    } catch {
      // Silent fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead, loading };
}


/* =========================================================
   APP LAYOUT
========================================================= */

export default function AppLayout() {
  const { user, shops, currentShopId, setActiveShop, logout, lang, setLang, refresh: refreshAuth } = useAuth();
  const nav = useNavigate();
  const activeShop = (shops || []).find(s => s?.id === currentShopId) || shops?.[0] || { name: "Apni Dukaan" };
  const currentShop = activeShop;
  const [subscription, setSubscription] = useState(() => {
    let localSub = user?.subscription || null;
    if (!localSub) {
      try {
        const u = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
        localSub = u?.subscription || null;
      } catch {}
    }
    return localSub;
  });
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifications();

  // Read the current subscription from the backend if available; otherwise keep local state
  useEffect(() => {
    let alive = true;
    setSubscriptionLoaded(false);
    api.get("/subscriptions/me")
      .then(r => { 
        if (alive && r.data?.active) {
          setSubscription(r.data.active); 
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setSubscriptionLoaded(true); });
    return () => { alive = false; };
  }, [user?.id, user?.subscription, currentShopId]);

  // Fetch notifications on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Store Inspector Session (Admin impersonating merchant)
  const inspectorSession = (() => {
    try {
      const raw = sessionStorage.getItem("dukaan_inspector_mode");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const exitInspector = () => {
    if (inspectorSession) {
      if (inspectorSession.original_token) {
        localStorage.setItem("dukaan_token", inspectorSession.original_token);
      }
      if (inspectorSession.original_user) {
        localStorage.setItem("dukaan_user", JSON.stringify(inspectorSession.original_user));
      }
      sessionStorage.removeItem("dukaan_inspector_mode");
      window.location.href = "/admin";
    }
  };

  // Platform configuration: Maintenance mode, OTA Updates & Announcement
  const [platformConfig, setPlatformConfig] = useState(() => {
    return {
      maintenance_mode: localStorage.getItem("dukaan_platform_maintenance") === "true",
      announcement: localStorage.getItem("dukaan_platform_announcement") || "",
      frozen_merchants: {}
    };
  });
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState("");

  const isMasterAdmin = (user?.email || "").toLowerCase().trim() === "contact@officialdukaan.in";

  const checkPlatformConfig = useCallback(async () => {
    try {
      const res = await api.get("/platform/config");
      if (res?.data) {
        setPlatformConfig({
          maintenance_mode: !!res.data.maintenance_mode,
          announcement: res.data.announcement || "",
          frozen_merchants: res.data.frozen_merchants || {}
        });
        if (res.data.maintenance_mode) {
          localStorage.setItem("dukaan_platform_maintenance", "true");
        } else {
          localStorage.removeItem("dukaan_platform_maintenance");
        }
        if (res.data.announcement) {
          localStorage.setItem("dukaan_platform_announcement", res.data.announcement);
        } else {
          localStorage.removeItem("dukaan_platform_announcement");
        }
        if (typeof res.data.receipt_branding_enabled === "boolean") {
          localStorage.setItem("dukaan_receipt_branding_enabled", String(res.data.receipt_branding_enabled));
        }
        if (typeof res.data.payment_alert_chime === "boolean") {
          localStorage.setItem("dukaan_payment_alert_chime", String(res.data.payment_alert_chime));
        }

        // Feature 9 & 10: Real-time Freeze & Verification Sync for current merchant
        const targetShopId = currentShopId || localStorage.getItem("dukaan_shop_id");
        if (user?.email) {
          const em = user.email.toLowerCase();
          const isFrozenCloud = Boolean(
            res.data.frozen_merchants?.[em] ||
            (targetShopId && res.data.frozen_merchants?.[targetShopId]) ||
            (user?.shop_id && res.data.frozen_merchants?.[user.shop_id])
          );
          if (isFrozenCloud) {
            localStorage.setItem(`dukaan_store_frozen_${user.email}`, "true");
          } else {
            localStorage.removeItem(`dukaan_store_frozen_${user.email}`);
          }
          if (res.data.verified_merchants && res.data.verified_merchants[em] !== undefined) {
            const isVerifiedCloud = Boolean(res.data.verified_merchants[em]);
            const stored = localStorage.getItem("dukaan_user");
            if (stored) {
              try {
                const u = JSON.parse(stored);
                if (u.is_verified !== isVerifiedCloud) {
                  u.is_verified = isVerifiedCloud;
                  localStorage.setItem("dukaan_user", JSON.stringify(u));
                  if (typeof refreshAuth === "function") refreshAuth();
                }
              } catch {}
            }
          }
        }

        // Feature 14: Global Force Update / OTA Cache Refresh
        if (res.data.ota_version) {
          const currentOta = parseInt(localStorage.getItem("dukaan_ota_version") || "0", 10);
          if (res.data.ota_version > currentOta && !isMasterAdmin) {
            localStorage.setItem("dukaan_ota_version", String(res.data.ota_version));
            console.log("OTA Update received. Reloading application cache...");
            setTimeout(() => {
              window.location.reload();
            }, 600);
          }
        }

        // Feature 30: Emergency Kill Switch
        if (res.data.kill_switch_active && !isMasterAdmin && !inspectorSession) {
          localStorage.removeItem("dukaan_access_token");
          localStorage.removeItem("dukaan_user");
          window.location.href = "/login?emergency_lockdown=1";
        }
      }
    } catch (_) {}

    // Live subscription sync: instantly check if admin granted plan
    try {
      const subRes = await api.get("/subscriptions/me");
      if (subRes.data?.active) {
        const activeSub = subRes.data.active;
        setSubscription(activeSub);
        const stored = localStorage.getItem("dukaan_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.subscription?.plan !== activeSub.plan || u.subscription?.expires_at !== activeSub.expires_at) {
              u.subscription = activeSub;
              if (activeSub.plan === "premium") u.is_premium = true;
              localStorage.setItem("dukaan_user", JSON.stringify(u));
              if (typeof refreshAuth === "function") refreshAuth();
            }
          } catch {}
        }
      }
    } catch (_) {}
  }, [isMasterAdmin, inspectorSession, user?.email, refreshAuth]);

  useEffect(() => {
    checkPlatformConfig();
    const interval = setInterval(checkPlatformConfig, 4000);
    const onFocus = () => checkPlatformConfig();
    window.addEventListener("focus", onFocus);
    const onVis = () => {
      if (document.visibilityState === "visible") checkPlatformConfig();
    };
    document.addEventListener("visibilitychange", onVis);

    // Instant Zero-Latency Real-Time Push Sync via SSE
    let eventSource;
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        eventSource = new EventSource("https://ntfy.sh/dukaan_platform_sync_prod_99482/sse");
        eventSource.onmessage = (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload && payload.message) {
              const busData = JSON.parse(payload.message);
              if (busData) {
                if (typeof busData.maintenance_mode === "boolean") {
                  setPlatformConfig(prev => ({
                    ...prev,
                    maintenance_mode: busData.maintenance_mode,
                    announcement: busData.announcement || "",
                    frozen_merchants: busData.frozen_merchants || {}
                  }));
                }
                checkPlatformConfig();
              }
            }
          } catch {}
        };
      }
    } catch (_) {}

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      if (eventSource) {
        try { eventSource.close(); } catch (_) {}
      }
    };
  }, [checkPlatformConfig]);

  // Feature 9: Store Freeze & Fraud Security Shield
  const activeShopId = currentShopId || localStorage.getItem("dukaan_shop_id");
  const isMerchantFrozen = Boolean(
    user?.is_frozen || 
    localStorage.getItem(`dukaan_store_frozen_${user?.email}`) === "true" ||
    (user?.email && platformConfig.frozen_merchants?.[user.email.toLowerCase()]) ||
    (activeShopId && platformConfig.frozen_merchants?.[activeShopId]) ||
    (user?.shop_id && platformConfig.frozen_merchants?.[user.shop_id])
  );
  const isStoreFrozen = !isMasterAdmin && !inspectorSession && isMerchantFrozen;
  if (isStoreFrozen) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-6 shadow-2xl">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-950/60 px-3.5 py-1 rounded-full border border-rose-800/50 mb-3">
          Account Suspended · Security Shield
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-lg mb-3">
          Merchant Access Temporarily Restricted
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          This store has been temporarily locked by platform security for compliance verification or fraud prevention. 
          Please contact our security operations desk to re-activate your store.
        </p>
        <div className="flex items-center gap-3">
          <a
            href="mailto:contact@officialdukaan.in?subject=Reactivate%20Frozen%20Store%20Request"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20"
          >
            Contact Security (contact@officialdukaan.in)
          </a>
        </div>
      </div>
    );
  }

  const isPremium = subscription?.plan === "premium" || user?.subscription?.plan === "premium" || user?.is_premium || user?.plan === "premium";
  const tierMap = PLAN_TIER || { starter: 1, business: 2, premium: 3 };
  const routeMap = ROUTE_PLAN || {};
  const activePlan = subscription?.plan || user?.subscription?.plan || "starter";
  const currentTier = user?.is_admin ? 999 : (tierMap[activePlan] || 1);
  const isLocked = (to) => {
    if (to === "/app/counter") return true; // Temporarily locked per user request
    const need = routeMap[to];
    if (!need) return false;
    return currentTier < (tierMap[need] || 1);
  };
  const premiumClass = isPremium ? "premium" : "standard";

  const NOTIF_COLORS = {
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-emerald-100 text-emerald-800",
    error: "bg-red-100 text-red-800",
  };

  // Full-screen Maintenance Mode for merchants (Admins retain access to /admin)
  if (platformConfig.maintenance_mode && !isMasterAdmin && !inspectorSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 shadow-2xl">
          <AlertTriangle className="w-10 h-10 animate-pulse" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50 mb-3">
          Scheduled Platform Maintenance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-lg mb-3">
          Dukaan is Updating
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Our engineering team is currently deploying an upgrade to enhance system security and speed. All merchant data is safe and transactions will resume momentarily.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-10 px-5"
          >
            Check Status Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isPremium ? "premium-app-shell" : "bg-brand-sand"} ${premiumClass}`}>

      {/* Store Inspector Mode Banner (Feature #1) */}
      {inspectorSession && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0 text-amber-200" />
            <span>
              <strong>👀 Store Inspector Active:</strong> Viewing store of <span className="underline decoration-amber-300 font-extrabold">{inspectorSession.target_name || "Merchant"}</span> ({inspectorSession.target_email}) as Super Administrator.
            </span>
          </div>
          <Button
            onClick={exitInspector}
            size="sm"
            className="bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-[11px] h-7 px-3 rounded-lg shadow-sm border border-amber-200"
          >
            Exit Inspector & Return to Admin
          </Button>
        </div>
      )}

      {/* =====================================================
          TOP NAVIGATION BAR
      ===================================================== */}

      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${isPremium ? "premium-topbar" : "bg-brand-cream/95 border-brand-mitti"}`}>
        <div className="mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between gap-3">

          {/* Logo (Switches to official Premium logo for Premium plan users) */}
          <div className="flex items-center gap-3">
            <button className="md:hidden flex items-center gap-2" onClick={() => nav("/app")} data-testid="topbar-logo" aria-label="Home">
              <img 
                src={isPremium ? "/logo-premium.png" : "/logo.png"} 
                alt="Dukaan" 
                className={`${isPremium ? "h-9 sm:h-10" : "h-8"} w-auto object-contain`} 
              />
            </button>
            <div className="hidden md:flex items-center gap-2.5">
              <img 
                src={isPremium ? "/logo-premium.png" : "/logo.png"} 
                alt="Dukaan" 
                className={`${isPremium ? "h-11 sm:h-12" : "h-9"} w-auto object-contain cursor-pointer transition-transform hover:scale-105 drop-shadow-xs`} 
                onClick={() => nav("/app")} 
              />
              {isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 shadow-xs border border-amber-300 font-mono">
                  PREMIUM MERCHANT
                </span>
              )}
              {(user?.is_verified || user?.is_verified_store || currentShop?.gst_status === "approved") && (
                <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono" title="Verified Dukaan Merchant">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
                </span>
              )}
            </div>
          </div>


          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* ================================================
                NOTIFICATION BELL
            ================================================ */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="notification-bell"
                  className={`relative w-9 h-9 rounded-full grid place-items-center transition-colors ${isPremium ? "premium-control" : "border border-brand-mitti bg-white text-brand-indigo hover:border-brand-indigo"}`}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-brand-terracotta text-white text-[10px] font-bold grid place-items-center leading-none px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-2">
                  <DropdownMenuLabel className="p-0 text-sm font-bold">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                      className="text-xs text-brand-terracotta hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-brand-indigo/50">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer ${!notif.read ? "bg-brand-sand/50" : ""}`}
                      onClick={() => markRead(notif.id)}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? "bg-brand-terracotta" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${NOTIF_COLORS[notif.type] || NOTIF_COLORS.info}`}>
                          {notif.title}
                        </span>
                        <p className="text-xs text-brand-indigo/70 mt-0.5 leading-snug">{notif.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>


            {/* ================================================
                SHOP SWITCHER
            ================================================ */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="shop-switcher" className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors ${isPremium ? "premium-control" : "border-brand-mitti bg-white text-brand-indigo hover:border-brand-indigo"}`}>
                  <Store className="w-4 h-4"/><span className="max-w-[140px] truncate">{activeShop?.name || "Select shop"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Your shops</DropdownMenuLabel>
                {shops.map(s => <DropdownMenuItem key={s.id} onClick={() => setActiveShop(s.id)} data-testid={`shop-option-${s.id}`}><Store className="w-4 h-4 mr-2"/> {s.name}</DropdownMenuItem>)}
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => nav("/app/settings")} data-testid="shop-add">+ Add / manage shops</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>





            {/* ================================================
                USER MENU
            ================================================ */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu" className={`w-9 h-9 rounded-full overflow-hidden grid place-items-center font-heading font-semibold transition-all border ${isPremium ? "premium-avatar border-amber-400 shadow-sm" : "bg-brand-indigo text-white border-brand-indigo/30"}`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
                  ) : (
                    (user?.name || user?.email || "U")[0].toUpperCase()
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-3 py-2 bg-brand-sand/60 rounded-xl mb-1">
                  <div className="font-heading font-bold text-sm text-brand-indigo truncate">
                    {user?.name || "Merchant"}
                  </div>
                  <div className="text-xs text-brand-indigo/60 truncate">
                    {user?.email || "owner@dukaan.in"}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-indigo text-white">
                      {user?.subscription?.plan || "Starter"} Plan
                    </span>
                    {user?.subscription?.is_trial && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                        Trial
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => nav("/app/settings?tab=account")} className="cursor-pointer py-2 text-xs font-semibold">
                  <Cog className="w-4 h-4 mr-2 text-brand-terracotta" /> My Account & Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/app/settings?tab=shop")} className="cursor-pointer py-2 text-xs font-semibold">
                  <Store className="w-4 h-4 mr-2 text-brand-indigo" /> Shop & Branches
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/app/billing")} className="cursor-pointer py-2 text-xs font-semibold">
                  <CreditCard className="w-4 h-4 mr-2 text-blue-600" /> Billing & Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/subscribe")} className="cursor-pointer py-2 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-500" /> Upgrade / Change Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={async () => { await logout(); nav("/"); }} data-testid="logout-btn" className="cursor-pointer py-2 text-xs font-semibold text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-2"/> {t(lang,"logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* Admin Simulation Alert Bar for Master Admin & Store Inspector */}
      {(isMasterAdmin || inspectorSession) && (platformConfig.maintenance_mode || isMerchantFrozen) && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-black flex items-center justify-between shadow-md border-b border-amber-600">
          <div className="mx-auto max-w-[1400px] flex-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-950 animate-pulse flex-shrink-0" />
            <span>
              [ADMIN SIMULATION ACTIVE] — 
              {platformConfig.maintenance_mode ? " ⚠️ PLATFORM MAINTENANCE IS ACTIVE (All regular merchants are blocked)." : ""}
              {isMerchantFrozen ? " 🛡️ STORE SECURITY FREEZE IS ACTIVE for this merchant/shop." : ""}
              {" (Bypassed for you as Master Admin / Store Inspector)"}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold ml-3">
            Admin View
          </span>
        </div>
      )}

      {/* Global Merchant Broadcast Banner */}
      {platformConfig.announcement && dismissedAnnouncement !== platformConfig.announcement && (
        <div className="bg-gradient-to-r from-[#1B1464] via-indigo-900 to-[#1B1464] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-indigo-700/50 shadow-md">
          <div className="mx-auto max-w-[1400px] flex-1 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px] bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
              Announcement
            </span>
            <span className="text-white font-medium">{platformConfig.announcement}</span>
          </div>
          <button 
            onClick={() => setDismissedAnnouncement(platformConfig.announcement)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-3"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          CONTENT AREA (SIDEBAR + MAIN)
      ===================================================== */}

      <div className={`mx-auto max-w-[1400px] flex ${isPremium ? "premium-content" : ""}`}>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-brand-mitti min-h-[calc(100vh-4rem)] pt-6 px-3 bg-white">
          <nav className="space-y-1 flex-1">
            {NAV.map(({ to, key, Icon, end }) => {
              const locked = isLocked(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  data-testid={`nav-${key}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-brand-indigo text-white" : "text-brand-indigo/80 hover:bg-brand-mitti/50"}`
                  }
                >
                  <Icon className="w-4 h-4"/>
                  <span className="flex-1">{t(lang, key)}</span>
                  {locked && <Lock className="w-3 h-3 text-brand-terracotta" data-testid={`lock-${key}`}/>}
                </NavLink>
              );
            })}
            {user?.is_admin && (
              <NavLink
                to="/admin"
                data-testid="nav-admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-brand-terracotta text-white" : "text-brand-terracotta hover:bg-brand-terracotta/10"}`
                }
              >
                <ShieldCheck className="w-4 h-4"/> Admin
              </NavLink>
            )}
          </nav>
          <div className="mt-6 mb-6 px-1">
            <Button
              className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white rounded-full active:scale-95 transition-all"
              onClick={() => nav("/app/pos")}
              data-testid="sidebar-new-bill"
            >
              + {t(lang, "new_bill")}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 min-w-0 px-3 sm:px-4 md:px-8 py-4 sm:py-6 ${isPremium ? "premium-main pb-28 md:pb-6" : "pb-28 md:pb-6"}`}>
          <RenewalBanner />
          <Outlet/>
        </main>
      </div>


      {/* =====================================================
          BOTTOM NAVIGATION (Mobile Only - Native App Feel)
      ===================================================== */}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-mitti shadow-nav pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {MOBILE_NAV.map(({ to, key, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`bottomnav-${key}`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl text-[11px] font-bold transition-all relative ${
                  isActive 
                    ? "text-brand-terracotta bg-brand-terracotta/10 scale-105" 
                    : "text-brand-indigo/65 hover:text-brand-indigo active:scale-95"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  <span className="leading-tight truncate max-w-[64px]">{t(lang, key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
