import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  AnimatePresence 
} from "framer-motion";
import { 
  Sparkles, 
  Receipt, 
  QrCode, 
  Volume2, 
  ScanLine, 
  CheckCircle2, 
  Printer, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  {
    id: 0,
    number: "01",
    tag: "Operator Console",
    headline: "The Modern Billing Counter. Reimagined.",
    desc: "A responsive 1080p touch billing console engineered for sub-2s transaction speeds. Tap items, select payments, and manage counter rush with zero lag.",
    badge: "Under 2s per bill",
    rotY: 0,
    rotX: 8,
    scale: 1,
    hotspots: [
      { id: "screen", label: "Ultra-Responsive Touchscreen", spec: "10-point multi-touch, anti-glare, grease-resistant coating", x: "48%", y: "38%" },
      { id: "shortcut", label: "F1-F6 Rapid Keys", spec: "Zero-mouse counter mode with keyboard triggers", x: "28%", y: "78%" },
    ]
  },
  {
    id: 1,
    number: "02",
    tag: "Thermal Mechanics",
    headline: "Built-in High-Speed Thermal Receipt Engine.",
    desc: "Silent Japanese thermal printing head with precision auto-cutter. Prints 58mm and 80mm receipts in 1.1 seconds with zero ribbon or ink cost.",
    badge: "220mm/s Print Speed",
    rotY: -34,
    rotX: 16,
    scale: 1.12,
    hotspots: [
      { id: "cutter", label: "Guillotine Auto-Cutter", spec: "Rated for 1.5M clean cuts without paper jams", x: "68%", y: "42%" },
      { id: "paper", label: "Instant Drop-In Paper Roll", spec: "Accepts standard 58mm & 80mm thermal rolls", x: "74%", y: "26%" }
    ]
  },
  {
    id: 2,
    number: "03",
    tag: "Customer Display & Audio",
    headline: "Dual-Faced BharatQR & Integrated Soundbox.",
    desc: "Turn counter friction into instant trust. Dynamic UPI QR display faces the customer while a built-in voice speaker announces payments aloud in Hindi, Gujarati, or English.",
    badge: "Zero Speaker Rental",
    rotY: 38,
    rotX: 12,
    scale: 1.08,
    hotspots: [
      { id: "qr", label: "Dynamic BharatQR Standee", spec: "Zero customer amount entry errors with auto-matching", x: "78%", y: "34%" },
      { id: "speaker", label: "Multilingual Soundbox", spec: "Loud & clear 4W amplifier, instant payment audio alert", x: "82%", y: "68%" }
    ]
  },
  {
    id: 3,
    number: "04",
    tag: "Unified Hardware Ecosystem",
    headline: "Laser Scanner, Cash Drawer & Edge Cloud Sync.",
    desc: "Plug in your existing handheld laser gun, automated cash drawer, and barcode scales. Works 100% offline with automatic cloud synchronization when online.",
    badge: "100% Offline-First",
    rotY: -10,
    rotX: 20,
    scale: 0.98,
    hotspots: [
      { id: "scanner", label: "Omnidirectional Barcode Gun", spec: "Reads damaged or wrinkled FMCG barcodes in 0.2s", x: "20%", y: "52%" },
      { id: "cloud", label: "Local-First Edge Database", spec: "Transactions save instantly to disk even if Wi-Fi cuts out", x: "50%", y: "85%" }
    ]
  }
];

