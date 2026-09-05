import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Cpu, 
  Barcode, 
  Printer, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock
} from "lucide-react";

function BentoCard3D({ title, subtitle, icon: Icon, badge, children, highlightColor = "from-cyan-500/20 to-blue-500/10", className = "" }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className={`perspective-[1000px] ${className}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative h-full rounded-3xl p-7 bg-gradient-to-br from-slate-900/90 via-slate-950 to-black border border-slate-800 hover:border-slate-700 transition-colors shadow-2xl flex flex-col justify-between overflow-hidden group`}
      >
        {/* Ambient Specular Highlight */}
        <div className={`absolute -inset-px bg-gradient-to-br ${highlightColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10`} />

        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6" />
            </div>
            {badge && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {badge}
              </span>
            )}
          </div>

          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
            {subtitle}
          </div>
          <h3 className="text-2xl font-bold font-display text-white tracking-tight">
            {title}
          </h3>

          <div className="mt-4">
            {children}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Apple-grade Precision
          </span>
          <span className="text-cyan-400 font-bold">Explore Specs →</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function HardwareBento3D() {
  return (
    <section className="relative z-20 py-24 px-6 max-w-6xl mx-auto bg-[#07090e]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Hardware Architecture
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Pro Performance. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
            For Every Counter.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400">
          Crafted to withstand the non-stop rush hours of Indian Kirana and retail stores.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* 1. SQLite Silicon Core (Span 7) */}
        <BentoCard3D
          title="On-Device SQLite Engine"
          subtitle="Embedded Storage"
          icon={Cpu}
          badge="0ms Latency"
          highlightColor="from-cyan-500/25 to-blue-600/10"
          className="md:col-span-7"
        >
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            No internet required. The complete product catalog, stock counts, customer directory, and udhaar balances are stored in a native C-SQLite database directly on your device.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-xl font-black text-cyan-400 font-mono">&lt;1ms</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Query Time</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-xl font-black text-emerald-400 font-mono">100%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Offline Ready</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-xl font-black text-white font-mono">0 KB</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Data Wasted</div>
            </div>
          </div>
        </BentoCard3D>

        {/* 2. Optical Barcode Scanner (Span 5) */}
        <BentoCard3D
          title="Optical Barcode Engine"
          subtitle="Hardware Vision"
          icon={Barcode}
          badge="60 FPS Capture"
          highlightColor="from-red-500/20 to-orange-500/10"
          className="md:col-span-5"
        >
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Turn your phone or tablet camera into an industrial barcode scanner. Decodes crinkled chips packets, faded labels, and low-contrast codes instantly.
          </p>
          <div className="mt-6 p-3 rounded-2xl bg-red-950/30 border border-red-800/30 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="text-xs font-mono text-red-300 font-semibold">
              Real-time EAN-13, QR & Code-128 Vision
            </div>
          </div>
        </BentoCard3D>

        {/* 3. Zero-Ink Thermal Printing (Span 5) */}
        <BentoCard3D
          title="Thermal Receipt Spooler"
          subtitle="Printer Integration"
          icon={Printer}
          badge="ESC/POS Ready"
          highlightColor="from-emerald-500/20 to-teal-500/10"
          className="md:col-span-5"
        >
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Direct printing to any USB, Bluetooth, or WiFi thermal receipt printer. Instant paper cut, zero ink costs, and compact 58mm / 80mm formats.
          </p>
          <div className="mt-6 space-y-2 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Auto-cut & Drawer Kick pulse signal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Store UPI QR printed on bottom of every bill</span>
            </div>
          </div>
        </BentoCard3D>

        {/* 4. Windows PC + Android APK Kiosk (Span 7) */}
        <BentoCard3D
          title="Multi-Platform Standalone Kiosk"
          subtitle="Windows & Android"
          icon={Smartphone}
          badge="Native Binaries"
          highlightColor="from-blue-500/25 to-indigo-600/10"
          className="md:col-span-7"
        >
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Run on a heavy-duty counter desktop PC with keyboard shortcuts (F1-F6) or in your pocket with the standalone Android APK on your phone.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-sm font-bold text-white">Windows PC (.exe)</div>
              <div className="text-xs text-slate-400 mt-1">F11 Kiosk lock, USB barcode guns & thermal printers</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-sm font-bold text-white">Android Mobile (.apk)</div>
              <div className="text-xs text-slate-400 mt-1">Camera scanner, SQLite on phone, 1-tap WhatsApp</div>
            </div>
          </div>
        </BentoCard3D>

      </div>
    </section>
  );
}
