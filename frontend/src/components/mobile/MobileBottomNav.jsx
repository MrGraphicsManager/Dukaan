import React from "react";
import { Home, Receipt, Package, Users, MoreHorizontal } from "lucide-react";

export default function MobileBottomNav({ activeTab = "home", onTabChange }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "billing", label: "Billing", icon: Receipt },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 py-2 px-3 flex items-center justify-around z-40 shadow-xs select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange && onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              isActive ? "text-[#0066FF]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
