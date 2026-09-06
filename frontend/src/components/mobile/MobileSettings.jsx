import React, { useState } from "react";
import { ArrowLeft, Store, Receipt, Bell, Shield, Globe, HelpCircle, LogOut, ChevronRight, Moon, Volume2 } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileSettings({ onBack, onTabChange, onLogout, merchantData }) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Settings</h1>
            <p className="text-[11px] font-semibold text-slate-400">Preferences & Store Config</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Store Profile Section */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Store Profile
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-[#0066FF]" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Business Details</div>
                  <div className="text-[11px] text-slate-400">{merchantData?.businessName || "ABC General Store"}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-[#0066FF]" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Invoice & GST Settings</div>
                  <div className="text-[11px] text-slate-400">Prefix #B1000, 18% GST</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            App Preferences
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">Push Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#0066FF]"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">Sound on Bill Create</span>
              </div>
              <input
                type="checkbox"
                checked={sounds}
                onChange={(e) => setSounds(e.target.checked)}
                className="w-4 h-4 accent-[#0066FF]"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">App Language</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#0066FF] font-bold">
                <span>English</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full p-3.5 bg-red-50 hover:bg-red-100 active:scale-98 rounded-2xl border border-red-200/80 text-red-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of dukaan</span>
        </button>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
