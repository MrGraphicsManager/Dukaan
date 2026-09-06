import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Camera, 
  Flashlight, 
  FlashlightOff, 
  Barcode, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Search,
  Plus
} from "lucide-react";
import { toast } from "sonner";

// Web Audio API Beep Generator for instant physical scanner sound
function playScannerBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1850, ctx.currentTime); // High-pitched POS laser beep
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.log("Scanner beep fallback:", e);
  }
}

// Popular Indian FMCG Quick-Scan Barcodes
const QUICK_FMCG_BARCODES = [
  { barcode: "8901030001234", name: "Parle-G Gold 250g", price: 30, category: "Snacks" },
  { barcode: "8901058852341", name: "Maggi 2-Min Noodles 70g", price: 14, category: "Snacks" },
  { barcode: "8901725181230", name: "Tata Salt 1kg", price: 28, category: "Grocery" },
  { barcode: "8901262010112", name: "Amul Butter 100g", price: 56, category: "Dairy" },
  { barcode: "8906001021456", name: "Fortune Sunlite Oil 1L", price: 165, category: "Grocery" },
  { barcode: "8901764012211", name: "Coca-Cola 750ml", price: 40, category: "Beverages" },
];

export default function MobileBarcodeScannerModal({ isOpen, onClose, onProductScanned, catalog = [] }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [lastScanned, setLastScanned] = useState(null);
  const isScanningRef = useRef(false);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser/device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCameraActive(true);
      }

      // Check for torch/flashlight capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      // Start BarcodeDetector loop if supported by browser (Chrome Android & iOS Safari 17+)
      if ("BarcodeDetector" in window) {
        startNativeDetector();
      }
    } catch (err) {
      console.warn("Camera init issue:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission was denied. You can still scan using preset barcodes or type manually below."
          : "Unable to access rear camera on this device. You can use preset barcodes or manual code below."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    isScanningRef.current = false;
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn("Failed to toggle flashlight:", e);
    }
  };

  // Continuous Native Barcode Detection loop
  const startNativeDetector = async () => {
    try {
      const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
      const detector = new window.BarcodeDetector({
        formats: supportedFormats.length > 0 ? supportedFormats : ["ean_13", "ean_8", "upc_a", "qr_code", "code_128"],
      });

      const scanInterval = setInterval(async () => {
        if (!videoRef.current || !streamRef.current || isScanningRef.current) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && rawValue !== lastScanned) {
              handleBarcodeDetected(rawValue);
            }
          }
        } catch (detectErr) {
          // Frame capture pass-through
        }
      }, 350);

      return () => clearInterval(scanInterval);
    } catch (e) {
      console.log("BarcodeDetector fallback:", e);
    }
  };

  const handleBarcodeDetected = (code) => {
    if (isScanningRef.current) return;
    isScanningRef.current = true;
    playScannerBeep();

    setLastScanned(code);

    // Look for matching product in store catalog or FMCG database
    const matched =
      catalog.find(
        (p) =>
          String(p.barcode) === String(code) ||
          String(p.id) === String(code) ||
          (p.name && p.name.toLowerCase().includes(code.toLowerCase()))
      ) ||
      QUICK_FMCG_BARCODES.find((f) => f.barcode === code);

    const productPayload = matched || {
      id: "scan_" + Date.now(),
      name: `Barcode Item #${code.slice(-6)}`,
      price: 50,
      stock: 10,
      unit: "pcs",
      barcode: code,
    };

    toast.success(`Scanned: ${productPayload.name} (₹${productPayload.price || productPayload.selling_price || 50})`);

    if (onProductScanned) {
      onProductScanned(productPayload);
    }

    setTimeout(() => {
      isScanningRef.current = false;
    }, 1200);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;
    handleBarcodeDetected(clean);
    setManualCode("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Top Controls Bar */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between text-white border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight">Camera Barcode Scanner</h2>
            <p className="text-[10px] font-semibold text-slate-300">Point phone camera at item barcode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                torchOn
                  ? "bg-amber-400 border-amber-300 text-slate-950"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Viewfinder Center Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        
        {/* Live Video Viewport */}
        <div className="relative w-full max-w-xs aspect-square rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black flex items-center justify-center">
          
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Camera loading or error placeholder */}
          {!cameraActive && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/90 text-slate-300">
              <Camera className="w-10 h-10 text-blue-400 mb-2 animate-pulse" />
              <p className="text-xs font-semibold leading-relaxed">
                {cameraError || "Initializing camera viewfinder..."}
              </p>
              {cameraError && (
                <button
                  onClick={startCamera}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Camera</span>
                </button>
              )}
            </div>
          )}

          {/* High-Tech Reticle & Laser Scanning Beam */}
          <div className="absolute inset-4 pointer-events-none">
            {/* 4 Corner Markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-[#0066FF] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-[#0066FF] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-[#0066FF] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-[#0066FF] rounded-br-lg" />

            {/* Glowing Laser Beam */}
            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse relative top-1/2 -translate-y-1/2" />
          </div>

          {/* Subtitle indicator */}
          <div className="absolute bottom-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white/90 border border-white/15">
            Auto-Detecting Barcodes
          </div>
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="w-full max-w-xs mt-4 flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter barcode number..."
              className="w-full bg-white/10 border border-white/20 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-slate-400 outline-none focus:border-[#0066FF] focus:bg-white/15 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Add
          </button>
        </form>

      </main>

      {/* Bottom Tray: 1-Tap FMCG Preset Barcodes for Fast Store Testing */}
      <footer className="p-4 bg-slate-900/90 border-t border-white/10 z-20 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Tap FMCG Barcode Presets:</span>
          </span>
          <span className="text-[10px] text-slate-500">Tap to simulate real barcode</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {QUICK_FMCG_BARCODES.map((item) => (
            <button
              key={item.barcode}
              onClick={() => handleBarcodeDetected(item.barcode)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left cursor-pointer active:scale-95 transition-all group"
            >
              <div className="text-[11px] font-bold text-white truncate group-hover:text-blue-300">
                {item.name}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>₹{item.price}</span>
                <span className="font-mono text-[9px] text-slate-500">{item.barcode.slice(-4)}</span>
              </div>
            </button>
          ))}
        </div>
      </footer>

    </div>
  );
}
