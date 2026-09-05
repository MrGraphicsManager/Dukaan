import React from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

export default function DownloadHub3D() {
  const apkDownloadUrl = "https://expo.dev/artifacts/eas/YBpEitoVMPh1OOaw30VAiPAEeurd-UWL8Q311eUJ20s.apk";
  const exeDownloadUrl = "https://github.com/MrGraphicsManager/Dukaan/actions";

  return (
    <section id="download" className="relative z-20 py-24 px-6 max-w-6xl mx-auto bg-[#07090e]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Download className="w-3.5 h-3.5" /> Native Binaries
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Download Standalone Apps. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            100% Offline Device Software.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          No browser required. Launch straight into billing with on-device SQLite storage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        
        {/* 1. Android Native APK (.apk) Card */}
        <div className="rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/30 shadow-[0_15px_60px_-15px_rgba(16,185,129,0.15)] flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Offline SQLite
              </span>
            </div>

            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
              Android Standalone App
            </div>
            <h3 className="text-2xl font-bold font-display text-white tracking-tight">
              Android App (.apk)
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
              Direct mobile APK with native camera barcode scanning, offline SQLite database, and 1-tap WhatsApp billing intent.
            </p>

            <div className="mt-6 space-y-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>60+ FMCG grocery products pre-loaded</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Camera optical barcode scanner (EAN-13, QR)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Runs in Airplane Mode with 0 bytes internet</span>
              </div>
            </div>

            {/* Live QR Code Box */}
            <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-slate-800 flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl">
                {/* SVG QR Code representation */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(apkDownloadUrl)}`}
                  alt="Scan APK QR"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Scan with Phone
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Point your mobile camera at this QR code to download directly onto your phone.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <a
              href={apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Android APK (Direct)</span>
            </a>
            <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
              Android 8.0+ · Signed Release Binary
            </div>
          </div>
        </div>

        {/* 2. Windows Desktop PC (.exe) Card */}
        <div className="rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-blue-500/30 shadow-[0_15px_60px_-15px_rgba(59,130,246,0.15)] flex flex-col justify-between hover:border-blue-500/60 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Laptop className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Fullscreen Kiosk
              </span>
            </div>

            <div className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold mb-1">
              Desktop Counter Software
            </div>
            <h3 className="text-2xl font-bold font-display text-white tracking-tight">
              Windows PC (.exe)
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
              Heavy-duty counter billing software for Windows 10 & 11 with keyboard shortcuts (F1-F6), USB barcode gun, and ESC/POS thermal printing.
            </p>

            <div className="mt-6 space-y-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>F11 Fullscreen kiosk lock (No desktop distractions)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Single-file installer + Portable executable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Automatic USB cash drawer kick trigger</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Windows 64-bit Architecture</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Compatible with Windows 10 / 11</div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                v1.2.0
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <a
              href={exeDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Windows Software (.exe)</span>
            </a>
            <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
              Windows 10 / 11 64-bit · Installer & Portable
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
