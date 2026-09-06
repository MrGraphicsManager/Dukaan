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
  Receipt
} from "lucide-react";
import MobileSideDrawer from "./MobileSideDrawer";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileDashboard({ onNavigate, merchantData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProBanner, setShowProBanner] = useState(true);

  const name = merchantData?.fullName || "Priyen";
  const businessName = merchantData?.businessName || "ABC General Store";
  const address = merchantData?.address || "Navsari, Gujarat";
  const initial = name.charAt(0).toUpperCase();

  const recentBills = [
    { id: "#B1028", method: "Cash", items: 2, amount: "₹ 240", time: "2 mins ago", type: "C" },
    { id: "#B1027", method: "UPI", items: 5, amount: "₹ 1,200", time: "12 mins ago", type: "U" },
    { id: "#B1026", method: "Cash", items: 1, amount: "₹ 680", time: "30 mins ago", type: "C" },
  ];

  const lowStock = [
    { name: "Coca Cola 500ml", left: "5 left", color: "text-rose-600 bg-rose-50", type: "C" },
    { name: "Tide Detergent", left: "8 left", color: "text-amber-600 bg-amber-50", type: "T" },
    { name: "Bread", left: "0 left", color: "text-rose-600 bg-rose-50 font-bold", type: "B" },
    { name: "Eggs (12)", left: "3 left", color: "text-rose-600 bg-rose-50", type: "E" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between max-w-md mx-auto select-none relative pb-20">
      
      {/* Side Drawer Component */}
      <MobileSideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={onNavigate}
        merchantData={merchantData}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img 
            src="/assets/mobile/dukaan_mobile_logo.png" 
            alt="Dukaan" 
            className="h-7 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onNavigate && onNavigate("notifications")}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </button>

          <button 
            onClick={() => onNavigate && onNavigate("profile")}
            className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
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
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {name} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                {businessName} <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-400" />
                {address}
              </span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Today</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* 3 Top Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          
          {/* Card 1: Total Sales */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <span className="font-extrabold text-sm">₹</span>
            </div>
            <span className="block text-[11px] font-semibold text-slate-500">Total Sales</span>
            <span className="block text-base font-extrabold text-slate-900 mt-0.5">₹ 12,450</span>
            <span className="block text-[10px] font-bold text-emerald-600 mt-1">↑ +12% <span className="font-medium text-slate-400">vs. yesterday</span></span>
          </div>

          {/* Card 2: Total Bills */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-2">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="block text-[11px] font-semibold text-slate-500">Total Bills</span>
            <span className="block text-base font-extrabold text-slate-900 mt-0.5">28</span>
            <span className="block text-[10px] font-bold text-emerald-600 mt-1">↑ +8% <span className="font-medium text-slate-400">vs. yesterday</span></span>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="block text-[11px] font-semibold text-slate-500">Customers</span>
            <span className="block text-base font-extrabold text-slate-900 mt-0.5">56</span>
            <span className="block text-[10px] font-bold text-emerald-600 mt-1">↑ +18% <span className="font-medium text-slate-400">vs. yesterday</span></span>
          </div>

        </div>

        {/* 4 Action Pills */}
        <div className="grid grid-cols-4 gap-2.5">
          <button 
            onClick={() => onNavigate && onNavigate("new-bill")}
            className="p-2.5 rounded-2xl bg-[#0066FF] text-white flex flex-col items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
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
          <div className="p-3.5 rounded-2xl bg-[#EDF4FF] border border-blue-200 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                  Grow your business with Dukaan Pro
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Get advanced reports, multiple users and more.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => onNavigate && onNavigate("upgrade")}
                className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Upgrade</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setShowProBanner(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Split Cards: Recent Bills & Low Stock */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Left: Recent Bills */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-xs text-slate-900">Recent Bills</h3>
                <button 
                  onClick={() => onNavigate && onNavigate("orders")}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {recentBills.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        b.type === "U" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {b.type}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-slate-900 leading-tight">{b.id}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{b.method} · {b.items} items</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[11px] text-slate-900 leading-tight">{b.amount}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{b.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Low Stock */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-xs text-slate-900">Low Stock</h3>
                <button 
                  onClick={() => onNavigate && onNavigate("stock")}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {lowStock.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                        {s.type}
                      </div>
                      <span className="text-[10px] font-medium text-slate-700 truncate">{s.name}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${s.color}`}>
                      {s.left}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sales Trend Sparkline Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Sales Trend</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-slate-900">₹ 12,450</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  ↑ 12%
                </span>
              </div>
            </div>

            {/* Smooth SVG sparkline chart */}
            <div className="w-36 h-12">
              <svg viewBox="0 0 144 48" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 38 Q 24 35 40 28 T 80 18 T 115 12 T 144 8 L 144 48 L 0 48 Z"
                  fill="url(#chartGrad)"
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
