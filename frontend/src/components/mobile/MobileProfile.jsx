import React from "react";
import { ArrowLeft, User, Phone, Mail, Store, MapPin, Shield, LogOut, ChevronRight, Crown } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileProfile({ onBack, onTabChange, onLogout, onUpgrade, merchantData }) {
  const name = merchantData?.fullName || "Priyen Naik";
  const businessName = merchantData?.businessName || "ABC General Store";
  const phone = merchantData?.phone || "+91 98765 43210";
  const address = merchantData?.address || "Navsari, Gujarat";

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
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Merchant Profile</h1>
            <p className="text-[11px] font-semibold text-slate-400">Account & Subscription</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Merchant Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center font-black text-2xl mx-auto mb-2 border-2 border-white shadow-md">
            {name.charAt(0)}
          </div>
          <h2 className="text-base font-extrabold text-slate-900">{name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{businessName}</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-700 text-xs font-bold mt-3">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Free Merchant Plan</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
              <span className="font-semibold text-slate-800">{phone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
              <span className="font-semibold text-slate-800">{address}</span>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div
          onClick={onUpgrade}
          className="p-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 active:scale-98 transition-all"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Crown className="w-4 h-4" />
              <span>Dukaan Pro</span>
            </div>
            <div className="text-sm font-black mt-0.5">Upgrade for WhatsApp Bills</div>
            <div className="text-[11px] text-blue-100">Starting at ₹ 79/mo</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>

        {/* Account Options */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs divide-y divide-slate-100">
          <div
            onClick={() => alert("Edit Profile")}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Edit Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => alert("Change Password")}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Security & Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={onLogout}
            className="p-3.5 flex items-center justify-between hover:bg-red-50 text-red-600 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Log Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </div>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
