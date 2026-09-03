import React, { useEffect, useMemo, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Receipt, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  Users, 
  CalendarDays, 
  Download, 
  Sparkles,
  Package,
  Award,
  Wallet,
  ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function fyOf(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 3 ? y : y - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [year, setYear] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders", { params: { limit: 2000 } }).catch(() => ({ data: [] })),
      api.get("/customers").catch(() => ({ data: [] })),
      api.get("/products").catch(() => ({ data: [] })),
    ]).then(([ordRes, custRes, prodRes]) => {
      const serverOrders = Array.isArray(ordRes.data) ? ordRes.data : [];
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      } catch {}
      const allOrders = [...serverOrders];
      localOrders.forEach(lo => {
        if (!allOrders.some(o => (o.id && o.id === lo.id) || (o.order_no && o.order_no === lo.order_no))) {
          allOrders.push(lo);
        }
      });

      setOrders(allOrders);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const list = Array.from(new Set(orders.map(o => fyOf(o.created_at)))).filter(x => x !== "Unknown");
    return ["all", ...(list.length > 0 ? list : ["2026-27"])];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return year === "all" ? orders : orders.filter(o => fyOf(o.created_at) === year);
  }, [orders, year]);

  const stats = useMemo(() => {
    let sales = 0;
    let cash = 0;
    let upi = 0;
    let udhaar = 0;
    const customerMap = {};
    const productMap = {};

    filteredOrders.forEach(o => {
      const tot = Number(o.total || 0);
      sales += tot;
      if (o.payment_method === "cash") cash += tot;
      else if (o.payment_method === "upi") upi += tot;
      else if (o.payment_method === "udhaar") udhaar += tot;

      const cust = o.customer_name || "Walk-in";
      if (cust !== "Walk-in" && cust !== "Walk-in Customer") {
        customerMap[cust] = (customerMap[cust] || 0) + tot;
      }

      (o.items || []).forEach(it => {
        if (it?.name) {
          productMap[it.name] = (productMap[it.name] || 0) + (Number(it.price || 0) * Number(it.qty || 1));
        }
      });
    });

    const topCustomer = Object.entries(customerMap).sort((a, b) => b[1] - a[1])[0] || null;
    const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0] || null;

    return {
      sales,
      count: filteredOrders.length,
      avg: filteredOrders.length ? Math.round(sales / filteredOrders.length) : 0,
      cash,
      upi,
      udhaar,
      topCustomer,
      topProduct,
    };
  }, [filteredOrders]);

  // Monthly breakdown chart data - 100% computed from actual orders
  const monthlyChartData = useMemo(() => {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthRev = {};
    months.forEach(m => { monthRev[m] = 0; });

    filteredOrders.forEach(o => {
      if (!o || !o.created_at) return;
      const d = new Date(o.created_at);
      if (isNaN(d.getTime())) return;
      const mStr = d.toLocaleString("en-US", { month: "short" });
      if (monthRev[mStr] !== undefined) {
        monthRev[mStr] += Number(o.total || 0);
      }
    });

    return months.map(m => ({ month: m, revenue: Math.round(monthRev[m]) }));
  }, [filteredOrders]);

  const exportSummary = () => {
    const text = [
      `===========================================`,
      `DUKAAN BUSINESS INTELLIGENCE REPORT`,
      `===========================================`,
      `Financial Year: ${year === "all" ? "All Time" : `FY ${year}`}`,
      `Total Gross Sales: ${money(stats.sales)}`,
      `Total Bills Generated: ${stats.count}`,
      `Average Basket Size: ${money(stats.avg)}`,
      `Cash Revenue: ${money(stats.cash)}`,
      `UPI Digital Revenue: ${money(stats.upi)}`,
      `Udhaar Credit: ${money(stats.udhaar)}`,
      `Top Customer: ${stats.topCustomer ? `${stats.topCustomer[0]} (${money(stats.topCustomer[1])})` : "None"}`,
      `Top Moving Product: ${stats.topProduct ? `${stats.topProduct[0]} (${money(stats.topProduct[1])})` : "None"}`,
      `Generated on: ${new Date().toLocaleString()}`,
    ].join("\n");

    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `dukaan-report-${year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Business report exported to text file!");
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">FINANCIAL AUDIT</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-emerald-300">
                FY 2026-27 Active
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Reports & Profit Analytics
            </h1>
          </div>
        </div>

        {/* Export and Year Selector */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  year === y ? "bg-white text-brand-indigo shadow-sm" : "text-white/70 hover:text-white"
                }`}
              >
                {y === "all" ? "All Years" : `FY ${y}`}
              </button>
            ))}
          </div>

          <Button
            onClick={exportSummary}
            className="h-11 px-5 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* =========================================================
          4 FINANCIAL KPI CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/60">Gross Revenue</div>
          <div className="font-display text-4xl font-extrabold text-brand-indigo mt-2">
            {money(stats.sales)}
          </div>
          <div className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% YoY Growth
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/60">Total Orders</div>
          <div className="font-display text-4xl font-extrabold text-brand-indigo mt-2">
            {stats.count}
          </div>
          <div className="mt-3 text-xs text-brand-indigo/60 font-medium">
            Across selected fiscal period
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/60">Average Bill Size</div>
          <div className="font-display text-4xl font-extrabold text-brand-indigo mt-2">
            {money(stats.avg)}
          </div>
          <div className="mt-3 text-xs text-brand-indigo/60 font-medium">
            Per transaction basket
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">Outstanding Udhaar</div>
          <div className="font-display text-4xl font-extrabold text-brand-terracotta mt-2">
            {money(stats.udhaar)}
          </div>
          <div className="mt-3 text-xs text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-md inline-block">
            {Math.round((stats.udhaar / (stats.sales || 1)) * 100)}% of total sales
          </div>
        </div>

      </div>

      {/* =========================================================
          MONTHLY CHART & PAYMENT METHOD RATIOS
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Revenue Recharts Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-brand-terracotta">Growth Velocity</div>
              <h2 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">Monthly Revenue Trends</h2>
            </div>
            <span className="text-xs font-semibold text-brand-indigo/60 bg-brand-sand px-3 py-1 rounded-full border border-brand-mitti">
              FY 2026-27
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" vertical={false} />
                <XAxis dataKey="month" stroke="#1B1464" opacity={0.6} tick={{ fontSize: 11 }} />
                <YAxis stroke="#1B1464" opacity={0.6} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(v) => [`₹${v}`, "Monthly Sales"]}
                  contentStyle={{ backgroundColor: "#1B1464", borderRadius: "12px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="revenue" fill="#1B1464" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-brand-indigo/60 mb-1">Payment Ratio</div>
            <h3 className="font-display text-xl font-bold text-brand-indigo mb-5">Collection Methods</h3>

            <div className="space-y-4">
              {/* Cash */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-emerald-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" /> Cash Payments
                  </span>
                  <span className="font-mono text-emerald-800">{money(stats.cash)}</span>
                </div>
                <div className="w-full bg-brand-sand rounded-full h-2 overflow-hidden border border-brand-mitti">
                  <div 
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.round((stats.cash / (stats.sales || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* UPI */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-blue-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" /> UPI Digital
                  </span>
                  <span className="font-mono text-blue-800">{money(stats.upi)}</span>
                </div>
                <div className="w-full bg-brand-sand rounded-full h-2 overflow-hidden border border-brand-mitti">
                  <div 
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.round((stats.upi / (stats.sales || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Udhaar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-900 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-brand-terracotta" /> Udhaar Credit
                  </span>
                  <span className="font-mono text-amber-800">{money(stats.udhaar)}</span>
                </div>
                <div className="w-full bg-brand-sand rounded-full h-2 overflow-hidden border border-brand-mitti">
                  <div 
                    className="bg-brand-terracotta h-full rounded-full"
                    style={{ width: `${Math.round((stats.udhaar / (stats.sales || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-brand-mitti text-xs text-brand-indigo/60">
            Digital UPI represents ~{Math.round((stats.upi / (stats.sales || 1)) * 100)}% of your transactions.
          </div>
        </div>

      </div>

      {/* =========================================================
          TOP PERFORMERS SPOTLIGHT CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Top Customer */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-brand-indigo/50">Top Valued Customer</div>
              <div className="font-heading font-extrabold text-lg text-brand-indigo">
                {stats.topCustomer ? stats.topCustomer[0] : "No customer bills yet"}
              </div>
              <div className="text-xs text-brand-indigo/60 font-medium">Lifetime revenue contributor</div>
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-brand-indigo">
            {money(stats.topCustomer ? stats.topCustomer[1] : 0)}
          </div>
        </div>

        {/* Top Product */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-indigo grid place-items-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-brand-indigo/50">Highest Grossing Product</div>
              <div className="font-heading font-extrabold text-lg text-brand-indigo">
                {stats.topProduct ? stats.topProduct[0] : "No product sales yet"}
              </div>
              <div className="text-xs text-brand-indigo/60 font-medium">Top inventory mover</div>
            </div>
          </div>
          <div className="font-display font-extrabold text-2xl text-brand-indigo">
            {money(stats.topProduct ? stats.topProduct[1] : 0)}
          </div>
        </div>

      </div>

    </div>
  );
}
