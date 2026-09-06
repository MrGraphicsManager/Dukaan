import React from "react";
import { X, QrCode, Share2, Copy, Check, Download, Store } from "lucide-react";
import { toast } from "sonner";

export default function MobileStoreQrModal({ isOpen, onClose, merchantData }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const storeName = merchantData?.businessName || "ABC General Store";
  const upiId = (storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "dukaan") + "@okaxis";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success("Store UPI ID copied!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6 text-center relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center absolute top-4 right-4 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Store Title */}
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] mx-auto mb-2 shadow-xs">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">{storeName}</h3>
        <p className="text-xs text-slate-400">Scan & Pay using any UPI App</p>

        {/* UPI QR Canvas simulation */}
        <div className="my-5 p-4 bg-white rounded-2xl border-2 border-slate-900 inline-block mx-auto shadow-md relative">
          <svg viewBox="0 0 160 160" className="w-48 h-48 mx-auto">
            {/* Corner Markers */}
            <rect x="10" y="10" width="40" height="40" rx="6" fill="#0A1B39" />
            <rect x="18" y="18" width="24" height="24" rx="4" fill="#FFFFFF" />
            <rect x="24" y="24" width="12" height="12" rx="2" fill="#0066FF" />

            <rect x="110" y="10" width="40" height="40" rx="6" fill="#0A1B39" />
            <rect x="118" y="18" width="24" height="24" rx="4" fill="#FFFFFF" />
            <rect x="124" y="24" width="12" height="12" rx="2" fill="#0066FF" />

            <rect x="10" y="110" width="40" height="40" rx="6" fill="#0A1B39" />
            <rect x="18" y="118" width="24" height="24" rx="4" fill="#FFFFFF" />
            <rect x="24" y="124" width="12" height="12" rx="2" fill="#0066FF" />

            {/* Pattern Dots */}
            <rect x="60" y="15" width="10" height="10" fill="#0A1B39" />
            <rect x="80" y="20" width="10" height="10" fill="#0A1B39" />
            <rect x="65" y="35" width="15" height="8" fill="#0A1B39" />
            <rect x="15" y="60" width="12" height="10" fill="#0A1B39" />
            <rect x="35" y="70" width="10" height="15" fill="#0A1B39" />
            <rect x="60" y="60" width="40" height="40" rx="8" fill="#0066FF" />
            {/* Center Dukaan Logo in QR */}
            <circle cx="80" cy="80" r="14" fill="#FFFFFF" />
            <text x="80" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0066FF">D</text>

            <rect x="115" y="65" width="15" height="10" fill="#0A1B39" />
            <rect x="135" y="80" width="12" height="10" fill="#0A1B39" />
            <rect x="60" y="115" width="15" height="12" fill="#0A1B39" />
            <rect x="85" y="130" width="10" height="15" fill="#0A1B39" />
            <rect x="110" y="115" width="20" height="10" fill="#0A1B39" />
            <rect x="135" y="135" width="12" height="12" fill="#0A1B39" />
          </svg>

          {/* Supported UPI apps banner */}
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
            <span>GPay</span> · <span>PhonePe</span> · <span>Paytm</span> · <span>BHIM</span>
          </div>
        </div>

        {/* UPI ID pill */}
        <div
          onClick={handleCopy}
          className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-bold text-slate-700 truncate">{upiId}</span>
          <button className="text-[#0066FF] text-xs font-bold flex items-center gap-1">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <button
          onClick={() => toast.success("Store QR Ready for Counter Display")}
          className="w-full mt-4 py-3 bg-[#0066FF] hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Keep on Billing Counter
        </button>
      </div>
    </div>
  );
}
