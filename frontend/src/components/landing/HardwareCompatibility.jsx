import React from "react";
import { 
  Printer, 
  ScanLine, 
  Monitor, 
  Volume2, 
  ShieldCheck, 
  Check, 
  Zap,
  Usb
} from "lucide-react";

const HARDWARE_ITEMS = [
  {
    icon: Printer,
    title: "Thermal Printers",
    sub: "58mm & 80mm Roll Sizes",
    desc: "Works with TVS, Epson, Everycom, NGX, Posiflex, and any standard ESC/POS USB or Bluetooth receipt printer.",
    tag: "USB & Bluetooth"
  },
  {
    icon: ScanLine,
    title: "Barcode Scanners",
    sub: "1D & 2D Laser Scanners",
    desc: "Plug-and-play support for handheld laser guns and wireless Bluetooth scanners with instant catalog match.",
    tag: "Instant 0.2s Match"
  },
  {
    icon: Monitor,
    title: "Counter PC & Laptops",
    sub: "Desktop, Laptop & POS Terminals",
    desc: "Zero heavy software installations. Runs directly in Chrome or Edge on Windows 10, 11, Linux, or Mac.",
    tag: "Zero Setup Lag"
  },
  {
    icon: Volume2,
    title: "Soundbox Audio Alert",
    sub: "Built-in Voice Announcements",
    desc: "Announces UPI payments aloud through your counter speaker in Hindi, Gujarati, or English. No monthly device rental.",
    tag: "Zero Device Rental"
  }
];

export default function HardwareCompatibility() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-brand-mitti" id="hardware">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs mb-3">
          <Usb className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>Universal Plug & Play</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo">
          Works with Your Existing Hardware
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-indigo/70 font-medium">
          No need to buy locked ₹30,000 proprietary machines. Dukaan connects with the printer and computer you already have.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {HARDWARE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.title}
              className="p-6 rounded-3xl bg-white border-2 border-brand-mitti shadow-xs hover:border-brand-indigo/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-sand border border-brand-mitti flex items-center justify-center text-brand-terracotta shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-base text-brand-indigo">
                  {item.title}
                </h3>
                <div className="text-[11px] font-bold text-brand-terracotta mt-0.5 font-mono">
                  {item.sub}
                </div>

                <p className="text-xs text-brand-indigo/70 mt-2.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-brand-mitti/60 flex items-center gap-1.5 text-[11px] font-bold text-brand-indigo/70">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Tested & Certified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compatibility Assurance Banner */}
      <div className="mt-8 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-900 font-semibold max-w-3xl mx-auto text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Already have a TVS or Bluetooth printer? You can test thermal printing with 1 click right now!</span>
        </div>
        <a 
          href="#live-demo"
          className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition-colors shrink-0"
        >
          Test Printer Now
        </a>
      </div>

    </section>
  );
}
