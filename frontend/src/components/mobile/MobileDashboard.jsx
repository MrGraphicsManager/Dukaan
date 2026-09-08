import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Bell, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  Plus, 
  Package, 
  Users, 
  BarChart3, 
  Crown, 
  ArrowRight, 
  X,
  TrendingUp,
  Receipt,
  QrCode,
  Store,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Download
} from "lucide-react";
import { toast } from "sonner";
import MobileSideDrawer from "./MobileSideDrawer";
import MobileBottomNav from "./MobileBottomNav";
import MobileThermalReceiptModal from "./MobileThermalReceiptModal";
import MobileStoreQrModal from "./MobileStoreQrModal";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";

const DEFAULT_RECENT_BILLS = [];

function getStoredDashboardBills() {
  try {
    const raw = localStorage.getItem("dukaan_orders");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped = parsed.slice(0, 5).map((o) => ({
          id: String(o.id || o.order_no || "").startsWith("#") ? String(o.id || o.order_no) : `#${o.id || o.order_no}`,
          customer: o.customer || o.customer_name || "Customer",
          customerPhone: o.customerPhone || o.customer_phone || "",
          payment: o.payment || o.payment_method || "Cash",
          items: o.items_count || (o.itemsList && o.itemsList.length) || (o.items && o.items.length) || 1,
          amount: `₹ ${o.total || 0}`,
          time: o.date || (o.created_at ? o.created_at.slice(11, 16) : "Just now"),
          type: (o.payment || o.payment_method || "C").charAt(0).toUpperCase(),
          itemsList: o.itemsList || o.items || [{ name: "Groceries", qty: 1, rate: o.total || 0, total: o.total || 0 }],
        }));
        return mapped;
      }
    }
  } catch {}
  return [];
}

