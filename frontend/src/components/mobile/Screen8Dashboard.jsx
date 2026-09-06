import React, { useState } from "react";
import { 
  Menu, 
  Bell, 
  Plus, 
  ArrowRight, 
  Home, 
  Receipt, 
  Package, 
  Users, 
  MoreHorizontal,
  Store,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function Screen8Dashboard({ merchantData, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState("home");

  const name = merchantData?.fullName || "Priyen";
  const businessName = merchantData?.businessName || "ABC General Store";
  const initial = name.charAt(0).toUpperCase();

  const handleAction = (label) => {
    toast.info(`${label} clicked`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between max-w-md mx-auto select-none relative pb-16">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleAction("Menu")} 
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5">
            <img 
              src="/assets/mobile/dukaan_mobile_logo.png" 
              alt="Dukaan" 
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => handleAction("Notifications")}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#0066FF] absolute top-1.5 right-1.5" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initial}
          </div>
        </div>
      </header>

      {/* Dashboard Body Content */}
      <main className="p-4 space-y-4 flex-1">
        
        {/* Merchant Hero Greeting Card */}
        <div className="rounded-3xl p-5 bg-gradient-to-r from-[#0066FF] to-[#1E88E5] text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">
                Hello, {name} 👋
              </h2>
            </div>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              {businessName}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Growth</span>
            </div>
          </div>

          {/* Background shop icon decoration */}
          <Store className="w-28 h-28 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Today's Sales */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <span className="block text-xl font-black text-slate-900">
              ₹ 0
            </span>
            <span className="block text-xs font-semibold text-slate-500 mt-0.5">
              Today's Sales
            </span>
            <span className="block text-[11px] text-slate-400 mt-1 font-medium">
              0 orders
            </span>
          </div>

          {/* Card 2: Total Products */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="block text-xl font-black text-slate-900">
                0
              </span>
              <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                Total Products
              </span>
            </div>
            <button 
              onClick={() => handleAction("Add Product")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Card 3: Customers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="block text-xl font-black text-slate-900">
                0
              </span>
              <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                Customers
              </span>
            </div>
            <button 
              onClick={() => handleAction("Add Customer")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Card 4: Udhaar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="block text-xl font-black text-slate-900">
                ₹ 0
              </span>
              <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                Udhaar
              </span>
            </div>
            <button 
              onClick={() => handleAction("View Udhaar")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 hover:underline"
            >
              <span>View</span>
            </button>
          </div>

        </div>

        {/* Add First Product Banner */}
        <div 
          onClick={() => handleAction("Add First Product")}
          className="p-4 rounded-2xl bg-white border border-blue-100 shadow-xs flex items-center justify-between cursor-pointer hover:bg-blue-50/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                Add your first product
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Start selling in less than a minute
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
        </div>

      </main>

      {/* 5-Tab Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 py-2 px-3 flex items-center justify-around z-40">
        {[
          { id: "home", label: "Home", icon: Home },
          { id: "billing", label: "Billing", icon: Receipt },
          { id: "products", label: "Products", icon: Package },
          { id: "customers", label: "Customers", icon: Users },
          { id: "more", label: "More", icon: MoreHorizontal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (onNavigateTab) onNavigateTab(tab.id);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? "text-[#0066FF]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
