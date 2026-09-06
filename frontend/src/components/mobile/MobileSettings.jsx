import React, { useState } from "react";
import { ArrowLeft, Store, Receipt, Bell, Shield, Globe, HelpCircle, LogOut, ChevronRight, Volume2, QrCode, Printer } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import MobileStoreQrModal from "./MobileStoreQrModal";

export default function MobileSettings({ onBack, onTabChange, onLogout, merchantData }) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [printerSize, setPrinterSize] = useState("2inch");
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      
      {/* Store QR Modal */}
      <MobileStoreQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        merchantData={merchantData}
      />

      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">Settings & Hardware</h1>
            <p className="text-[11px] font-semibold text-slate-400">Terminal Configuration & Store QR</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Counter QR Card */}
        <div
          onClick={() => setShowQrModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-black">Counter UPI QR Code</div>
              <div className="text-[11px] text-blue-100">Display QR on phone for customers</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>

        {/* Store Profile Section */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Store Profile & Tax
          </div>
          <div className="divide-y divide-slate-100">
            <div 
              onClick={() => toast.info("Shop: " + (merchantData?.businessName || "ABC General Store"))}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Store className="w-4 h-4 text-[#0066FF]" />
                <div>
                  <div className="text-xs font-black text-slate-800">Business Details</div>
                  <div className="text-[11px] text-slate-400">{merchantData?.businessName || "ABC General Store"}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            <div 
              onClick={() => toast.info("Prefix: #B1000 · 5% GST enabled")}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-[#0066FF]" />
                <div>
                  <div className="text-xs font-black text-slate-800">Invoice Prefix & GST</div>
                  <div className="text-[11px] text-slate-400">Prefix #B1000 · 5% GST Active</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Thermal Printer Settings */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs overflow-hidden p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-[#0066FF]" />
              <span className="text-xs font-black text-slate-800">Thermal Printer Paper Size</span>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Bluetooth ESC/POS</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { setPrinterSize("2inch"); toast.success("Set to 2-inch (58mm) Roll"); }}
              className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                printerSize === "2inch" ? "bg-blue-50 text-[#0066FF] border-blue-300" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              2" Roll (58mm)
            </button>
            <button
              onClick={() => { setPrinterSize("3inch"); toast.success("Set to 3-inch (80mm) Roll"); }}
              className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                printerSize === "3inch" ? "bg-blue-50 text-[#0066FF] border-blue-300" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              3" Roll (80mm)
            </button>
          </div>
        </div>

        {/* Sound & Notifications */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Audio & Soundbox
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-black text-slate-800">Soundbox Voice Announcement</div>
                  <div className="text-[10px] text-slate-400">Speaks amount on bill creation</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sounds}
                onChange={(e) => setSounds(e.target.checked)}
                className="w-4 h-4 accent-[#0066FF]"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-black text-slate-800">Push Notifications</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#0066FF]"
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full p-3.5 bg-red-50 hover:bg-red-100 active:scale-98 rounded-2xl border border-red-200/80 text-red-600 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of dukaan</span>
        </button>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