export default function AtherStyle3DScrollShowcase() {
  const containerRef = useRef(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [manualStageIndex, setManualStageIndex] = useState(null);

  // Scroll track progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Spring velocity physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    restDelta: 0.0005
  });

  // 3D Rotations & Positions Scrubbing based on smoothProgress
  const scrollRotateY = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [0, -34, 38, -10, 0]);
  const scrollRotateX = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [8, 16, 12, 20, 8]);
  const scrollScale = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [1, 1.12, 1.08, 0.98, 1.02]);
  const scrollTranslateX = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [0, 30, -30, 0, 0]);

  // Stage-specific animated values
  const paperHeight = useTransform(smoothProgress, [0.20, 0.44], [0, 140]);
  const paperOpacity = useTransform(smoothProgress, [0.18, 0.24, 0.48, 0.54], [0, 1, 1, 0]);
  const soundWaveScale = useTransform(smoothProgress, [0.50, 0.68], [0.8, 1.45]);
  const soundWaveOpacity = useTransform(smoothProgress, [0.48, 0.54, 0.72, 0.78], [0, 1, 1, 0]);
  const scannerLaserOpacity = useTransform(smoothProgress, [0.72, 0.82, 0.96, 1], [0, 1, 1, 0]);

  // Track active stage on scroll
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Clear manual override when user actively scrolls
      if (manualStageIndex !== null) {
        setManualStageIndex(null);
      }

      if (latest < 0.25) {
        setCurrentStageIndex(0);
      } else if (latest < 0.52) {
        setCurrentStageIndex(1);
      } else if (latest < 0.78) {
        setCurrentStageIndex(2);
      } else {
        setCurrentStageIndex(3);
      }
    });
  }, [scrollYProgress, manualStageIndex]);

  const activeIdx = manualStageIndex !== null ? manualStageIndex : currentStageIndex;
  const activeStage = STAGES[activeIdx] || STAGES[0];

  // Jump to stage with accurate pixel calculation
  const handleSelectStage = (stageIdx) => {
    setManualStageIndex(stageIdx);
    setActiveHotspot(null);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const containerTop = rect.top + scrollTop;
      const scrollableDistance = containerRef.current.offsetHeight - window.innerHeight;
      const scrollPoints = [0.02, 0.35, 0.65, 0.92];
      const targetY = containerTop + Math.max(0, scrollableDistance * scrollPoints[stageIdx]);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const handleNextStage = () => {
    const next = (activeIdx + 1) % STAGES.length;
    handleSelectStage(next);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative h-[280vh] bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-brand-mitti select-none"
      id="3d-tour"
      style={{ position: "relative" }}
    >
      {/* Pinned Sticky Viewport (Top at 72px under navbar, height calc to never clip) */}
      <div 
        className="w-full flex flex-col justify-between overflow-hidden px-4 sm:px-8 py-3 sm:py-5 z-20"
        style={{
          position: "sticky",
          top: "72px",
          height: "calc(100vh - 72px)",
          maxHeight: "920px",
        }}
      >
        
        {/* Top Floating HUD Bar */}
        <div className="relative z-30 max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-mitti shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-brand-indigo">
                3D Interactive Product Tour
              </span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Scroll down or click tabs to explore 3D angles</span>
            </div>
          </div>

          {/* Interactive Scrub Step Dots (Direct Clickable & Animated) */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white/95 backdrop-blur-md border border-brand-mitti rounded-full p-1.5 shadow-xs">
            {STAGES.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => handleSelectStage(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  activeIdx === idx 
                    ? "bg-brand-indigo text-white shadow-sm" 
                    : "text-brand-indigo/60 hover:text-brand-indigo hover:bg-brand-sand/60"
                }`}
              >
                <span className="font-mono text-[10px]">{s.number}</span>
                <span className="hidden sm:inline">{s.tag}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Center Stage: 3D Product Stage & Dynamic Story Overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 py-1 sm:py-3">
          
          {/* Left / Overlay: Stage Story Content */}
          <div className="w-full lg:w-5/12 text-left z-20 pointer-events-auto order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-xs font-mono font-black text-brand-terracotta tracking-wider">
                  <span>STAGE {activeStage.number}</span>
                  <span>·</span>
                  <span>{activeStage.badge}</span>
                </div>

                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-indigo leading-tight">
                  {activeStage.headline}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-brand-indigo/75 leading-relaxed font-medium">
                  {activeStage.desc}
                </p>

                {/* Quick Next Angle Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleNextStage}
                    className="px-4 py-2 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Next 3D Angle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-brand-indigo/50 font-medium">
                    Or scroll page down
                  </span>
                </div>

                {/* Hotspot details card popup if clicked */}
                {activeHotspot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-white border-2 border-brand-terracotta shadow-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-black uppercase text-brand-terracotta">{activeHotspot.label}</div>
                      <div className="text-xs text-brand-indigo/80 mt-0.5 font-medium">{activeHotspot.spec}</div>
                    </div>
                    <button 
                      onClick={() => setActiveHotspot(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right / Center: Photorealistic 3D PBR Hardware Terminal Canvas */}
          <div 
            className="w-full lg:w-7/12 h-[300px] sm:h-[400px] flex items-center justify-center relative order-1 lg:order-2"
            style={{ perspective: "1500px" }}
          >
            {/* Ambient Soft Ground Radial Reflection */}
            <div className="absolute inset-x-8 bottom-4 h-24 bg-gradient-to-t from-brand-mitti/35 via-brand-terracotta/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Main 3D Rotating Model Assembly */}
            <motion.div
              style={{
                rotateY: manualStageIndex !== null ? activeStage.rotY : scrollRotateY,
                rotateX: manualStageIndex !== null ? activeStage.rotX : scrollRotateX,
                scale: manualStageIndex !== null ? activeStage.scale : scrollScale,
                translateX: manualStageIndex !== null ? 0 : scrollTranslateX,
                transformStyle: "preserve-3d",
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[440px] sm:max-w-[480px] h-[280px] sm:h-[330px] preserve-3d select-none"
            >
              
              {/* =========================================================
                  COMPONENT 1: SOLID COUNTER DESK BASE
              ========================================================= */}
              <div 
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white via-[#F5EFE6] to-[#E8DCB8] border-2 border-brand-mitti shadow-2xl preserve-3d"
                style={{ transform: "translateZ(0px)" }}
              >
                <div className="absolute inset-x-6 top-3 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                <div className="absolute inset-x-8 bottom-3 h-2 bg-brand-mitti/60 rounded-full blur-xs" />
                <div className="absolute top-4 left-6 text-[9px] font-mono font-extrabold text-brand-indigo/40 tracking-widest">
                  DUKAAN PRO HYBRID KIOSK · CHASSIS V3
                </div>
              </div>

              {/* =========================================================
                  COMPONENT 2: POS TOUCH TERMINAL SCREEN (ELEVATED 3D LAYER)
              ========================================================= */}
              <div
                className="absolute inset-x-4 sm:inset-x-5 top-5 bottom-6 bg-white rounded-3xl border-2 border-brand-mitti p-4 sm:p-5 shadow-xl flex flex-col justify-between preserve-3d overflow-hidden"
                style={{ transform: "translateZ(45px)" }}
              >
                {/* Screen Header Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-brand-mitti">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <div className="font-display font-black text-sm tracking-tight text-brand-indigo">Dukaan POS v3</div>
                      <div className="text-[9px] font-mono text-brand-indigo/50">COUNTER 01 · READY</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-0.5 rounded-full">
                    ⚡ 1.2s Fast Mode
                  </span>
                </div>

                {/* Simulated Live Cart Tiles */}
                <div className="space-y-1.5 my-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-brand-sand/70 border border-brand-mitti/50">
                    <span className="font-bold text-brand-indigo truncate max-w-[160px]">Aashirvaad Atta 5kg</span>
                    <span className="font-extrabold text-brand-terracotta">₹320.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-brand-sand/70 border border-brand-mitti/50">
                    <span className="font-bold text-brand-indigo truncate max-w-[160px]">Amul Butter 100g (x2)</span>
                    <span className="font-extrabold text-brand-terracotta">₹130.00</span>
                  </div>
                </div>

                {/* Bill Bottom Bar */}
                <div className="pt-2 border-t border-brand-mitti flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase text-brand-indigo/50">Total Bill</div>
                    <div className="font-display font-black text-lg sm:text-xl text-brand-indigo leading-none">₹450.00</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                      F10 Pay & Bill
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  COMPONENT 3: 3D PRINTER SLOT & CURLING THERMAL PAPER (STAGE 2)
              ========================================================= */}
              <motion.div
                style={{ 
                  transform: "translateZ(85px) rotateX(-10deg)",
                  opacity: manualStageIndex === 1 ? 1 : paperOpacity
                }}
                className="absolute -top-10 right-8 w-40 sm:w-44 bg-[#FFFDF9] rounded-t-xl rounded-b-sm border-2 border-brand-indigo/30 p-3 shadow-2xl preserve-3d font-mono z-30"
              >
                <div className="absolute -top-1 left-0 right-0 h-1.5 bg-repeat-x bg-[radial-gradient(circle_at_bottom,transparent_3px,#FAF8F5_3px)] bg-[length:8px_6px]" />
                
                <motion.div 
                  style={{ height: manualStageIndex === 1 ? 130 : paperHeight }}
                  className="overflow-hidden space-y-1 text-[9px] text-slate-800"
                >
                  <div className="text-center font-bold text-brand-indigo border-b border-dashed border-slate-300 pb-1">
                    APNI DUKAAN KIRANA
                  </div>
                  <div className="flex justify-between"><span>Atta 5kg</span><span>₹320</span></div>
                  <div className="flex justify-between"><span>Butter x2</span><span>₹130</span></div>
                  <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-1 text-slate-900">
                    <span>NET:</span><span className="text-brand-terracotta">₹450</span>
                  </div>
                  <div className="text-[8px] text-center text-emerald-700 font-bold bg-emerald-50 py-0.5 rounded">
                    ✓ Paid via UPI (1.1s)
                  </div>
                </motion.div>
              </motion.div>

              {/* =========================================================
                  COMPONENT 4: 3D CUSTOMER BHARATQR & SOUNDBOX WAVES (STAGE 3)
              ========================================================= */}
              <div 
                className="absolute -top-8 -right-6 w-44 sm:w-48 bg-white rounded-2xl border-2 border-brand-mitti p-3.5 shadow-2xl preserve-3d z-30"
                style={{ transform: "translateZ(95px) rotateY(-18deg)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-indigo">
                    <QrCode className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>BHARAT QR / UPI</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-brand-sand rounded-xl border border-brand-mitti p-1 flex items-center justify-center shadow-inner">
                  <QrCode className="w-12 h-12 sm:w-14 sm:h-14 text-brand-indigo" strokeWidth={1.5} />
                </div>

                {/* Animated Soundbox Wave Alert */}
                <motion.div 
                  style={{ 
                    scale: manualStageIndex === 2 ? 1.1 : soundWaveScale,
                    opacity: manualStageIndex === 2 ? 1 : soundWaveOpacity
                  }}
                  className="mt-2 p-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  <Volume2 className="w-3 h-3 text-emerald-600 animate-bounce" />
                  <span>"₹450 Received on Dukaan"</span>
                </motion.div>
              </div>

              {/* =========================================================
                  COMPONENT 5: LASER SCANNER BEAM (STAGE 4)
              ========================================================= */}
              <motion.div
                style={{
                  opacity: manualStageIndex === 3 ? 1 : scannerLaserOpacity,
                  transform: "translateZ(110px)"
                }}
                className="absolute -bottom-6 -left-4 w-40 sm:w-44 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-brand-mitti p-3 shadow-xl pointer-events-none z-30"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-indigo">
                  <ScanLine className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Laser Gun Active</span>
                </div>
                <div className="h-0.5 w-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] my-1.5 animate-pulse" />
                <div className="text-[10px] font-mono text-brand-indigo/60">0.2s FMCG Barcode Match</div>
              </motion.div>

              {/* =========================================================
                  INTERACTIVE 3D HOTSPOT PINS
              ========================================================= */}
              {activeStage.hotspots.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setActiveHotspot(h)}
                  className="absolute cursor-pointer z-40 group preserve-3d"
                  style={{ 
                    left: h.x, 
                    top: h.y,
                    transform: "translateZ(115px)"
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-amber-400/40 animate-ping" />
                    <span className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-black text-white hover:scale-125 transition-transform">
                      +
                    </span>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-brand-mitti px-2.5 py-1 rounded-xl text-[10px] font-bold text-brand-indigo shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {h.label}
                    </div>
                  </div>
                </div>
              ))}

            </motion.div>
          </div>

        </div>

        {/* Bottom HUD: Scrub Progress Bar & Next Prompt */}
        <div className="relative z-30 max-w-6xl w-full mx-auto flex items-center justify-between pt-2 border-t border-brand-mitti/70 text-xs font-bold text-brand-indigo/60">
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-brand-terracotta font-extrabold text-sm">
              {activeStage.number} / 04
            </span>
            <span className="hidden sm:inline text-brand-indigo/70 font-medium">
              {activeStage.tag}
            </span>
          </div>

          {/* Scrub Progress Bar */}
          <div className="w-32 sm:w-64 h-2 rounded-full bg-brand-sand border border-brand-mitti overflow-hidden">
            <motion.div 
              style={{ scaleX: smoothProgress, transformOrigin: "left" }} 
              className="h-full bg-gradient-to-r from-brand-terracotta to-amber-500 rounded-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-indigo/60">
            <span className="hidden xs:inline">Scroll to continue</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-brand-terracotta" />
          </div>

        </div>

      </div>
    </div>
  );
}
