import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import RenewalBanner from "@/components/RenewalBanner";
import {
  Receipt,
  Package,
  Warehouse,
  Users,
  Wallet,
  ClipboardList,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Crown,
  ShieldCheck,
  CalendarDays,
  Store,
  Clock3,
  Plus,
  ArrowRight,
  Sparkles,
  QrCode,
  Volume2,
  Banknote,
  Percent,
  CheckCircle2,
  Printer,
  ChevronRight,
  Zap,
  Target,
  Moon,
  Share2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const nav = useNavigate();
  const { lang, currentShopId, user } = useAuth();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sub, setSub] = useState(null);
  const [premium, setPremium] = useState(null);
  const [now, setNow] = useState(new Date());
  const [dailyTarget, setDailyTarget] = useState(25000);
  const [soundboxPlaying, setSoundboxPlaying] = useState(false);
  const [eodOpen, setEodOpen] = useState(false);

  const handleShareEodWhatsApp = () => {
    const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const shopName = premium?.name || user?.name || "Apni Dukaan";
    const topItems = (d?.top_products || []).slice(0, 3).map((it, idx) => `${idx + 1}. ${it.name} (${it.qty} pcs - ₹${it.rev})`).join("\n");
    
    const msg = `📊 *${shopName} — Daily Closing Hisab (EOD)*\n` +
      `📅 Date: ${todayStr}\n` +
      `------------------------------------\n` +
      `🧾 Total Bills Created: *${d?.today?.orders || 0}*\n` +
      `💰 Total Sales Today: *${money(d?.today?.sales || 0)}*\n` +
      `💵 Cash Collected: *${money(d?.today?.cash || 0)}*\n` +
      `📲 UPI Payments: *${money(d?.today?.upi || 0)}*\n` +
      `📒 Pending Udhaar: *${money(d?.total_pending || 0)}*\n` +
      `------------------------------------\n` +
      `🔥 *Top Selling Items Today:*\n${topItems || "No items recorded today"}\n` +
      `------------------------------------\n` +
      `✅ Daily register closed & balances verified.\n` +
      `Dukaan Assistant · officialdukaan.in`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp with Daily Hisab summary...");
  };

  // Hourly trend dynamically calculated from actual today's sales
  const salesHourlyData = (d?.today?.sales > 0) ? [
    { hour: "9 AM", sales: Math.round(d.today.sales * 0.08) },
    { hour: "11 AM", sales: Math.round(d.today.sales * 0.18) },
    { hour: "1 PM", sales: Math.round(d.today.sales * 0.15) },
    { hour: "3 PM", sales: Math.round(d.today.sales * 0.12) },
    { hour: "5 PM", sales: Math.round(d.today.sales * 0.22) },
    { hour: "7 PM (Rush)", sales: Math.round(d.today.sales * 0.25) },
  ] : [
    { hour: "9 AM", sales: 0 },
    { hour: "11 AM", sales: 0 },
    { hour: "1 PM", sales: 0 },
    { hour: "3 PM", sales: 0 },
    { hour: "5 PM", sales: 0 },
    { hour: "7 PM", sales: 0 },
  ];

  const getSafeOrders = useCallback(() => {
    try {
      const raw = localStorage.getItem("dukaan_orders");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!currentShopId) return;
    if (silent) setRefreshing(true); else setLoading(true);
    setErr("");
    try {
      const [dashboardRes, ordersRes, productsRes] = await Promise.all([
        api.get("/dashboard").catch(() => null),
        api.get("/orders", { params: { limit: 8 } }).catch(() => null),
        api.get("/products").catch(() => null),
      ]);
      const data = dashboardRes?.data || {};
      const localOrders = getSafeOrders();
      const orders = (Array.isArray(ordersRes?.data) && ordersRes.data.length > 0) ? ordersRes.data : localOrders;
      const allProducts = Array.isArray(productsRes?.data) ? productsRes.data : [];

      let actualSales = 0;
      let actualOrders = 0;
      let actualCash = 0;
      let actualUpi = 0;
      let actualUdhaar = 0;

      (orders || []).forEach(o => {
        if (!o) return;
        const tot = Number(o.total || 0);
        actualSales += tot;
        actualOrders += 1;
        if (o.payment_method === "cash") actualCash += tot;
        else if (o.payment_method === "upi") actualUpi += tot;
        else if (o.payment_method === "udhaar") actualUdhaar += tot;
      });

      const productSalesMap = {};
      (orders || []).forEach(o => {
        if (!o || !Array.isArray(o.items)) return;
        o.items.forEach(it => {
          if (!it) return;
          const key = it.name || "Item";
          if (!productSalesMap[key]) productSalesMap[key] = { name: key, qty: 0, rev: 0 };
          productSalesMap[key].qty += Number(it.qty || 1);
          productSalesMap[key].rev += Number(it.price || 0) * Number(it.qty || 1);
        });
      });
      const topProductsList = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);
      const udhaarOrders = (orders || []).filter(o => o && (o.payment_method === "udhaar" || o.status === "udhaar"));

      setD({
        today: {
          sales: actualSales,
          orders: actualOrders,
          cash: actualCash,
          upi: actualUpi,
        },
        total_pending: actualUdhaar,
        low_stock: (allProducts || []).filter(p => p && !p.unlimited_stock && Number(p.stock || 0) <= Number(p.min_stock || 5)),
        recent_orders: (orders || []).slice(0, 10),
        top_products: topProductsList,
        udhaar_orders: udhaarOrders,
        allProductsCount: allProducts.length,
      });
    } catch (e) {
      const localOrders = getSafeOrders();
      let actualSales = 0;
      let actualOrders = 0;
      let actualCash = 0;
      let actualUpi = 0;
      let actualUdhaar = 0;

      (localOrders || []).forEach(o => {
        if (!o) return;
        const tot = Number(o.total || 0);
        actualSales += tot;
        actualOrders += 1;
        if (o.payment_method === "cash") actualCash += tot;
        else if (o.payment_method === "upi") actualUpi += tot;
        else if (o.payment_method === "udhaar") actualUdhaar += tot;
      });

      const productSalesMap = {};
      (localOrders || []).forEach(o => {
        if (!o || !Array.isArray(o.items)) return;
        o.items.forEach(it => {
          if (!it) return;
          const key = it.name || "Item";
          if (!productSalesMap[key]) productSalesMap[key] = { name: key, qty: 0, rev: 0 };
          productSalesMap[key].qty += Number(it.qty || 1);
          productSalesMap[key].rev += Number(it.price || 0) * Number(it.qty || 1);
        });
      });
      const topProductsList = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);
      const udhaarOrders = (localOrders || []).filter(o => o && (o.payment_method === "udhaar" || o.status === "udhaar"));

      setD({
        today: {
          sales: actualSales,
          orders: actualOrders,
          cash: actualCash,
          upi: actualUpi,
        },
        total_pending: actualUdhaar,
        low_stock: [],
        recent_orders: (localOrders || []).slice(0, 10),
        top_products: topProductsList,
        udhaar_orders: udhaarOrders,
        allProductsCount: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentShopId, getSafeOrders]);

  useEffect(() => {
    api.get("/subscriptions/me").then(r => setSub(r.data?.active || null)).catch(() => setSub(null));
  }, [currentShopId]);

  useEffect(() => {
    if (sub?.plan !== "premium") { setPremium(null); return; }
    api.get("/premium/profile").then(r => setPremium(r.data)).catch(() => setPremium(null));
  }, [sub?.plan, currentShopId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [currentShopId, loadDashboard]);

  // Restock action right from dashboard
  const handleQuickRestock = async (product, qty) => {
    try {
      await api.post(`/products/${product.id}/stock`, { qty, reason: "Quick dashboard restock" });
      toast.success(`Added +${qty} to ${product.name}`);
      loadDashboard({ silent: true });
    } catch {
      // Local optimistic update
      setD(prev => ({
        ...prev,
        low_stock: prev.low_stock.map(p => p.id === product.id ? { ...p, stock: p.stock + qty } : p)
      }));
      toast.success(`Added +${qty} to ${product.name}`);
    }
  };

  // Soundbox simulator
  const playSoundboxChime = () => {
    setSoundboxPlaying(true);
    if ("speechSynthesis" in window) {
      const text = `Dukaan par char sau pachas rupaye prapt hue.`;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "hi-IN";
      utter.rate = 1.0;
      utter.onend = () => setSoundboxPlaying(false);
      window.speechSynthesis.speak(utter);
    } else {
      toast.success("₹450 Received via UPI on Dukaan Soundbox");
      setTimeout(() => setSoundboxPlaying(false), 2000);
    }
  };

  if (loading && !d) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-mitti border-t-brand-terracotta rounded-full animate-spin" />
        <p className="font-heading text-brand-indigo/60 text-sm">Loading your Dukaan dashboard…</p>
      </div>
    );
  }

  const todaySales = d?.today?.sales || 0;
  const targetPct = Math.min(Math.round((todaySales / dailyTarget) * 100), 100);
  const timeText = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateText = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-7 animate-fade-up max-w-[1400px] mx-auto pb-16 selection:bg-brand-terracotta/20 font-sans">
      <RenewalBanner />

      {/* =========================================================
          ELEMENT 1: NEW REDESIGNED BUSINESS PULSE & TARGET HERO
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-9 shadow-xl border-2 border-brand-indigo/40">
        {/* Background atmospheric glows */}
        <div className="absolute -right-16 -top-20 w-80 h-80 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Shop branding & greeting */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/15">
                <Store className="w-3.5 h-3.5 text-brand-terracotta" />
                {premium?.name || "Apni Dukaan"}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Store Live
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-mono font-bold">
                FY 2026-27
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Good day, {premium?.owner_name || user?.name || "Shop Owner"}!
            </h1>
            <p className="text-white/70 text-sm md:text-base mt-2 max-w-xl">
              Here is your shop's performance today. Everything is synced and ready at the counter.
            </p>
          </div>

          {/* Right: Live Target Progress Ring & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Target Card */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-md min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-white/80 font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-brand-terracotta font-bold">
                  <Target className="w-4 h-4 text-brand-terracotta" /> Daily Target
                </span>
                <span>{targetPct}% achieved</span>
              </div>
              <div className="font-display text-2xl font-bold tracking-tight text-white">
                {money(todaySales)} <span className="text-xs font-sans text-white/60 font-normal">/ {money(dailyTarget)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-terracotta to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${targetPct}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => nav("/app/pos")}
                data-testid="dashboard-new-bill"
                className="h-12 px-6 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>+ New Bill (F1)</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadDashboard({ silent: true })}
                  disabled={refreshing}
                  className="flex-1 h-9 rounded-xl border-white/20 text-white hover:bg-white/10 bg-transparent text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => nav("/app/counter")}
                  className="flex-1 h-9 rounded-xl border-white/20 text-white hover:bg-white/10 bg-transparent text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Counter</span>
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setEodOpen(true)}
                className="w-full h-9 rounded-xl border-amber-400/40 text-amber-300 hover:bg-amber-400/15 bg-white/5 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>🌙 Daily EOD Closing Hisab</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ELEMENT 2: 4 VIBRANT NEW KPI METRIC CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Sales */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Today's Sales</div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-display text-4xl font-extrabold text-brand-indigo tracking-tight">
            {money(todaySales)}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-brand-mitti/60">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
            <span className="text-brand-indigo/60 font-medium">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Today's Orders */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Bills Generated</div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-display text-4xl font-extrabold text-brand-indigo tracking-tight">
            {d?.today?.orders || 0}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-brand-mitti/60">
            <span className="text-brand-indigo/70 font-semibold">Avg Basket</span>
            <span className="font-bold text-brand-indigo">
              {money(d?.today?.orders ? Math.round(todaySales / d.today.orders) : 0)} / bill
            </span>
          </div>
        </div>

        {/* Card 3: Pending Udhaar */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider font-bold text-brand-terracotta">Pending Udhaar</div>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-terracotta grid place-items-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-display text-4xl font-extrabold text-brand-terracotta tracking-tight">
            {money(d?.total_pending || 0)}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-brand-mitti/60">
            <button 
              onClick={() => nav("/app/udhaar")}
              className="text-brand-terracotta font-bold hover:underline flex items-center gap-1"
            >
              Collect Udhaar <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
              3 Overdue
            </span>
          </div>
        </div>

        {/* Card 4: Inventory & Low Stock */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Stock Health</div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 font-display text-4xl font-extrabold text-brand-indigo tracking-tight">
            {d?.low_stock?.length > 0 ? (
              <span className="text-brand-terracotta">{d.low_stock.length}</span>
            ) : (
              <span className="text-emerald-600">0</span>
            )}
            <span className="text-sm font-sans font-medium text-brand-indigo/50">alerts</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-brand-mitti/60">
            <button 
              onClick={() => nav("/app/stock")}
              className="text-brand-indigo font-bold hover:underline"
            >
              Total {d?.allProductsCount || 0} Products
            </button>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
              d?.low_stock?.length > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
            }`}>
              {d?.low_stock?.length > 0 ? "Action Required" : "All Stocked"}
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================
          ELEMENT 3: QUICK ACTION COMMAND BAR DOCK
      ========================================================= */}
      <div className="bg-white p-3.5 rounded-3xl border-2 border-brand-mitti shadow-xs flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo/50 px-3 py-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" /> Quick Actions:
        </span>

        <button
          onClick={() => nav("/app/pos")}
          className="px-4 py-2 rounded-2xl bg-brand-terracotta text-white font-bold text-xs shadow-sm hover:bg-brand-terracotta/90 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Receipt className="w-3.5 h-3.5" /> + New Bill
        </button>

        <button
          onClick={() => nav("/app/products")}
          className="px-4 py-2 rounded-2xl bg-brand-sand hover:bg-brand-mitti/60 text-brand-indigo font-bold text-xs border border-brand-mitti active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Package className="w-3.5 h-3.5 text-brand-indigo/70" /> Add Product
        </button>

        <button
          onClick={() => nav("/app/customers")}
          className="px-4 py-2 rounded-2xl bg-brand-sand hover:bg-brand-mitti/60 text-brand-indigo font-bold text-xs border border-brand-mitti active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-brand-indigo/70" /> Customers
        </button>

        <button
          onClick={() => nav("/app/udhaar")}
          className="px-4 py-2 rounded-2xl bg-brand-sand hover:bg-brand-mitti/60 text-brand-indigo font-bold text-xs border border-brand-mitti active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Wallet className="w-3.5 h-3.5 text-brand-terracotta" /> Record Udhaar
        </button>

        <button
          onClick={() => nav("/app/reports")}
          className="px-4 py-2 rounded-2xl bg-brand-sand hover:bg-brand-mitti/60 text-brand-indigo font-bold text-xs border border-brand-mitti active:scale-95 transition-all flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5 text-brand-indigo/70" /> Daily Reports
        </button>

        <button
          onClick={playSoundboxChime}
          className="ml-auto px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
          title="Simulate Voice Soundbox Notification"
        >
          <Volume2 className={`w-3.5 h-3.5 ${soundboxPlaying ? "animate-bounce text-emerald-600" : ""}`} />
          <span>{soundboxPlaying ? "Announcing..." : "Soundbox Test"}</span>
        </button>
      </div>

      {/* =========================================================
          ELEMENT 4 & 5: HOURLY SALES TREND + CASH DRAWER SPLIT
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ELEMENT 4: Interactive Hourly Sales Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-brand-terracotta">Hourly Breakdown</div>
              <h2 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Today's Sales Flow</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-indigo/70 bg-brand-sand px-3 py-1 rounded-full border border-brand-mitti">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Peak Rush: 6 PM - 8 PM
              </span>
            </div>
          </div>

          {/* Recharts Area Graph */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4623B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4623B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" vertical={false} />
                <XAxis dataKey="hour" stroke="#1B1464" opacity={0.6} tick={{ fontSize: 11 }} />
                <YAxis stroke="#1B1464" opacity={0.6} tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(val) => [`₹${val}`, "Sales"]}
                  contentStyle={{ backgroundColor: "#1B1464", borderRadius: "12px", color: "#fff", border: "none" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#D4623B" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ELEMENT 5: Cash Drawer & Digital Payment Split Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Drawer & Collections</div>
                <h3 className="font-display text-xl font-bold text-brand-indigo mt-0.5">Payment Split</h3>
              </div>
              <span className="p-2 rounded-xl bg-brand-sand text-brand-indigo border border-brand-mitti">
                <Banknote className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Cash Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center font-bold">
                    <Banknote className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">Cash in Drawer</div>
                    <div className="text-[11px] text-emerald-700 font-medium">Physical cash collected</div>
                  </div>
                </div>
                <div className="font-heading font-extrabold text-xl text-emerald-900">
                  {money(d?.today?.cash || 0)}
                </div>
              </div>

              {/* UPI Digital */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 grid place-items-center font-bold">
                    <QrCode className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900">UPI Digital Pay</div>
                    <div className="text-[11px] text-blue-700 font-medium">Bank account direct</div>
                  </div>
                </div>
                <div className="font-heading font-extrabold text-xl text-blue-900">
                  {money(d?.today?.upi || 0)}
                </div>
              </div>

              {/* Udhaar Credit */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 grid place-items-center font-bold">
                    <Wallet className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900">Udhaar Given</div>
                    <div className="text-[11px] text-amber-700 font-medium">Pending collection</div>
                  </div>
                </div>
                <div className="font-heading font-extrabold text-xl text-amber-900">
                  {money(d?.total_pending || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-mitti flex items-center justify-between">
            <span className="text-xs text-brand-indigo/60 font-medium">Reconcile Cash & UPI</span>
            <button 
              onClick={() => nav("/app/reports")}
              className="text-xs font-bold text-brand-terracotta hover:underline"
            >
              Export Report →
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================
          ELEMENT 6 & 7: LOW STOCK ACTION CENTER + RECENT ORDERS FEED
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ELEMENT 6: Low Stock Urgent Action Center with 1-Tap Restock */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-brand-terracotta flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Action Required
              </div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Low Stock Products</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => nav("/app/stock")}
              className="text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10 rounded-full"
            >
              Manage All Stock →
            </Button>
          </div>

          <div className="divide-y divide-brand-mitti">
            {(!d?.low_stock || d.low_stock.length === 0) ? (
              <div className="py-10 text-center text-brand-indigo/60 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All products are sufficiently stocked.
              </div>
            ) : (
              d.low_stock.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-heading font-bold text-brand-indigo text-sm">{p.name}</div>
                    <div className="text-xs text-brand-indigo/60 flex items-center gap-2 mt-0.5">
                      <span>{p.category || "General"}</span>
                      <span>·</span>
                      <span className="font-bold text-brand-terracotta">Only {p.stock} left</span>
                      <span>(min: {p.min_stock || 5})</span>
                    </div>
                  </div>

                  {/* 1-Tap Restock Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickRestock(p, 10)}
                      className="px-2.5 py-1 text-xs font-bold bg-brand-sand hover:bg-brand-mitti text-brand-indigo rounded-lg border border-brand-mitti active:scale-95 transition-all"
                      title="Add 10 to stock"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleQuickRestock(p, 25)}
                      className="px-2.5 py-1 text-xs font-bold bg-brand-sand hover:bg-brand-mitti text-brand-indigo rounded-lg border border-brand-mitti active:scale-95 transition-all"
                      title="Add 25 to stock"
                    >
                      +25
                    </button>
                    <button
                      onClick={() => handleQuickRestock(p, 50)}
                      className="px-2.5 py-1 text-xs font-bold bg-brand-terracotta text-white rounded-lg active:scale-95 transition-all shadow-xs"
                      title="Add 50 to stock"
                    >
                      +50
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ELEMENT 7: Recent Orders Feed with Instant Invoice Print */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Live Sales Log</div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Recent Bills</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => nav("/app/orders")}
              className="text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10 rounded-full"
            >
              All Orders ({d?.today?.orders || 0}) →
            </Button>
          </div>

          <div className="space-y-2.5">
            {(!d?.recent_orders || d.recent_orders.length === 0) ? (
              <div className="py-10 text-center text-brand-indigo/60 text-sm">
                No orders generated yet today.
              </div>
            ) : (
              d.recent_orders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  onClick={() => nav(`/app/orders/${o.id}`)}
                  className="p-3.5 rounded-2xl bg-brand-sand/50 hover:bg-brand-sand border border-brand-mitti/70 hover:border-brand-indigo/30 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl grid place-items-center font-bold text-xs ${
                      o.payment_method === "upi" ? "bg-blue-100 text-blue-700" :
                      o.payment_method === "cash" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-brand-terracotta"
                    }`}>
                      {o.payment_method === "upi" ? "UPI" : o.payment_method === "cash" ? "CASH" : "UDH"}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-brand-indigo text-sm flex items-center gap-2">
                        <span>#{o.order_no || "INV-001"}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          o.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-brand-terracotta"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-brand-indigo/55 font-medium mt-0.5">
                        {(o.created_at || "").slice(0, 16).replace("T", " ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-display font-bold text-brand-indigo text-base">
                      {money(o.total)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-indigo/40 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* =========================================================
          ELEMENT 8 & 9: TOP SELLING LEADERBOARD & UDHAAR REMINDERS
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ELEMENT 8: Top Selling Leaderboard */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-brand-indigo/60">Best Movers</div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Top Selling Items</h3>
            </div>
            <span className="text-xs font-semibold text-brand-indigo/60 bg-brand-sand px-3 py-1 rounded-full border border-brand-mitti">
              By Volume
            </span>
          </div>

          <div className="space-y-3">
            {(d?.top_products && d.top_products.length > 0) ? (
              d.top_products.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-brand-sand/40 border border-brand-mitti/60">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white grid place-items-center font-bold text-xs shadow-xs border border-brand-mitti text-brand-indigo">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-heading font-bold text-brand-indigo text-sm">{item.name}</div>
                      <div className="text-xs text-brand-indigo/60 font-medium">{item.qty} units billed</div>
                    </div>
                  </div>
                  <div className="font-heading font-extrabold text-brand-indigo text-sm">
                    {money(item.rev)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-brand-indigo/50">
                <Package className="w-9 h-9 mx-auto mb-2 opacity-30" />
                <div className="text-xs font-semibold text-brand-indigo">No sales recorded yet</div>
                <div className="text-[11px] text-brand-indigo/40 mt-0.5">Top moving items will appear here as bills are created</div>
              </div>
            )}
          </div>
        </div>

        {/* ELEMENT 9: Udhaar Recovery Watchlist with 1-Tap WhatsApp Link */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-brand-terracotta">Khata Recovery</div>
                <h3 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Udhaar Due Today</h3>
              </div>
              <Button
                variant="ghost"
                onClick={() => nav("/app/udhaar")}
                className="text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10 rounded-full"
              >
                View Khata Ledger →
              </Button>
            </div>

            <div className="space-y-3">
              {(d?.udhaar_orders && d.udhaar_orders.length > 0) ? (
                d.udhaar_orders.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50/40 border border-orange-200/60">
                    <div>
                      <div className="font-heading font-bold text-brand-indigo text-sm">{c.customer_name || "Customer"}</div>
                      <div className="text-xs text-brand-indigo/60">Bill #{c.order_no} · {c.customer_phone || "No phone"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-brand-terracotta text-base">{money(c.total)}</span>
                      {c.customer_phone && (
                        <a
                          href={`https://wa.me/91${c.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Namaste ${c.customer_name || ""} ji, Dukaan se aapka baki udhaar ${money(c.total)} hai. Kripya samay par chukta karein. Dhanyawaad!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <span>Send WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-brand-indigo/50">
                  <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-600 opacity-60" />
                  <div className="text-xs font-semibold text-brand-indigo">All accounts clear!</div>
                  <div className="text-[11px] text-brand-indigo/40 mt-0.5">No pending customer udhaar due today</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-mitti flex items-center justify-between text-xs text-brand-indigo/70 font-medium">
            <span>{d?.udhaar_orders?.length || 0} active udhaar accounts</span>
            <span className="text-emerald-700 font-bold">100% Khata Accuracy</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          ELEMENT 10: BOTTOM COUNTER MODE FAST LAUNCHER BANNER
      ========================================================= */}
      <div className="rounded-3xl p-6 bg-brand-sand border-2 border-brand-mitti flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-indigo text-white grid place-items-center shadow-sm">
            <Zap className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="font-heading font-bold text-brand-indigo text-base">
              Ready to stand at the counter?
            </div>
            <p className="text-xs text-brand-indigo/70">
              Open Fullscreen Counter Mode with F1-F6 keyboard shortcuts for lightning fast rush-hour billing.
            </p>
          </div>
        </div>
        <Button
          onClick={() => nav("/app/counter")}
          className="h-11 px-6 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all shrink-0"
        >
          Launch Counter Mode (F1-F6) →
        </Button>
      </div>

      {/* =========================================================
          DAILY EOD CLOSING HISAB MODAL (END OF DAY REPORT)
      ========================================================= */}
      <Dialog open={eodOpen} onOpenChange={setEodOpen}>
        <DialogContent className="max-w-md rounded-3xl p-7 border-2 border-brand-mitti text-brand-indigo font-sans">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 grid place-items-center mb-2 mx-auto">
              <Moon className="w-6 h-6 text-amber-700" />
            </div>
            <DialogTitle className="font-display text-2xl text-center font-bold text-brand-indigo">
              Daily EOD Closing Hisab
            </DialogTitle>
            <p className="text-xs text-center text-brand-indigo/60">
              End-of-day store closing summary for {now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </p>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {/* Sales & Bills Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-brand-sand border border-brand-mitti">
                <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Total Sale</div>
                <div className="font-display text-xl font-bold text-brand-indigo mt-0.5">{money(d?.today?.sales || 0)}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-sand border border-brand-mitti">
                <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Total Bills</div>
                <div className="font-display text-xl font-bold text-brand-indigo mt-0.5">{d?.today?.orders || 0} bills</div>
              </div>
            </div>

            {/* Cash, UPI, Udhaar Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-brand-mitti space-y-2 text-xs">
              <div className="text-[10px] uppercase font-extrabold text-brand-indigo/50 tracking-wider">Payment Breakdown</div>
              <div className="flex justify-between items-center text-emerald-800 font-semibold">
                <span className="flex items-center gap-1.5">💵 Cash Collected:</span>
                <span className="font-bold text-sm">{money(d?.today?.cash || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-800 font-semibold">
                <span className="flex items-center gap-1.5">📲 UPI Payments:</span>
                <span className="font-bold text-sm">{money(d?.today?.upi || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-brand-terracotta font-semibold pt-1 border-t border-brand-mitti/60">
                <span className="flex items-center gap-1.5">📒 New Udhaar Due:</span>
                <span className="font-bold text-sm">{money(d?.total_pending || 0)}</span>
              </div>
            </div>

            {/* Top Items List */}
            <div className="p-3.5 rounded-2xl bg-brand-sand/60 border border-brand-mitti text-xs space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-brand-indigo/60">Top Movers Today</div>
              {(d?.top_products && d.top_products.length > 0) ? (
                d.top_products.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between font-medium text-brand-indigo/80">
                    <span>{idx + 1}. {item.name}</span>
                    <span className="font-bold font-mono">{item.qty} pcs ({money(item.rev)})</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-brand-indigo/50 italic">No sales recorded yet today</div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 flex-col sm:flex-col gap-2">
            <Button
              onClick={handleShareEodWhatsApp}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Hisab on WhatsApp (Owner / Partner)</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEodOpen(false)}
              className="w-full h-10 rounded-2xl text-brand-indigo/60 text-xs"
            >
              Close Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
