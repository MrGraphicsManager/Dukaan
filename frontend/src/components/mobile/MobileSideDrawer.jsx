import React from "react";
import { 
  X, 
  Home, 
  Receipt, 
  Package, 
  Warehouse, 
  Users, 
  Wallet, 
  ClipboardList, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  Crown
} from "lucide-react";

export default function MobileSideDrawer({ isOpen, onClose, onNavigate, merchantData }) {
  if (!isOpen) return null;

  const name = merchantData?.fullName || "Priyen Naik";
  const businessName = merchantData?.businessName || "ABC General Store";
  const initial = name.charAt(0).toUpperCase();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, active: true },
    { id: "new-bill", label: "New Bill", icon: Receipt },
    { id: "products", label: "Products", icon: Package },
    { id: "stock", label: "Stock", icon: Warehouse },
    { id: "customers", label: "Customers", icon: Users },
    { id: "udhaar", label: "Udhaar", icon: Wallet },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "expenses", label: "Expenses", icon: CreditCard },
    { id: "divider" },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Support", icon: HelpCircle },
    { id: "whats-new", label: "What's New", icon: Sparkles, badge: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer content */}
      <div className="relative w-[300px] max-w-[85%] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200 z-10">
        
        {/* Top bar with logo and close */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <img 
            src="/assets/mobile/dukaan_mobile_logo.png" 
            alt="Dukaan" 
            className="h-7 w-auto object-contain"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Merchant profile summary card */}
        <div 
          onClick={() => { onNavigate && onNavigate("profile"); onClose(); }}
          className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#0066FF] text-white font-extrabold text-base flex items-center justify-center shadow-xs">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-slate-900 leading-tight">{name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <span>{businessName}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-extrabold text-amber-700">
                <Crown className="w-2.5 h-2.5 text-amber-600" />
                <span>Free Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            if (item.id === "divider") {
              return <div key={`div-${idx}`} className="my-2 border-t border-slate-100" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate && onNavigate(item.id);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors text-xs font-bold ${
                  item.active
                    ? "bg-[#EBF3FF] text-[#0066FF]"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom upgrade banner & footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div 
            onClick={() => { onNavigate && onNavigate("upgrade"); onClose(); }}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-xs">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-xs text-slate-900">Upgrade to Pro</div>
                <div className="text-[10px] text-slate-500 font-medium">Get more features</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
            <span>Version 1.0.0</span>
            <span>Made with <span className="text-red-500">❤️</span> in India</span>
          </div>
        </div>

      </div>
    </div>
  );
}
