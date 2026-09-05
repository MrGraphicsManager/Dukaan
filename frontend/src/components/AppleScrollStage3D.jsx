import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Receipt, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Barcode, 
  Smartphone, 
  ShieldCheck,
  Printer,
  ChevronDown
} from "lucide-react";

function ChapterPillItem({ chap, smoothProgress }) {
  const scaleY = useTransform(smoothProgress, chap.range, [0, 1]);

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-[10px] font-mono font-bold text-white/40 tracking-wider">
        {chap.id}
      </span>
      <div className="w-1.5 h-6 rounded-full bg-white/10 overflow-hidden relative">
        <motion.div
          className="w-full bg-gradient-to-b from-cyan-400 to-emerald-400 absolute top-0 left-0 bottom-0"
          style={{
            scaleY,
            transformOrigin: "top",
          }}
        />
      </div>
      <span className="text-xs font-semibold text-white/60 tracking-tight transition-colors group-hover:text-white">
        {chap.label}
      </span>
    </div>
  );
}

export default function AppleScrollStage3D() {
  const containerRef = useRef(null);

  // Bind scroll progress across this 480vh section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.6,
  });

  // 3D Terminal Transformations across 5 chapters
  const rotateX = useTransform(smoothProgress, [0, 0.22, 0.45, 0.72, 1], [14, -8, 12, 4, 18]);
  const rotateY = useTransform(smoothProgress, [0, 0.22, 0.45, 0.72, 1], [-22, 18, -10, 16, 0]);
  const rotateZ = useTransform(smoothProgress, [0, 0.22, 0.45, 0.72, 1], [0, -3, 2, -1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.22, 0.45, 0.72, 1], [0.92, 1.05, 1.02, 1.04, 0.98]);
  const translateY = useTransform(smoothProgress, [0, 0.22, 0.45, 0.72, 1], [20, -10, 0, -5, 15]);

  // Opacities & visibility for each chapter text
  const ch1Opacity = useTransform(smoothProgress, [0, 0.16, 0.24], [1, 1, 0]);
  const ch2Opacity = useTransform(smoothProgress, [0.18, 0.25, 0.38, 0.44], [0, 1, 1, 0]);
  const ch3Opacity = useTransform(smoothProgress, [0.40, 0.48, 0.62, 0.68], [0, 1, 1, 0]);
  const ch4Opacity = useTransform(smoothProgress, [0.65, 0.72, 0.84, 0.89], [0, 1, 1, 0]);
  const ch5Opacity = useTransform(smoothProgress, [0.86, 0.93, 1], [0, 1, 1]);

  // Barcode Laser & Carton Animations (Chapter 2)
  const laserY = useTransform(smoothProgress, [0.20, 0.38], [-40, 80]);
  const barcodeBoxScale = useTransform(smoothProgress, [0.18, 0.26, 0.38, 0.44], [0.4, 1, 1, 0.4]);
  const barcodeBoxOpacity = useTransform(smoothProgress, [0.18, 0.24, 0.38, 0.44], [0, 1, 1, 0]);

  // Thermal Receipt Rollout (Chapter 3)
  const receiptHeight = useTransform(smoothProgress, [0.44, 0.58], [0, 240]);
  const receiptOpacity = useTransform(smoothProgress, [0.42, 0.47, 0.64, 0.68], [0, 1, 1, 0]);

  // WhatsApp Bubble Flight (Chapter 4)
  const waBubbleX = useTransform(smoothProgress, [0.67, 0.76], [-60, 0]);
  const waBubbleOpacity = useTransform(smoothProgress, [0.65, 0.72, 0.85, 0.89], [0, 1, 1, 0]);

  // Holographic 3D Chart Bars (Chapter 5)
  const chartHeight1 = useTransform(smoothProgress, [0.87, 0.97], [10, 120]);
  const chartHeight2 = useTransform(smoothProgress, [0.89, 0.98], [10, 160]);
  const chartHeight3 = useTransform(smoothProgress, [0.91, 1.0], [10, 95]);

  const CHAPTERS = [
    { id: "01", label: "Retail OS Core", range: [0, 0.22] },
    { id: "02", label: "Optical Barcode", range: [0.22, 0.44] },
    { id: "03", label: "Instant Counter", range: [0.44, 0.66] },
    { id: "04", label: "Udhaar Ledger", range: [0.66, 0.88] },
    { id: "05", label: "Z-Report Hisab", range: [0.88, 1.0] },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-[480vh] bg-[#07090e] text-white">
      {/* Pinned 3D Viewport Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Ambient Studio Lighting Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-10 w-[500px] h-[400px] bg-gradient-to-t from-emerald-600/10 to-transparent blur-3xl rounded-full" />
          <div className="absolute top-1/3 left-10 w-[450px] h-[400px] bg-gradient-to-r from-orange-600/10 to-transparent blur-3xl rounded-full" />
        </div>

        {/* Apple-Style Chapter Progress Navigator (Left Pill) */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-3">
          {CHAPTERS.map((chap) => (
            <ChapterPillItem key={chap.id} chap={chap} smoothProgress={smoothProgress} />
          ))}
        </div>

        {/* Main Content Layout: Text Column + 3D Device Centerpiece */}
        <div className="relative z-20 mx-auto max-w-6xl w-full px-6 grid lg:grid-cols-12 gap-8 items-center h-full">
          
          {/* Left / Active Chapter Storyboard */}
          <div className="lg:col-span-5 relative h-72 flex items-center">
            
            {/* Chapter 1: Hardware Core */}
            <motion.div style={{ opacity: ch1Opacity }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Sparkles className="w-3.5 h-3.5" /> 100% Offline Device Silicon
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Engineered for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
                  Raw Speed.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-md font-normal">
                No browser lag. Embedded C-SQLite database resides directly on your PC and Android device. Instant counter billing in Airplane Mode.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 0ms Cloud Latency</span>
                <span>•</span>
                <span>Sub-1ms SQLite Queries</span>
              </div>
            </motion.div>

            {/* Chapter 2: Barcode Scanner */}
            <motion.div style={{ opacity: ch2Opacity }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Barcode className="w-3.5 h-3.5" /> Optical Barcode Engine
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Point. Scan. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">
                  Instantly Billed.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-md font-normal">
                Camera viewfinder reads EAN-13, QR, and code-128 barcodes even on torn or crinkled snack packets with auto-cart entry.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-bold">60+ Master FMCG Items Pre-loaded</span>
              </div>
            </motion.div>

            {/* Chapter 3: Instant Counter & Thermal Receipt */}
            <motion.div style={{ opacity: ch3Opacity }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Receipt className="w-3.5 h-3.5" /> Counter Mode
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                1.2 Seconds <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                  Per Customer.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-md font-normal">
                Cash tendered change calculation, dynamic UPI QR codes, and instant thermal printing. Never keep customers waiting.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5"><Printer className="w-4 h-4 text-emerald-400" /> 58mm / 80mm Zero-Ink Printing</span>
              </div>
            </motion.div>

            {/* Chapter 4: Udhaar Ledger & WhatsApp */}
            <motion.div style={{ opacity: ch4Opacity }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Smartphone className="w-3.5 h-3.5" /> 1-Tap WhatsApp Khata
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Recover Udhaar <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                  Without Awkwardness.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-md font-normal">
                Polite automated Hindi and Gujarati reminders sent straight through native WhatsApp intent with FIFO balance settlements.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="text-green-400 font-bold">92% On-Time Khata Recovery</span>
              </div>
            </motion.div>

            {/* Chapter 5: Z-Report Hisab */}
            <motion.div style={{ opacity: ch5Opacity }} className="absolute inset-0 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <TrendingUp className="w-3.5 h-3.5" /> Day-End Z-Report
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Exact Hisab. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">
                  Every Single Rupee.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-md font-normal">
                Cash in drawer, UPI received, pending Udhaar, and top-selling grocery items calculated in sub-second local SQL aggregates.
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="text-purple-300 font-bold">1-Click WhatsApp Day-Summary to Owner</span>
              </div>
            </motion.div>

          </div>

          {/* Right: 3D Animated Retail Terminal Showcase */}
          <div className="lg:col-span-7 flex items-center justify-center relative perspective-[1400px]">
            
            {/* The 3D Chassis */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                rotateZ,
                scale,
                y: translateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-[340px] sm:w-[460px] md:w-[500px] h-[360px] sm:h-[420px] rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-black p-4 sm:p-5 border-2 border-slate-700/60 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(56,189,248,0.15)] backdrop-blur-xl"
            >
              {/* Metallic Chamfered Specular Bezel */}
              <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

              {/* Top Hardware Bezel: Camera Lens & Receipt Slot */}
              <div className="flex items-center justify-between px-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                    DUKAAN KIOSK POS
                  </span>
                </div>
                
                {/* Physical Receipt Feed Slot */}
                <div className="w-28 h-2 bg-black rounded-full border border-slate-700 relative overflow-visible">
                  {/* Sliding 3D Thermal Receipt (Emanating from slot in Ch 3) */}
                  <motion.div
                    style={{
                      height: receiptHeight,
                      opacity: receiptOpacity,
                      transformOrigin: "top",
                    }}
                    className="absolute top-2 left-2 right-2 bg-white text-slate-900 rounded-b-lg shadow-2xl p-2.5 overflow-hidden font-mono text-[9px] border border-slate-300 z-40"
                  >
                    <div className="text-center font-bold text-[10px] pb-1 border-b border-dashed border-slate-400">
                      *** DUKAAN RETAIL ***
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-300">
                      <span>Atta 5kg x 1</span>
                      <span className="font-bold">₹245</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-300">
                      <span>Maggi 70g x 3</span>
                      <span className="font-bold">₹42</span>
                    </div>
                    <div className="flex justify-between pt-1.5 font-bold text-emerald-700">
                      <span>TOTAL:</span>
                      <span>₹287.00</span>
                    </div>
                    <div className="text-center text-[7px] text-slate-500 mt-2">
                      100% Offline SQLite
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-emerald-400">OFFLINE</span>
                </div>
              </div>

              {/* Dynamic Screen Viewport */}
              <div className="relative mt-3 h-[270px] sm:h-[320px] rounded-2xl bg-slate-950/90 border border-white/5 p-4 overflow-hidden">
                
                {/* Background Grid Lines */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* --- CHAPTER 2 OVERLAY: BARCODE SCANNER BOX & LASER --- */}
                <motion.div
                  style={{ scale: barcodeBoxScale, opacity: barcodeBoxOpacity }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none p-4"
                >
                  <div className="relative w-48 h-32 rounded-xl border-2 border-red-500/70 bg-black/80 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Barcode className="w-28 h-28 text-white/90" />
                    
                    {/* Animated Red Laser Scanline */}
                    <motion.div
                      style={{ y: laserY }}
                      className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444]"
                    />
                    <div className="absolute -top-3 bg-red-500 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Optical Reticle
                    </div>
                  </div>
                  <div className="mt-3 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Maggi 70g · ₹14 Added
                  </div>
                </motion.div>

                {/* --- CHAPTER 4 OVERLAY: 3D WHATSAPP UDHAAR CHAT BUBBLE --- */}
                <motion.div
                  style={{ x: waBubbleX, opacity: waBubbleOpacity }}
                  className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4"
                >
                  <div className="w-full max-w-xs bg-[#0b141a] rounded-2xl p-3.5 border border-[#202c33] shadow-2xl">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#202c33]">
                      <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs">
                        RP
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Ramesh Patel (Udhaar)</div>
                        <div className="text-[9px] text-slate-400">Balance: ₹1,450 Pending</div>
                      </div>
                    </div>
                    <div className="mt-2.5 bg-[#005c4b] text-white p-2.5 rounded-xl rounded-tl-none text-[11px] leading-relaxed shadow-sm">
                      Namaste Ramesh Bhai, aapka Dukaan par total <strong>₹1,450</strong> ka hisab baaki hai. Kripya samay par settlement karein. Dhanyawaad!
                      <div className="text-right text-[8px] text-emerald-200 mt-1">Sent via 1-Tap Intent ✓✓</div>
                    </div>
                  </div>
                </motion.div>

                {/* --- CHAPTER 5 OVERLAY: 3D HOLOGRAPHIC BARS --- */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-around gap-4 z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      style={{ height: chartHeight1 }}
                      className="w-12 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-lg shadow-emerald-500/20"
                    />
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">Cash ₹18k</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      style={{ height: chartHeight2 }}
                      className="w-12 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg shadow-lg shadow-cyan-500/20"
                    />
                    <span className="text-[9px] font-mono text-cyan-400 font-bold">UPI ₹6.4k</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      style={{ height: chartHeight3 }}
                      className="w-12 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg shadow-lg shadow-amber-500/20"
                    />
                    <span className="text-[9px] font-mono text-amber-400 font-bold">Udhaar ₹4k</span>
                  </div>
                </div>

                {/* Base POS Register Layout */}
                <div className="flex flex-col justify-between h-full">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">Active Cart</div>
                      <div className="text-sm font-bold text-white mt-0.5">3 Items Loaded</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                      <div className="text-[9px] text-emerald-400 uppercase font-semibold">Total Payable</div>
                      <div className="text-base font-black text-emerald-400 mt-0.5">₹287.00</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Aashirvaad Atta 5kg</span>
                      <span className="font-bold">₹245</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-300 py-1 border-b border-slate-800/80">
                      <span>Maggi 2-Min 70g (x3)</span>
                      <span className="font-bold">₹42</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold">F1 New</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">F3 Udhaar</span>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg">
                      Tender Cash [Enter]
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom 3D Floating Shadow */}
              <div className="absolute -bottom-8 left-10 right-10 h-6 bg-cyan-500/20 blur-xl rounded-full -z-10" />
            </motion.div>

          </div>

        </div>

        {/* Scroll down indicator */}
        <motion.div 
          style={{ opacity: ch1Opacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 text-xs font-semibold z-30"
        >
          <span>Scroll to explore the 3D Hardware</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>

      </div>
    </div>
  );
}
