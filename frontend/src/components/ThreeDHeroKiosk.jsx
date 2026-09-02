import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Receipt, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Package, 
  RotateCcw,
  Volume2,
  CreditCard,
  Banknote,
  Zap
} from "lucide-react";

export default function ThreeDHeroKiosk() {
  const containerRef = useRef(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 18, mass: 0.8 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const resetRotation = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Simulating live sales ticker
  const liveItems = [
    { name: "Aashirvaad Shudh Atta 5kg", qty: 1, price: 235 },
    { name: "Amul Butter 100g", qty: 2, price: 116 },
    { name: "Tata Salt 1kg", qty: 1, price: 28 },
    { name: "Parle-G Gold Biscuits", qty: 4, price: 40 },
  ];

  const billTotal = liveItems.reduce((acc, it) => acc + it.price, 0);

  return (
    <div 
      className="relative w-full max-w-xl mx-auto py-6"
      style={{ perspective: "1500px" }}
    >
      {/* 3D Scene Controls Badge */}
      <div className="flex items-center justify-between mb-4 px-2 text-xs font-semibold text-brand-indigo/60">
        <span className="flex items-center gap-1.5 bg-white/80 border border-brand-mitti px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-terracotta animate-pulse" />
          Interactive 3D Dukaan Counter
        </span>
        <button 
          onClick={resetRotation}
          className="flex items-center gap-1 hover:text-brand-terracotta transition-colors px-2 py-1 rounded-md hover:bg-white/50"
          title="Reset 3D view"
        >
          <RotateCcw className="w-3 h-3" /> Reset View
        </button>
      </div>

      {/* Main 3D Container with Mouse Tracking */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-[440px] preserve-3d cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          animate={{
            y: isHovered ? -6 : [0, -8, 0],
          }}
          transition={{
            y: {
              duration: 4,
              repeat: isHovered ? 0 : Infinity,
              ease: "easeInOut",
            },
          }}
          className="relative w-full h-full preserve-3d"
        >
          {/* =========================================================
              LAYER 1 (Deep base: Counter Desk Platform)
          ========================================================= */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white via-brand-sand to-[#EDE5D8] rounded-[2.5rem] border-2 border-brand-mitti shadow-3d-floating"
            style={{ transform: "translateZ(0px)" }}
          >
            {/* Ambient wood trim reflection */}
            <div className="absolute inset-x-4 top-2 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full opacity-75" />
            <div className="absolute inset-x-8 bottom-3 h-2 bg-brand-mitti/40 rounded-full blur-xs" />
          </div>

          {/* =========================================================
              LAYER 2 (POS Terminal Monitor - Elevated)
          ========================================================= */}
          <div
            className="relative z-10 m-5 p-6 bg-brand-indigo text-white rounded-3xl border border-brand-indigo/40 shadow-xl overflow-hidden preserve-3d"
            style={{ transform: "translateZ(45px)" }}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="font-display text-lg tracking-tight leading-none text-white">दुकान POS</div>
                  <div className="text-[10px] text-white/60 font-mono tracking-wider">COUNTER TERMINAL #01</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Bill
              </div>
            </div>

            {/* Live Cart Items Table */}
            <div className="my-4 space-y-2 font-mono text-xs">
              {liveItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="truncate max-w-[200px] text-white/90">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">x{item.qty}</span>
                    <span className="font-semibold text-white">₹{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Bill Total (4 items)</div>
                <div className="font-heading text-3xl font-extrabold text-white tracking-tight">₹{billTotal}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-brand-terracotta text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md">
                  <Banknote className="w-3.5 h-3.5" /> Cash
                </span>
                <span className="flex items-center gap-1 bg-white text-brand-indigo px-3 py-1.5 rounded-xl font-bold text-xs shadow-md">
                  <QrCode className="w-3.5 h-3.5 text-brand-terracotta" /> UPI
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              LAYER 3 (3D Emerging Thermal Bill Receipt)
          ========================================================= */}
          <motion.div
            style={{ 
              transform: "translateZ(85px) rotateZ(-3deg)",
            }}
            animate={{
              rotateZ: [-3, -1, -3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-8 left-6 w-64 bg-white text-brand-indigo p-4 rounded-xl border border-brand-mitti shadow-2xl preserve-3d"
          >
            {/* Receipt Zigzag Perforation Top */}
            <div className="absolute -top-2 left-0 right-0 h-2 bg-repeat-x bg-[radial-gradient(circle_at_bottom,transparent_4px,#fff_4px)] bg-[length:12px_8px]" />
            
            <div className="text-center pb-2 border-b border-dashed border-brand-mitti">
              <div className="font-display font-bold text-sm">दुकान · OFFICIAL RECEIPT</div>
              <div className="text-[9px] text-brand-indigo/60 font-mono">Invoice #INV-2026-8812</div>
            </div>

            <div className="py-2 space-y-1 text-[10px] font-mono border-b border-dashed border-brand-mitti">
              <div className="flex justify-between">
                <span>Atta 5kg</span>
                <span>₹235.00</span>
              </div>
              <div className="flex justify-between">
                <span>Amul Butter (x2)</span>
                <span>₹116.00</span>
              </div>
              <div className="flex justify-between font-bold text-brand-terracotta">
                <span>PAID VIA UPI</span>
                <span>₹419.00</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[9px] text-brand-indigo/60 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-brand-terracotta" />
              <span>Generated in 1.1s · Visit again!</span>
            </div>
          </motion.div>

          {/* =========================================================
              LAYER 4 (3D Floating UPI Soundbox & QR Standee)
          ========================================================= */}
          <motion.div
            style={{ 
              transform: "translateZ(110px) rotateY(-8deg)",
            }}
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-5 -right-3 w-56 bg-white rounded-2xl border-2 border-brand-mitti p-4 shadow-2xl preserve-3d"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-indigo">
                <QrCode className="w-4 h-4 text-brand-terracotta" />
                <span>BHARAT QR / UPI</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Fake QR Graphic */}
            <div className="bg-brand-sand p-3 rounded-xl border border-brand-mitti text-center">
              <div className="w-20 h-20 mx-auto bg-white rounded-lg border border-brand-mitti p-1 shadow-inner flex items-center justify-center">
                <QrCode className="w-16 h-16 text-brand-indigo" strokeWidth={1.5} />
              </div>
              <div className="mt-2 text-[10px] font-bold text-brand-indigo/80">
                Scan with any UPI App
              </div>
            </div>

            {/* Soundbox Speaker Alert */}
            <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              <span>"₹419 Received on Dukaan"</span>
            </div>
          </motion.div>

          {/* =========================================================
              LAYER 5 (Floating 3D Insight Chip: Top Left)
          ========================================================= */}
          <motion.div
            style={{ 
              transform: "translateZ(135px)",
            }}
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -top-7 -left-5 bg-white/95 backdrop-blur-md rounded-2xl border border-brand-mitti px-4 py-2.5 shadow-xl flex items-center gap-3 preserve-3d"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-brand-indigo/60 font-semibold uppercase tracking-wider">Today's Sales</div>
              <div className="font-heading font-extrabold text-brand-indigo text-base">₹18,450 <span className="text-[10px] text-emerald-600 font-bold">+24%</span></div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Subtext instruction */}
      <p className="text-center text-xs text-brand-indigo/50 mt-4 flex items-center justify-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
        <span>Hover & move your cursor over the terminal to experience 3D depth</span>
      </p>
    </div>
  );
}
