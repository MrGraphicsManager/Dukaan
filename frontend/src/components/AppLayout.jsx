import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { t } from "@/lib/i18n";
import { LayoutDashboard, Receipt, Package, Warehouse, Users, Wallet, ClipboardList, BarChart3, Settings as Cog, LogOut, Store, CreditCard, ShieldCheck, Lock, Monitor, Bell, CheckCheck } from "lucide-react";
import { PLAN_TIER, ROUTE_PLAN } from "@/components/SubGate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

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
  const { user, shops, currentShopId, setActiveShop, logout, lang, setLang } = useAuth();
  const nav = useNavigate();
  const activeShop = (shops || []).find(s => s?.id === currentShopId) || shops?.[0] || { name: "Apni Dukaan" };
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifications();

  // Always read the current subscription from the backend. AuthContext may have
  // an older user object after a Premium purchase, which previously caused the
  // standard desktop sidebar to remain visible for Premium users.
  useEffect(() => {
    let alive = true;
    setSubscriptionLoaded(false);
    api.get("/subscriptions/me")
      .then(r => { if (alive) setSubscription(r.data?.active || null); })
      .catch(() => { if (alive) setSubscription(null); })
      .finally(() => { if (alive) setSubscriptionLoaded(true); });
    return () => { alive = false; };
  }, [user?.id, currentShopId]);

  // Fetch notifications on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const isPremium = subscription?.plan === "premium" || user?.subscription?.plan === "premium";
  const tierMap = PLAN_TIER || { starter: 1, business: 2, premium: 3 };
  const routeMap = ROUTE_PLAN || {};
  const currentTier = user?.is_admin ? 999 : (tierMap[subscription?.plan || user?.subscription?.plan] || 3);
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

  return (
    <div className={`min-h-screen ${isPremium ? "premium-app-shell" : "bg-brand-sand"} ${premiumClass}`}>

      {/* =====================================================
          TOP NAVIGATION BAR
      ===================================================== */}

      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${isPremium ? "premium-topbar" : "bg-brand-cream/95 border-brand-mitti"}`}>
        <div className="mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => nav("/app")} data-testid="topbar-logo" aria-label="Home">
              <span className={`font-display text-2xl ${isPremium ? "text-white" : "text-brand-indigo"}`}>दुकान</span>
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className={`font-display text-2xl ${isPremium ? "text-white" : "text-brand-indigo"}`}>दुकान · Dukaan</span>
              {isPremium && <span className="premium-top-label">PREMIUM</span>}
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
                LANGUAGE SWITCHER
            ================================================ */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="lang-switcher" className={`px-3 py-2 rounded-full border text-sm transition-colors ${isPremium ? "premium-control" : "border-brand-mitti bg-white text-brand-indigo hover:border-brand-indigo"}`}>{lang.toUpperCase()}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("gu")}>ગુજરાતી</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


            {/* ================================================
                USER MENU
            ================================================ */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu" className={`w-9 h-9 rounded-full grid place-items-center font-heading font-semibold ${isPremium ? "premium-avatar" : "bg-brand-indigo text-white"}`}>{(user?.name || user?.email || "U")[0].toUpperCase()}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => nav("/app/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/app/billing")}>Billing & Plan</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/subscribe")}>Upgrade / Buy Plan</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={async () => { await logout(); nav("/"); }} data-testid="logout-btn"><LogOut className="w-4 h-4 mr-2"/> {t(lang,"logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>


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
                to="/app/admin"
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
