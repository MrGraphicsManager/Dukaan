import React, { useState, useRef } from "react";
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
  Cpu,
  RefreshCw,
  Layers,
  ChevronDown
} from "lucide-react";

const STAGES = [
  {
    id: 0,
    number: "01",
    tag: "Operator Console",
    headline: "The Modern Billing Counter. Reimagined.",
    desc: "A responsive 1080p touch billing console engineered for sub-2s transaction speeds. Tap items, select payments, and manage counter rush with zero lag.",
    badge: "Under 2s per bill",
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

  // Bind scroll progress across 420vh track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Buttery-smooth spring scrub physics (like Ather Rizta & Apple)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.0005
  });

  // 3D Rotations & Positions Scrubbing based on smoothProgress
  const rotateY = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [0, -32, 38, -12, 0]);
  const rotateX = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [8, 16, 12, 22, 10]);
  const scale = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [1, 1.12, 1.08, 0.98, 1.02]);
  const translateX = useTransform(smoothProgress, [0, 0.28, 0.58, 0.88, 1], [0, 40, -40, 0, 0]);

  // Stage-specific animated values
  // Stage 2: Thermal slip paper unrolling height
  const paperHeight = useTransform(smoothProgress, [0.22, 0.42], [0, 150]);
  const paperOpacity = useTransform(smoothProgress, [0.18, 0.24, 0.50, 0.55], [0, 1, 1, 0]);

  // Stage 3: Soundbox waves expansion
  const soundWaveScale = useTransform(smoothProgress, [0.50, 0.68], [0.8, 1.5]);
  const soundWaveOpacity = useTransform(smoothProgress, [0.48, 0.55, 0.72, 0.78], [0, 1, 1, 0]);

  // Stage 4: Barcode scanner laser beam
  const scannerLaserOpacity = useTransform(smoothProgress, [0.72, 0.82, 0.95, 1], [0, 1, 1, 0]);

  // Sync active stage on scroll change
  React.useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
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
  }, [scrollYProgress]);

  const activeStage = STAGES[currentStageIndex] || STAGES[0];

  // Helper to jump scroll position when clicking stage indicator
  const scrollToStage = (stageIdx) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const scrollPoints = [0.05, 0.35, 0.65, 0.92];
    const targetY = containerTop + containerHeight * scrollPoints[stageIdx];
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <div 
      ref={containerRef} 
      className="relative h-[420vh] bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-t border-brand-mitti select-none"
      id="3d-tour"
    >
      {/* Pinned Fullscreen Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden p-4 sm:p-8">
        
        {/* Top Floating HUD Bar */}
        <div className="relative z-30 max-w-6xl w-full mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-mitti shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-brand-indigo">
                3D Interactive Product Tour
              </span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Scroll to rotate & explore</span>
            </div>
          </div>

          {/* Interactive Scrub Step Dots */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md border border-brand-mitti rounded-full p-1.5 shadow-xs">
            {STAGES.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => scrollToStage(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currentStageIndex === idx 
                    ? "bg-brand-indigo text-white shadow-sm" 
                    : "text-brand-indigo/60 hover:text-brand-indigo hover:bg-brand-sand/60"
                }`}
              >
                <span className="font-mono text-[10px]">{s.number}</span>
                <span className="hidden md:inline">{s.tag}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Center Stage: 3D Product Stage & Dynamic Overlay */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
          
          {/* Left / Overlay: Stage Story Content */}
          <div className="w-full lg:w-5/12 text-left z-20 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-xs font-mono font-black text-brand-terracotta tracking-wider">
                  <span>STAGE {activeStage.number}</span>
                  <span>·</span>
                  <span>{activeStage.badge}</span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo leading-tight">
                  {activeStage.headline}
                </h2>

                <p className="text-sm sm:text-base text-brand-indigo/75 leading-relaxed font-medium">
                  {activeStage.desc}
                </p>

                {/* Hotspot spec helper */}
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-brand-terracotta">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click glowing pins on the 3D terminal to inspect components</span>
                </div>

                {/* Hotspot details card popup if clicked */}
                {activeHotspot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-white border-2 border-brand-terracotta shadow-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-black uppercase text-brand-terracotta">{activeHotspot.label}</div>
                      <div className="text-xs text-brand-indigo/80 mt-1 font-medium">{activeHotspot.spec}</div>
                    </div>
                    <button 
                      onClick={() => setActiveHotspot(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
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
            className="w-full lg:w-7/12 h-[380px] sm:h-[460px] flex items-center justify-center relative"
            style={{ perspective: "1600px" }}
          >
            {/* Ambient Soft Ground Radial Reflection */}
            <div className="absolute inset-x-8 bottom-4 h-24 bg-gradient-to-t from-brand-mitti/30 via-brand-terracotta/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Main 3D Rotating Model Assembly */}
            <motion.div
              style={{
                rotateY,
                rotateX,
                scale,
                translateX,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-[480px] h-[340px] preserve-3d cursor-grab active:cursor-grabbing"
            >
              
              {/* =========================================================
                  COMPONENT 1: SOLID OAK / BRUSHED COMPOSITE COUNTER DESK BASE
              ========================================================= */}
              <div 
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white via-[#F5EFE6] to-[#E8DCB8] border-2 border-brand-mitti shadow-2xl preserve-3d"
                style={{ transform: "translateZ(0px)" }}
              >
                {/* Metallic bezel perimeter */}
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
                className="absolute inset-x-5 top-5 bottom-6 bg-white rounded-3xl border-2 border-brand-mitti p-5 shadow-xl flex flex-col justify-between preserve-3d overflow-hidden"
                style={{ transform: "translateZ(50px)" }}
              >
                {/* Screen Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-brand-mitti">
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
                    <span className="font-bold text-brand-indigo">Aashirvaad Atta 5kg</span>
                    <span className="font-extrabold text-brand-terracotta">₹320.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-brand-sand/70 border border-brand-mitti/50">
                    <span className="font-bold text-brand-indigo">Amul Butter 100g (x2)</span>
                    <span className="font-extrabold text-brand-terracotta">₹130.00</span>
                  </div>
                </div>

                {/* Bill Bottom Bar */}
                <div className="pt-2 border-t border-brand-mitti flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-bold uppercase text-brand-indigo/50">Total Bill</div>
                    <div className="font-display font-black text-xl text-brand-indigo leading-none">₹450.00</div>
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
                  opacity: paperOpacity
                }}
                className="absolute -top-12 right-10 w-44 bg-[#FFFDF9] rounded-t-xl rounded-b-sm border-2 border-brand-indigo/30 p-3 shadow-2xl preserve-3d font-mono"
              >
                {/* Thermal slip jagged tear */}
                <div className="absolute -top-1 left-0 right-0 h-1.5 bg-repeat-x bg-[radial-gradient(circle_at_bottom,transparent_3px,#FAF8F5_3px)] bg-[length:8px_6px]" />
                
                <motion.div 
                  style={{ height: paperHeight }}
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
                className="absolute -top-8 -right-8 w-48 bg-white rounded-2xl border-2 border-brand-mitti p-3.5 shadow-2xl preserve-3d"
                style={{ transform: "translateZ(95px) rotateY(-18deg)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand-indigo">
                    <QrCode className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>BHARAT QR / UPI</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="w-16 h-16 mx-auto bg-brand-sand rounded-xl border border-brand-mitti p-1 flex items-center justify-center shadow-inner">
                  <QrCode className="w-14 h-14 text-brand-indigo" strokeWidth={1.5} />
                </div>

                {/* Animated Soundbox Wave Alert */}
                <motion.div 
                  style={{ 
                    scale: soundWaveScale,
                    opacity: soundWaveOpacity
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
                  opacity: scannerLaserOpacity,
                  transform: "translateZ(120px)"
                }}
                className="absolute -bottom-8 -left-6 w-44 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-brand-mitti p-3 shadow-xl pointer-events-none"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-indigo">
                  <ScanLine className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Laser Gun Active</span>
                </div>
                {/* Red Laser Scanning line */}
                <div className="h-0.5 w-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] my-2 animate-pulse" />
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
                    transform: "translateZ(110px)"
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-amber-400/40 animate-ping" />
                    <span className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-black text-white hover:scale-125 transition-transform">
                      +
                    </span>
                    {/* Tooltip on hover */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-brand-mitti px-2.5 py-1 rounded-xl text-[10px] font-bold text-brand-indigo shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {h.label}
                    </div>
                  </div>
                </div>
              ))}

            </motion.div>
          </div>

        </div>

        {/* Bottom HUD: Progress Bar & Scroll Prompt */}
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
          <div className="w-36 sm:w-64 h-2 rounded-full bg-brand-sand border border-brand-mitti overflow-hidden">
            <motion.div 
              style={{ scaleX: smoothProgress, transformOrigin: "left" }} 
              className="h-full bg-gradient-to-r from-brand-terracotta to-amber-500 rounded-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-indigo/60">
            <span>Scroll to continue tour</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-brand-terracotta" />
          </div>

        </div>

      </div>
    </div>
  );
}
