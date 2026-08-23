import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";
import {
  LayoutDashboard, Receipt, Package, Warehouse, Users,
  Wallet, ClipboardList, BarChart3, Settings as Cog, LogOut, Store, CreditCard, ShieldCheck, Lock
} from "lucide-react";
import { PLAN_TIER, ROUTE_PLAN } from "@/components/SubGate";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
];

const MOBILE_NAV = NAV.filter(n => ["dashboard","new_bill","udhaar","orders","settings"].includes(n.key));

export default function AppLayout() {
  const { user, shops, currentShopId, setActiveShop, logout, lang, setLang } = useAuth();
  const nav = useNavigate();
  const activeShop = shops.find(s => s.id === currentShopId);

  // Compute locked routes based on user plan
  const currentTier = user?.is_admin ? 999 : (PLAN_TIER[user?.subscription?.plan] || 0);
  const isLocked = (to) => {
    const need = ROUTE_PLAN[to];
    if (!need) return false;
    return currentTier < PLAN_TIER[need];
  };

  return (
    <div className="min-h-screen bg-brand-sand">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-brand-sand/95 backdrop-blur border-b border-brand-mitti">
        <div className="mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden"
              onClick={() => nav("/app")}
              data-testid="topbar-logo"
              aria-label="Home"
            >
              <span className="font-display text-2xl text-brand-indigo">दुकान</span>
            </button>
            <span className="hidden md:inline font-display text-2xl text-brand-indigo">दुकान · Dukaan</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Shop switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="shop-switcher" className="flex items-center gap-2 px-3 py-2 rounded-md border border-brand-mitti bg-white text-sm text-brand-indigo hover:bg-brand-mitti/30 transition-colors">
                  <Store className="w-4 h-4" />
                  <span className="max-w-[140px] truncate">{activeShop?.name || "Select shop"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Your shops</DropdownMenuLabel>
                {shops.map(s => (
                  <DropdownMenuItem key={s.id} onClick={() => setActiveShop(s.id)} data-testid={`shop-option-${s.id}`}>
                    <Store className="w-4 h-4 mr-2" /> {s.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav("/app/settings")} data-testid="shop-add">
                  + Add / manage shops
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="lang-switcher" className="px-3 py-2 rounded-md border border-brand-mitti bg-white text-sm text-brand-indigo hover:bg-brand-mitti/30 transition-colors">
                  {lang.toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("hi")}>हिन्दी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("gu")}>ગુજરાતી</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu" className="w-9 h-9 rounded-full bg-brand-indigo text-white grid place-items-center font-heading font-semibold">
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav("/app/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={async () => { await logout(); nav("/"); }} data-testid="logout-btn">
                  <LogOut className="w-4 h-4 mr-2" /> {t(lang,"logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-brand-mitti min-h-[calc(100vh-4rem)] pt-6 px-3">
          <nav className="space-y-1">
            {NAV.map(({ to, key, Icon, end }) => {
              const locked = isLocked(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  data-testid={`nav-${key}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-indigo text-white"
                        : "text-brand-indigo/80 hover:bg-brand-mitti/50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{t(lang, key)}</span>
                  {locked && <Lock className="w-3 h-3 text-brand-terracotta" data-testid={`lock-${key}`} />}
                </NavLink>
              );
            })}
            {user?.is_admin && (
              <NavLink
                to="/app/admin"
                data-testid="nav-admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-terracotta text-white"
                      : "text-brand-terracotta hover:bg-brand-terracotta/10"
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </NavLink>
            )}
          </nav>
          <div className="mt-6 px-3">
            <Button
              className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform"
              onClick={() => nav("/app/pos")}
              data-testid="sidebar-new-bill"
            >
              + {t(lang, "new_bill")}
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-brand-mitti">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map(({ to, key, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`bottomnav-${key}`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                  isActive ? "text-brand-terracotta" : "text-brand-indigo/70"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {t(lang, key)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
