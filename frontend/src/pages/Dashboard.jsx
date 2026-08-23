import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Receipt, Package, Warehouse, Users, Wallet, ClipboardList, BarChart3,
  IndianRupee, ShoppingCart, AlertTriangle, ArrowUpRight
} from "lucide-react";

function Kpi({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-xl p-5 border shadow-card ${tone === "dark" ? "bg-brand-indigo text-white border-brand-indigo" : "bg-white border-brand-mitti"}`}>
      <div className="flex items-center justify-between">
        <div className={`text-xs uppercase tracking-widest font-semibold ${tone==="dark"?"text-brand-terracotta":"text-brand-terracotta"}`}>{label}</div>
        <Icon className={`w-4 h-4 ${tone==="dark"?"text-white/60":"text-brand-indigo/50"}`} />
      </div>
      <div className="mt-2 font-heading text-3xl font-bold">{value}</div>
    </div>
  );
}

const QUICK = [
  { key:"new_bill", to:"/app/pos", icon: Receipt, tone: "primary" },
  { key:"products", to:"/app/products", icon: Package },
  { key:"stock", to:"/app/stock", icon: Warehouse },
  { key:"customers", to:"/app/customers", icon: Users },
  { key:"udhaar", to:"/app/udhaar", icon: Wallet },
  { key:"orders", to:"/app/orders", icon: ClipboardList },
  { key:"reports", to:"/app/reports", icon: BarChart3 },
];

export default function Dashboard() {
  const nav = useNavigate();
  const { lang, currentShopId } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!currentShopId) return;
    api.get("/dashboard").then(r => setD(r.data)).catch(e => setErr(e.response?.data?.detail || "Failed"));
  }, [currentShopId]);

  if (!d) return <div className="text-brand-indigo/60">{err || "Loading…"}</div>;

  return (
    <div className="space-y-8 animate-fade-up" data-testid="dashboard">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">{t(lang,"hello")}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold">{t(lang,"dashboard")}</h1>
        </div>
        <Button onClick={() => nav("/app/pos")} data-testid="dashboard-new-bill" className="h-11 px-5 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
          + {t(lang,"new_bill")}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Kpi label={t(lang,"today_sales")} value={money(d.today.sales)} icon={IndianRupee} tone="dark" />
        <Kpi label={t(lang,"today_orders")} value={d.today.orders} icon={ShoppingCart} />
        <Kpi label={t(lang,"cash")} value={money(d.today.cash)} icon={IndianRupee} />
        <Kpi label={t(lang,"upi")} value={money(d.today.upi)} icon={IndianRupee} />
        <Kpi label={t(lang,"pending")} value={money(d.total_pending)} icon={Wallet} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {QUICK.map(({ key, to, icon: Icon, tone }) => (
          <button
            key={key}
            onClick={() => nav(to)}
            data-testid={`quick-${key}`}
            className={`group rounded-xl p-4 border transition-colors text-left ${
              tone === "primary"
                ? "bg-brand-terracotta text-white border-brand-terracotta hover:bg-brand-terracotta/90"
                : "bg-white border-brand-mitti hover:bg-brand-mitti/50"
            }`}
          >
            <Icon className={`w-5 h-5 ${tone==="primary"?"text-white":"text-brand-indigo"}`} />
            <div className={`mt-3 font-heading font-semibold ${tone==="primary"?"":"text-brand-indigo"}`}>{t(lang,key)}</div>
          </button>
        ))}
      </div>

      {/* Low stock + recent */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="border-brand-mitti shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-brand-terracotta" /> {t(lang,"low_stock")}
              </h2>
              <Button variant="ghost" onClick={() => nav("/app/stock")} className="text-brand-terracotta">View all</Button>
            </div>
            <div className="mt-3 divide-y divide-brand-mitti" data-testid="low-stock-list">
              {d.low_stock.length === 0 && <div className="py-6 text-brand-indigo/60 text-sm">All stocked up. 👍</div>}
              {d.low_stock.slice(0,6).map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-brand-indigo/60">{p.category}</div>
                  </div>
                  <div className={`text-sm font-semibold ${p.stock === 0 ? "text-destructive" : "text-brand-terracotta"}`}>
                    {p.stock === 0 ? "🔴 Out" : `⚠️ ${p.stock} left`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-mitti shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{t(lang,"recent_orders")}</h2>
              <Button variant="ghost" onClick={() => nav("/app/orders")} className="text-brand-terracotta">All orders</Button>
            </div>
            <div className="mt-3 divide-y divide-brand-mitti" data-testid="recent-orders-list">
              {d.recent_orders.length === 0 && <div className="py-6 text-brand-indigo/60 text-sm">No orders yet.</div>}
              {d.recent_orders.map(o => (
                <button key={o.id} onClick={() => nav(`/app/orders/${o.id}`)} className="w-full py-3 flex items-center justify-between hover:bg-brand-mitti/30 rounded px-2 transition-colors">
                  <div className="text-left">
                    <div className="font-medium">#{o.order_no} · {o.items?.length || 0} items</div>
                    <div className="text-xs text-brand-indigo/60">{(o.created_at||"").slice(0,16).replace("T"," ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-bold">{money(o.total)}</div>
                    <div className={`text-xs uppercase tracking-widest font-semibold ${o.status==="paid"?"text-brand-leaf":"text-brand-terracotta"}`}>
                      {o.payment_method}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