export default function MobileDashboard({ onNavigate, merchantData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProBanner, setShowProBanner] = useState(true);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBillForModal, setSelectedBillForModal] = useState(null);
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [recentBills, setRecentBills] = useState(() => getStoredDashboardBills());
  const [lowStock, setLowStock] = useState([]);

  const name = merchantData?.fullName || merchantData?.name || "Merchant";
  const businessName = merchantData?.businessName || merchantData?.shopName || "Apni Dukaan";
  const address = merchantData?.address || "";
  const initial = name.charAt(0).toUpperCase();

  // Load live stock and bills
  useEffect(() => {
    const refreshLive = () => {
      setRecentBills(getStoredDashboardBills());

      try {
        const products = getStoredProducts();
        const low = products
          .filter((p) => {
            const s = p.stock !== undefined ? p.stock : 0;
            const min = p.min_stock !== undefined ? p.min_stock : 5;
            return s <= min;
          })
          .slice(0, 4)
          .map((p) => ({
            id: p.id,
            name: p.name,
            left: p.stock !== undefined ? p.stock : 0,
            unit: p.unit || "packs",
            color: p.stock === 0 ? "text-rose-600 bg-rose-50 font-bold" : "text-amber-600 bg-amber-50",
            type: (p.name || "P").charAt(0).toUpperCase(),
          }));
        setLowStock(low);
      } catch {}
    };

    refreshLive();
    window.addEventListener("dukaan_orders_updated", refreshLive);
    window.addEventListener("dukaan_products_updated", refreshLive);
    return () => {
      window.removeEventListener("dukaan_orders_updated", refreshLive);
      window.removeEventListener("dukaan_products_updated", refreshLive);
    };
  }, []);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Dukaan App added to your Home Screen!");
      }
      setDeferredPrompt(null);
      setShowPwaBanner(false);
    } else {
      toast.info("To install on your phone: Tap browser Menu (⋮ or Share) -> 'Add to Home Screen'");
    }
  };

  // Compute live sales from saved orders
  let savedOrdersSum = 0;
  let savedOrdersCount = 0;
  try {
    const raw = localStorage.getItem("dukaan_orders");
    if (raw) {
      const orders = JSON.parse(raw);
      if (Array.isArray(orders)) {
        savedOrdersCount = orders.length;
        savedOrdersSum = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      }
    }
  } catch {}

  const periodMetrics = {
    today: {
      sales: savedOrdersSum.toLocaleString("en-IN"),
      bills: savedOrdersCount,
      customers: savedOrdersCount > 0 ? Math.min(savedOrdersCount, 12) : 0,
      growth: savedOrdersCount > 0 ? "+100%" : "0%",
    },
    yesterday: { sales: "0", bills: 0, customers: 0, growth: "0%" },
    week: { sales: savedOrdersSum.toLocaleString("en-IN"), bills: savedOrdersCount, customers: savedOrdersCount, growth: savedOrdersCount > 0 ? "+100%" : "0%" },
    month: { sales: savedOrdersSum.toLocaleString("en-IN"), bills: savedOrdersCount, customers: savedOrdersCount, growth: savedOrdersCount > 0 ? "+100%" : "0%" },
  };

  const currentM = periodMetrics[selectedPeriod] || periodMetrics.today;

  const handleApplyRestock = () => {
    if (!restockModalItem) return;

    try {
      const stored = getStoredProducts();
      const updated = stored.map((p) => {
        if (p.id === restockModalItem.id) {
          return { ...p, stock: (p.stock || 0) + restockAmount };
        }
        return p;
      });
      saveStoredProducts(updated);
    } catch {}

    setLowStock((prev) =>
      prev.map((item) =>
        item.id === restockModalItem.id
          ? { ...item, left: item.left + restockAmount }
          : item
      )
    );
    toast.success(`Restocked +${restockAmount} ${restockModalItem.unit} for ${restockModalItem.name}!`);
    setRestockModalItem(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between max-w-md mx-auto select-none relative pb-20">
      
      {/* Side Drawer Component */}
      <MobileSideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={onNavigate}
        merchantData={merchantData}
      />

      {/* Thermal Receipt Preview Modal */}
      <MobileThermalReceiptModal
        isOpen={Boolean(selectedBillForModal)}
        billData={selectedBillForModal}
        merchantData={merchantData}
        onClose={() => setSelectedBillForModal(null)}
      />

      {/* Store QR Payment Modal */}
      <MobileStoreQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        merchantData={merchantData}
      />

      {/* Restock Interactive Sheet */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Restock Product</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{restockModalItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs">
              <span className="text-amber-800 font-semibold">Current Shelf Stock:</span>
              <span className="font-black text-amber-900">{restockModalItem.left} {restockModalItem.unit}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Add Units to Inventory
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      restockAmount === amt
                        ? "bg-[#0066FF] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyRestock}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Restock (+{restockAmount} Units)</span>
            </button>
          </div>
        </div>
      )}

      {/* Date Period Selector Sheet */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Select Analytics Timeframe</h3>
              <button
                onClick={() => setShowPeriodModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                { id: "today", label: "Today's Live Sales", desc: "Since 12:00 AM midnight" },
                { id: "yesterday", label: "Yesterday", desc: "Full day previous sales" },
                { id: "week", label: "This Week", desc: "Past 7 calendar days" },
                { id: "month", label: "This Month", desc: "Full calendar month to date" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPeriod(p.id);
                    setShowPeriodModal(false);
                    toast.success(`Filter switched to ${p.label}`);
                  }}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedPeriod === p.id
                      ? "bg-blue-50 border border-blue-200 text-[#0066FF]"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-slate-400">{p.desc}</div>
                  </div>
                  {selectedPeriod === p.id && <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="p-1 -ml-1 text-slate-700 hover:text-slate-900 cursor-pointer active:scale-90 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
                {initial}
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">dukaan</span>
                <span className="text-[10px] font-bold text-slate-400 block leading-none">by PEAN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowQrModal(true)}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button 
              onClick={() => onNavigate && onNavigate("notifications")}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center relative transition-colors cursor-pointer shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0066FF] rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        
        {/* PWA 1-Tap Home Screen Banner */}
        {showPwaBanner && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-black leading-tight">Install Dukaan App</div>
                <div className="text-[10px] text-blue-100 leading-tight mt-0.5">
                  1-Tap instant access on your phone
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstallPwa}
                className="px-3 py-1.5 rounded-xl bg-white text-blue-600 text-xs font-black shadow-xs hover:bg-blue-50 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Install
              </button>
              <button
                onClick={() => setShowPwaBanner(false)}
                className="p-1 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Business Header info */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Kirana Store Dashboard</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-slate-800 flex items-center gap-0.5">
                {businessName}
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-slate-400 text-[11px]">
                <MapPin className="w-3 h-3 text-slate-400" />
                {address}
              </span>
            </div>
          </div>

          {/* Interactive Date Filter Dropdown */}
          <button 
            onClick={() => setShowPeriodModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
            <span className="capitalize">{selectedPeriod === "week" ? "This Week" : selectedPeriod === "month" ? "This Month" : selectedPeriod}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* 3 Top Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Card 1: Total Sales */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-blue-100 transition-all">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 font-black text-sm">
              ₹
            </div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Sales</span>
            <span className="block text-base font-black text-slate-900 mt-0.5">₹ {currentM.sales}</span>
            <span className="block text-[10px] font-extrabold text-emerald-600 mt-1">↑ {currentM.growth}</span>
          </div>

          {/* Card 2: Total Bills */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-blue-100 transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center mb-2">
              <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Bills</span>
            <span className="block text-base font-black text-slate-900 mt-0.5">{currentM.bills}</span>
            <span className="block text-[10px] font-extrabold text-emerald-600 mt-1">↑ +8%</span>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-blue-100 transition-all">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Customers</span>
            <span className="block text-base font-black text-slate-900 mt-0.5">{currentM.customers}</span>
            <span className="block text-[10px] font-extrabold text-emerald-600 mt-1">↑ +18%</span>
          </div>

        </div>

        {/* 4 Action Pills */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => onNavigate && onNavigate("new-bill")}
            className="p-2.5 rounded-2xl bg-[#0066FF] hover:bg-blue-700 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mb-1">
              <Plus className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <span className="text-[11px] font-bold">New Bill</span>
          </button>

          <button 
            onClick={() => onNavigate && onNavigate("products")}
            className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-700 flex flex-col items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-1">
              <Package className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold">Products</span>
          </button>

          <button 
            onClick={() => onNavigate && onNavigate("customers")}
            className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-700 flex flex-col items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-1">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold">Customers</span>
          </button>

          <button 
            onClick={() => onNavigate && onNavigate("reports")}
            className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-700 flex flex-col items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold">Reports</span>
          </button>
        </div>

        {/* Grow Business with Pro Banner */}
        {showProBanner && (
          <div className="p-3.5 rounded-3xl bg-[#0E0C28] text-white relative overflow-hidden flex items-center justify-between shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight leading-tight">Grow Business with Pro</h4>
                <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">Unlimited thermal prints & khata ledger</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5">
              <button 
                onClick={() => onNavigate && onNavigate("upgrade")}
                className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Upgrade
              </button>
              <button 
                onClick={() => setShowProBanner(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Recent Bills Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Recent Store Invoices</h3>
            <button 
              onClick={() => onNavigate && onNavigate("orders")}
              className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
            >
              See All Bills
            </button>
          </div>

          <div className="space-y-2">
            {recentBills.map((b) => (
              <div 
                key={b.id} 
                onClick={() => setSelectedBillForModal(b)}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    b.type === "U" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {b.type === "U" ? "UPI" : "₹"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#0066FF]">{b.id}</span>
                      <span className="text-[10px] text-slate-400">· {b.time}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate mt-0.5">{b.customer}</div>
                  </div>
                </div>

                <div className="text-right pl-2">
                  <span className="text-xs font-black text-slate-900 block">{b.amount}</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert Section */}
        {lowStock.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Low Stock Alert</h3>
              <button 
                onClick={() => onNavigate && onNavigate("stock")}
                className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
              >
                Stock Room
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {lowStock.map((it) => (
                <div key={it.id} className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${it.color} shrink-0`}>
                      {it.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{it.name}</span>
                      <span className="text-[10px] text-rose-500 font-extrabold block">
                        {it.left === 0 ? "Out of stock" : `${it.left} ${it.unit} left`}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setRestockModalItem(it);
                      setRestockAmount(10);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Dock Nav */}
      <MobileBottomNav activeTab="home" onTabChange={(tabId) => onNavigate && onNavigate(tabId === "billing" ? "new-bill" : tabId === "products" ? "products" : tabId === "customers" ? "customers" : tabId === "more" ? "settings" : "dashboard")} />

    </div>
  );
}
