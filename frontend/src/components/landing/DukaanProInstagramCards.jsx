import React from "react";
import { Link } from "react-router-dom";
import { Crown, Sliders, ArrowRight, Sparkles, Check, Lock, Clock, Volume2, Printer, QrCode } from "lucide-react";
import Card3D from "@/components/Card3D";

export default function DukaanProInstagramCards() {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-8 pb-4 select-none">
      
      {/* Soft Ambient Radial Lights */}
      <div className="absolute -top-10 -left-6 w-80 h-80 bg-blue-500/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-6 w-80 h-80 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Stage / Pedestal Platform */}
      <div className="relative rounded-[40px] sm:rounded-[48px] bg-gradient-to-b from-white via-blue-50/20 to-blue-100/30 p-5 sm:p-8 border-2 border-blue-100/80 shadow-[0_25px_60px_-15px_rgba(0,102,255,0.15)]">
        
        {/* Two Luxury Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 items-stretch">
          
          {/* ====================================================
              CARD 1: DUKAAN PRO PLAN (White Frosted Luxury Glass)
          ==================================================== */}
          <div className="flex flex-col h-full">
            <Card3D depth={16} glow={true} className="h-full">
              <div className="h-full rounded-[32px] bg-white border-2 border-blue-100/90 p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,102,255,0.08)] hover:shadow-[0_20px_50px_rgba(0,102,255,0.18)] hover:border-blue-300 transition-all flex flex-col justify-between items-center text-center relative overflow-hidden group">
                
                {/* Top Subtle Royal Blue Rim */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="w-full flex flex-col items-center">
                  
                  {/* Eyebrow Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-5">
                    <Crown className="w-3 h-3 text-blue-600" />
                    <span>Now Available</span>
                  </div>

                  {/* 3D Glossy Crown Icon Box */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-50 mb-5 group-hover:scale-105 transition-transform">
                    <Crown className="w-10 h-10 fill-white/25 text-white" />
                  </div>

                  {/* Brand & Title */}
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                    Dukaan
                  </span>
                  <h3 className="font-sans font-black text-2xl sm:text-3xl text-slate-950 tracking-tight leading-tight mt-0.5">
                    Pro Plan
                  </h3>

                  {/* Tagline */}
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-[210px]">
                    Everything you need to grow and protect your business.
                  </p>

                  {/* 3 Feature Pills */}
                  <div className="mt-5 w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Cashier PIN Security</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">Shift Handover (F9)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-semibold">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Virtual Soundbox Voice</span>
                    </div>
                  </div>

                </div>

                {/* Direct Action Explore Button */}
                <div className="mt-6 w-full pt-3 border-t border-slate-100">
                  <Link
                    to="/pro-plan"
                    className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Explore Pro Plan</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            </Card3D>
          </div>

          {/* ====================================================
              CARD 2: DUKAAN PRO STUDIO (Deep Royal Blue Gradient)
          ==================================================== */}
          <div className="flex flex-col h-full relative">
            
            {/* Handwritten "Only for Pro Plan" Callout with Hand-drawn Arrow */}
            <div className="absolute -top-7 right-2 sm:-right-4 z-30 flex items-center gap-1 pointer-events-none">
              <span className="font-['Caveat',cursive] text-xl font-bold text-blue-600 -rotate-6 whitespace-nowrap drop-shadow-xs">
                Only for Pro Plan
              </span>
              <svg className="w-6 h-6 text-blue-600 -rotate-12 translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4c4 8 12 10 14 12" />
                <path d="M14 16l4 0l-1-4" />
              </svg>
            </div>

            <Card3D depth={20} glow={true} className="h-full">
              <div className="h-full rounded-[32px] bg-gradient-to-b from-[#0062FF] via-[#004ADB] to-[#0A1D6B] border-2 border-blue-300/40 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,74,219,0.3)] hover:shadow-[0_25px_60px_rgba(0,74,219,0.45)] hover:border-blue-200 transition-all flex flex-col justify-between items-center text-center text-white relative overflow-hidden group">
                
                {/* Top Subtle Sheen */}
                <div className="absolute -top-10 inset-x-0 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="w-full flex flex-col items-center relative z-10">
                  
                  {/* Eyebrow Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-cyan-200 text-[10px] font-black uppercase tracking-wider mb-5 backdrop-blur-sm">
                    <Sliders className="w-3 h-3 text-cyan-200" />
                    <span>Creative Engine</span>
                  </div>

                  {/* 3D Glowing Studio Console Icon */}
                  <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-inner ring-4 ring-white/10 mb-5 group-hover:scale-105 transition-transform">
                    <div className="flex flex-col items-center">
                      <Crown className="w-5 h-5 text-amber-300 fill-amber-300/30 mb-0.5" />
                      <Sliders className="w-6 h-6 text-cyan-200" />
                    </div>
                  </div>

                  {/* Brand & Title */}
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/60">
                    Dukaan
                  </span>
                  <h3 className="font-sans font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-100 tracking-tight leading-tight mt-0.5 drop-shadow-xs">
                    Pro Studio
                  </h3>

                  {/* Tagline */}
                  <p className="mt-2 text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-[210px]">
                    Customize. Configure. Make it uniquely yours.
                  </p>

                  {/* 3 Feature Pills */}
                  <div className="mt-5 w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-50 font-semibold backdrop-blur-xs">
                      <Printer className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                      <span className="truncate">58mm & 80mm Custom Receipts</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-50 font-semibold backdrop-blur-xs">
                      <QrCode className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
                      <span className="truncate">Shop Logo & UPI QR on Bill</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-50 font-semibold backdrop-blur-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span className="truncate">Custom Store Colors & Labs</span>
                    </div>
                  </div>

                </div>

                {/* Direct Action Explore Button */}
                <div className="mt-6 w-full pt-3 border-t border-white/15 relative z-10">
                  <Link
                    to="/pro-studio"
                    className="w-full h-11 rounded-2xl bg-white text-blue-800 hover:bg-cyan-50 font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Explore Pro Studio</span>
                    <ArrowRight className="w-4 h-4 text-blue-700 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            </Card3D>
          </div>

        </div>

        {/* ====================================================
            STAGE BOTTOM ACCENTS (Exact Brand Identity)
        ==================================================== */}
        <div className="mt-7 pt-4 border-t border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          {/* "For Bigger Business" Handwritten Note */}
          <div className="flex items-center gap-2">
            <span className="font-['Caveat',cursive] text-2xl font-bold text-slate-800 -rotate-3 leading-none">
              For Bigger Business
            </span>
            <div className="w-8 h-0.5 bg-blue-500 rounded-full" />
          </div>

          {/* MANAGE • GROW • SIMPLIFY */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
            <span>Manage</span>
            <span className="text-blue-500 font-black">•</span>
            <span>Grow</span>
            <span className="text-blue-500 font-black">•</span>
            <span>Simplify</span>
          </div>

          {/* A PRODUCT BY PEAN Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-blue-900 text-[10px] font-mono font-black uppercase tracking-wider shadow-2xs">
            <span>A Product By</span>
            <span className="font-sans font-black text-xs text-blue-600">PEAN</span>
          </div>

        </div>

      </div>

    </div>
  );
}
