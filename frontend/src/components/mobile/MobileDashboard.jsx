import React, { useState } from "react";
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
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import MobileSideDrawer from "./MobileSideDrawer";
import MobileBottomNav from "./MobileBottomNav";
import MobileThermalReceiptModal from "./MobileThermalReceiptModal";
import MobileStoreQrModal from "./MobileStoreQrModal";

const periodMetrics = {
  today: { sales: "12,450", bills: 28, customers: 56, growth: "+12%", sparkVal: "12,450" },
  yesterday: { sales: "11,120", bills: 26, customers: 51, growth: "+8%", sparkVal: "11,120" },
  week: { sales: "90,650", bills: 184, customers: 320, growth: "+18.4%", sparkVal: "90,650" },
  month: { sales: "3,45,200", bills: 680, customers: 1150, growth: "+24.2%", sparkVal: "3,45,200" },
};

export default function MobileDashboard({ onNavigate, merchantData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProBanner, setShowProBanner] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBillForModal, setSelectedBillForModal] = useState(null);
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);

  const name = merchantData?.fullName || "Priyen Naik";
  const businessName = merchantData?.businessName || "ABC General Store";
  const address = merchantData?.address || "Navsari, Gujarat";
  const initial = name.charAt(0).toUpperCase();

  const [recentBills, setRecentBills] = useState([
    { 
      id: "#B1028", 
      customer: "Ramesh Sharma", 
      customerPhone: "9825123456", 
      payment: "Cash", 
      items: 2, 
      amount: "₹ 240", 
      time: "2 mins ago", 
      type: "C",
      itemsList: [
        { name: "Maggi 2-Minute Noodles 70g", qty: 2, rate: 14, total: 28 },
        { name: "Fortune Sunlite Oil 1L", qty: 1, rate: 165, total: 165 },
        { name: "Amul Butter 100g", qty: 1, rate: 47, total: 47 },
      ]
    },
    { 
      id: "#B1027", 
      customer: "Pooja Ben Joshi", 
      customerPhone: "9426788912", 
      payment: "UPI", 
      items: 5, 
      amount: "₹ 1,200", 
      time: "12 mins ago", 
      type: "U",
      itemsList: [
        { name: "Aashirvaad Atta 5kg", qty: 2, rate: 245, total: 490 },
        { name: "Tata Salt 1kg", qty: 3, rate: 28, total: 84 },
        { name: "Grocery Essentials Pack", qty: 1, rate: 626, total: 626 },
      ]
    },
    { 
      id: "#B1026", 
      customer: "Amit Kumar Patel", 
      customerPhone: "9898011223", 
      payment: "Cash", 
      items: 1, 
      amount: "₹ 680", 
      time: "30 mins ago", 
      type: "C",
      itemsList: [
        { name: "Tide Plus Detergent 5kg Pack", qty: 1, rate: 680, total: 680 }
      ]
    },
  ]);

  const [lowStock, setLowStock] = useState([
    { id: 1, name: "Coca Cola 500ml", left: 5, unit: "bottles", color: "text-rose-600 bg-rose-50", type: "C" },
    { id: 2, name: "Tide Detergent", left: 8, unit: "packs", color: "text-amber-600 bg-amber-50", type: "T" },
    { id: 3, name: "Harvest Bread", left: 0, unit: "loaves", color: "text-rose-600 bg-rose-50 font-bold", type: "B" },
    { id: 4, name: "Fresh Eggs (12)", left: 3, unit: "trays", color: "text-rose-600 bg-rose-50", type: "E" },
  ]);

  const currentM = periodMetrics[selectedPeriod] || periodMetrics.today;

  const handleApplyRestock = () => {
    if (!restockModalItem) return;
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
        onClose={() => setSelectedBillForModal(null)}
        billData={selectedBillForModal}
        merchantData={merchantData}
      />

      {/* Store UPI Counter QR Modal */}
      <MobileStoreQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        merchantData={merchantData}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img 
            src="/assets/mobile/dukaan_mobile_logo.png" 
            alt="Dukaan" 
            className="h-6 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Counter QR Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer active:scale-95 shadow-2xs"
          >
            <QrCode className="w-4 h-4" />
            <span className="text-[10px] hidden xs:inline">QR Pay</span>
          </button>

          {/* Notifications */}
          <button 
            onClick={() => toast.info("No new store alerts")}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {/* Profile initial */}
          <button 
            onClick={() => onNavigate && onNavigate("profile")}
            className="w-8 h-8 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {initial}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-4 space-y-3.5 flex-1">
        
        {/* Merchant Header row */}
        <div className="flex items-start justify-between">
          <div>
            <span className="block text-xs font-semibold text-slate-400">Good Afternoon,</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {name} 👋
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 leading-tight">
                  Grow your business with Dukaan Pro
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Get WhatsApp receipts, thermal printer & staff login.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => onNavigate && onNavigate("upgrade")}
                className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <span>Upgrade</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setShowProBanner(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Split: Recent Bills & Low Stock */}
        <div className="grid grid-cols-2 gap-2.5 items-start">
          
          {/* Left Column: Recent Bills */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-slate-900">Recent Bills</span>
                <button 
                  onClick={() => onNavigate && onNavigate("orders")}
                  className="text-[10px] font-bold text-[#0066FF] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {recentBills.map((bill) => (
                  <div 
                    key={bill.id}
                    onClick={() => setSelectedBillForModal(bill)}
                    className="p-2 rounded-xl bg-slate-50/70 hover:bg-blue-50/60 border border-slate-100 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] ${
                        bill.type === "C" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-[#0066FF]"
                      }`}>
                        {bill.type}
                      </div>
                      <div className="truncate">
                        <span className="block font-black text-[11px] text-slate-900">{bill.id}</span>
                        <span className="block text-[9px] text-slate-400">{bill.payment} · {bill.items} items</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block font-black text-[11px] text-slate-900">{bill.amount}</span>
                      <span className="block text-[9px] text-slate-400">{bill.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate("new-bill")}
              className="w-full mt-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0066FF] text-slate-600 font-bold text-[10px] transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create Bill</span>
            </button>
          </div>

          {/* Right Column: Low Stock */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-slate-900">Low Stock</span>
                <button 
                  onClick={() => onNavigate && onNavigate("stock")}
                  className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2">
                {lowStock.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setRestockModalItem(item)}
                    className="p-2 rounded-xl bg-slate-50/70 hover:bg-amber-50/60 border border-slate-100 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-black text-[10px] shrink-0">
                        {item.type}
                      </div>
                      <span className="font-bold text-[11px] text-slate-800 truncate">{item.name}</span>
                    </div>

                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                      item.left === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.left} left
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate("stock")}
              className="w-full mt-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restock All</span>
            </button>
          </div>

        </div>

        {/* Sales Trend Chart Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <TrendingUp className="w-4 h-4 text-[#0066FF]" />
                <span>Sales Trend</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">₹ {currentM.sparkVal}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  {currentM.growth}
                </span>
              </div>
            </div>

            {/* Smooth SVG sparkline chart */}
            <div className="w-36 h-12">
              <svg viewBox="0 0 144 48" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 38 Q 24 35 40 28 T 80 18 T 115 12 T 144 8 L 144 48 L 0 48 Z"
                  fill="url(#chartGrad2)"
                />
                <path
                  d="M 0 38 Q 24 35 40 28 T 80 18 T 115 12 T 144 8"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="144" cy="8" r="3.5" fill="#0066FF" />
              </svg>
            </div>
          </div>
        </div>

      </main>

      {/* Date Filter Selection Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 select-none animate-in slide-in-from-bottom duration-200">
            <h4 className="text-sm font-black text-slate-900 mb-3">Select Time Filter</h4>
            <div className="space-y-1.5">
              {[
                { id: "today", label: "Today", desc: "Current day till now" },
                { id: "yesterday", label: "Yesterday", desc: "Previous day summary" },
                { id: "week", label: "This Week", desc: "Last 7 days" },
                { id: "month", label: "This Month", desc: "Current calendar month" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPeriod(p.id);
                    setShowPeriodModal(false);
                    toast.success(`Showing stats for ${p.label}`);
                  }}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedPeriod === p.id ? "bg-blue-50 text-[#0066FF] font-black" : "hover:bg-slate-50 text-slate-700 font-bold"
                  }`}
                >
                  <div>
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{p.desc}</div>
                  </div>
                  {selectedPeriod === p.id && <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 select-none animate-in slide-in-from-bottom duration-200">
            <h4 className="text-sm font-black text-slate-900">Restock {restockModalItem.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Current Stock: {restockModalItem.left} {restockModalItem.unit}</p>

            <div className="flex items-center gap-2 my-4">
              {[5, 10, 25, 50].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setRestockAmount(qty)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    restockAmount === qty ? "bg-[#0066FF] text-white shadow-md" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setRestockModalItem(null)}
                className="py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRestock}
                className="py-2.5 bg-[#0066FF] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Dock Navigation */}
      <MobileBottomNav
        activeTab="home"
        onTabChange={(tab) => {
          if (tab === "billing") onNavigate && onNavigate("new-bill");
          else if (tab === "products") onNavigate && onNavigate("products");
          else if (tab === "customers") onNavigate && onNavigate("customers");
          else if (tab === "more") setDrawerOpen(true);
        }}
      />

    </div>
  );
}
