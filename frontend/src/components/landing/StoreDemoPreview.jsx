import React from "react";
import { 
  Check, 
  ArrowRight, 
  Store, 
  Receipt, 
  Package, 
  Users, 
  Settings, 
  Zap, 
  Lock, 
  Sparkles, 
  Volume2, 
  Printer 
} from "lucide-react";

export default function StoreDemoPreview() {
  return (
    <div id="store-demo" className="relative w-full max-w-2xl mx-auto py-6 px-2 sm:px-4">
      
      {/* Ambient background glow & decorative orbits */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="w-72 h-72 rounded-full border border-blue-200/50 absolute rotate-12 pointer-events-none hidden sm:block" />
        <div className="w-96 h-80 rounded-full border border-amber-200/50 absolute -rotate-12 pointer-events-none hidden sm:block" />
      </div>

      {/* Decorative floating sparkles */}
      <div className="absolute top-2 left-6 text-amber-500 text-lg font-bold select-none animate-pulse">✦</div>
      <div className="absolute bottom-6 right-4 text-blue-500 text-xl font-bold select-none animate-pulse">✦</div>

      {/* Main Dashboard Window Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-transform duration-300 hover:rotate-0 sm:-rotate-1">
        
        {/* Window Topbar */}
        <div className="h-9 sm:h-10 px-3 sm:px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 font-semibold">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>counter.officialdukaan.in</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 font-mono hidden xs:block">
            PEAN OS
          </div>
        </div>

        {/* Dashboard Body with Mini Sidebar & Content */}
        <div className="flex min-h-[300px] sm:min-h-[350px]">
          
          {/* Mini Sidebar */}
          <aside className="w-11 sm:w-13 bg-slate-50 border-r border-slate-200 p-2 sm:p-2.5 flex flex-col items-center justify-between shrink-0">
            <div className="space-y-3 flex flex-col items-center w-full">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                D
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5" />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
            
            {/* Header / Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  LIVE COUNTER · PEAN OS
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                  <span>Good morning, Sharma Store</span>
                  <span className="text-amber-500 text-xs">✦</span>
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Today's Shift ⌄
              </span>
            </div>

            {/* Metrics Row: 2 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              
              {/* Metric Card 1: Sales with SVG Curve */}
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                <div className="flex items-center justify-between text-[11px] font-semibold text-blue-100">
                  <span>Today's Sales</span>
                  <span>•••</span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-1">₹84,240</div>
                <div className="text-[10px] text-blue-100/90 font-medium mt-0.5">
                  <span className="font-bold text-emerald-300">↗ 18.4%</span> vs yesterday
                </div>

                {/* Sparkline Chart Graphic */}
                <div className="mt-2 h-8 w-full opacity-80">
                  <svg viewBox="0 0 300 70" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,50 Q40,40 80,45 T160,25 T240,20 T300,5 L300,70 L0,70 Z" 
                      fill="url(#chart-glow)" 
                    />
                    <path 
                      d="M0,50 Q40,40 80,45 T160,25 T240,20 T300,5" 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  </svg>
                </div>
              </div>

              {/* Metric Card 2: Orders & Speed */}
              <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Bills Generated</span>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Sub-2s Speed
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">324 bills</div>
                
                {/* Mini Bars */}
                <div className="flex items-end gap-1.5 h-6 mt-2">
                  <span className="w-2.5 h-3 bg-blue-200 rounded-xs" />
                  <span className="w-2.5 h-4 bg-blue-300 rounded-xs" />
                  <span className="w-2.5 h-5 bg-blue-400 rounded-xs" />
                  <span className="w-2.5 h-3 bg-blue-300 rounded-xs" />
                  <span className="w-2.5 h-6 bg-blue-600 rounded-xs" />
                  <span className="w-2.5 h-4 bg-blue-400 rounded-xs" />
                  <span className="w-2.5 h-5.5 bg-emerald-500 rounded-xs" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  <span className="font-bold text-blue-600">Avg. 1.2s</span> checkout speed
                </div>
              </div>

            </div>

            {/* Live Counter Bills Table */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                <span>Recent Counter Bills</span>
                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                  <span>Live Sync</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-900">Amul Butter 100g + Milk</span>
                      <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">#DKN-1042</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 font-mono">₹95</span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">UPI</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <span className="font-bold text-slate-900">Aashirvaad Atta 5kg</span>
                      <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">#DKN-1041</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 font-mono">₹320</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Cash</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <span className="font-bold text-slate-900">Tata Salt 1kg + Maggi</span>
                      <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">#DKN-1040</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 font-mono">₹42</span>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Khata</span>
                  </div>
                </div>
              </div>
            </div>

          </main>

        </div>

      </div>

      {/* FLOATING CARD 1: Instant UPI / Soundbox Toast (Top Left) */}
      <div className="absolute -top-1 -left-2 sm:-left-6 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center gap-2.5 text-slate-900 rotate-3 transition-transform hover:rotate-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Volume2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 block">
            SOUNDBOX VOICE ALERT
          </span>
          <span className="text-xs font-black text-slate-900 block leading-tight">
            ₹499 received via UPI
          </span>
          <span className="text-[9px] text-emerald-700 font-bold block">
            "दुकान: ₹499 प्राप्त हुए!"
          </span>
        </div>
      </div>

      {/* FLOATING CARD 2: Custom Thermal Receipt Pill (Bottom Right) */}
      <div className="absolute -bottom-2 -right-2 sm:-right-4 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center gap-2.5 text-slate-900 -rotate-2 transition-transform hover:rotate-0">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Printer className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 block">
            THERMAL ARCHITECT
          </span>
          <span className="text-xs font-black text-slate-900 block leading-tight">
            58mm & 80mm Custom Slip
          </span>
          <span className="text-[9px] text-blue-700 font-bold block">
            Logo + Dynamic QR Printed
          </span>
        </div>
      </div>

    </div>
  );
}
