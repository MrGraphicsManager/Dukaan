import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sliders, ArrowRight, Sparkles, Store, Shield } from "lucide-react";
import Card3D from "@/components/Card3D";

export default function DukaanProInstagramCards() {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-6 pb-2 select-none">
      
      {/* Soft Ambient Light Glows */}
      <div className="absolute -top-12 -left-8 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Floating 3D Elements matching the Instagram poster */}
      {/* 1. Bottom-Left Mini Store Awning Canopy */}
      <motion.div 
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -left-8 sm:-left-12 z-20 hidden xs:block pointer-events-none"
      >
        <div className="w-16 h-12 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-xl rounded-b-md shadow-xl border border-blue-300 flex overflow-hidden -rotate-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? "bg-blue-600" : "bg-white"}`} />
          ))}
        </div>
      </motion.div>

      {/* 2. Bottom-Right Glossy Blue Crown */}
      <motion.div 
        animate={{ y: [0, 6, 0], rotate: [12, 16, 12] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 -right-6 sm:-right-8 z-20 hidden xs:block pointer-events-none"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center shadow-xl border-2 border-white/60">
          <Crown className="w-8 h-8 fill-white/20 text-white" />
        </div>
      </motion.div>

      {/* Main 3D Elevated Stage / Podium */}
      <div className="relative rounded-[36px] sm:rounded-[44px] bg-gradient-to-b from-white via-blue-50/30 to-blue-100/40 p-4 sm:p-7 border-2 border-blue-100/80 shadow-[0_25px_60px_-15px_rgba(0,102,255,0.18)]">
        
        {/* The Two Hero Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10 items-stretch">
          
          {/* ====================================================
              CARD 1: DUKAAN PRO PLAN (Clean White / Frosted Glass)
          ==================================================== */}
          <Link 
            to="/subscribe?plan=pro" 
            className="group block focus:outline-none"
          >
            <Card3D depth={18} glow={true} className="h-full">
              <div className="h-full rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-blue-100 p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,102,255,0.08)] group-hover:shadow-[0_20px_45px_rgba(0,102,255,0.18)] group-hover:border-blue-300 transition-all flex flex-col justify-between items-center text-center relative overflow-hidden">
                
                {/* Subtle top sheen */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />
                
                <div className="w-full flex flex-col items-center">
                  {/* Glossy 3D Crown Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-blue-50 via-sky-50 to-blue-100/80 border border-blue-200/80 flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                    <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-md">
                      <Crown className="w-7 h-7 fill-white/20 text-white" />
                    </div>
                  </div>

                  {/* Brand & Title */}
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Dukaan
                  </div>
                  <h3 className="font-display text-2xl sm:text-[1.75rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900 tracking-tight leading-tight mt-0.5">
                    Pro Plan
                  </h3>
                  
                  {/* Status Pill */}
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Now Available
                  </div>

                  {/* Divider */}
                  <div className="w-10 h-0.5 bg-blue-200/60 my-3.5 rounded-full" />

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-[200px]">
                    Everything you need to grow your business.
                  </p>
                </div>

                {/* Circular Action Button */}
                <div className="mt-6 pt-2">
                  <div className="w-11 h-11 rounded-full bg-blue-100/80 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            </Card3D>
          </Link>


          {/* ====================================================
              CARD 2: DUKAAN PRO STUDIO (Deep Royal Blue Gradient)
          ==================================================== */}
          <div className="relative">
            
            {/* Handwritten "Only for Pro Plan" Callout with Curly Arrow */}
            <div className="absolute -top-7 right-2 sm:-right-4 z-30 flex items-center gap-1 pointer-events-none">
              <span className="font-['Caveat',cursive] text-lg sm:text-xl font-bold text-blue-600 -rotate-6 whitespace-nowrap drop-shadow-xs">
                Only for Pro Plan
              </span>
              <svg className="w-6 h-6 text-blue-600 -rotate-12 translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4c4 8 12 10 14 12" />
                <path d="M14 16l4 0l-1-4" />
              </svg>
            </div>

            <a 
              href="#dukaan-pro" 
              className="group block focus:outline-none h-full"
            >
              <Card3D depth={22} glow={true} className="h-full">
                <div className="h-full rounded-3xl bg-gradient-to-b from-[#0066FF] via-[#0052E0] to-[#0A1F6E] border-2 border-blue-300/40 p-6 sm:p-7 shadow-[0_20px_45px_rgba(0,82,224,0.3)] group-hover:shadow-[0_25px_55px_rgba(0,82,224,0.45)] group-hover:border-blue-200 transition-all flex flex-col justify-between items-center text-center text-white relative overflow-hidden">
                  
                  {/* Subtle Top Glow Sheen */}
                  <div className="absolute -top-12 inset-x-0 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="w-full flex flex-col items-center relative z-10">
                    {/* Glowing Studio Console Icon with Crown */}
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner mb-4 group-hover:scale-105 transition-transform">
                      <div className="relative flex flex-col items-center justify-center">
                        <Crown className="w-6 h-6 text-amber-300 fill-amber-300/30 mb-0.5" />
                        <Sliders className="w-6 h-6 text-cyan-200" />
                      </div>
                    </div>

                    {/* Brand & Title with Glowing Cyan/Purple Gradient */}
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/70">
                      Dukaan
                    </div>
                    <h3 className="font-display text-2xl sm:text-[1.75rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-200 tracking-tight leading-tight mt-0.5 drop-shadow-sm">
                      Pro Studio
                    </h3>

                    {/* Status Pill */}
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-cyan-200 uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                      Now Available
                    </div>

                    {/* Divider */}
                    <div className="w-10 h-0.5 bg-white/25 my-3.5 rounded-full" />

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm text-blue-50 font-medium leading-relaxed max-w-[200px]">
                      Customize. Configure. Make it yours.
                    </p>
                  </div>

                  {/* Circular Action Button */}
                  <div className="mt-6 pt-2 relative z-10">
                    <div className="w-11 h-11 rounded-full bg-white text-blue-700 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </div>
              </Card3D>
            </a>
          </div>

        </div>

        {/* ====================================================
            BOTTOM ACCENTS FROM INSTAGRAM POSTER
        ==================================================== */}
        <div className="mt-6 pt-4 border-t border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          {/* "For Bigger Business" Handwritten Note */}
          <div className="flex items-center gap-2">
            <span className="font-['Caveat',cursive] text-2xl font-bold text-slate-800 -rotate-3 leading-none">
              For Bigger Business
            </span>
            <div className="w-10 h-0.5 bg-blue-500 rounded-full" />
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
            <span className="font-display font-black text-xs text-blue-600">PEAN</span>
          </div>

        </div>

      </div>

    </div>
  );
}
