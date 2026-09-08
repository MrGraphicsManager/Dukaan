import React from "react";
import { Link } from "react-router-dom";
import Card3D from "@/components/Card3D";

export default function DukaanProInstagramCards() {
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] mx-auto select-none">
      
      {/* Soft Ambient Radial Lighting */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-indigo-600/15 rounded-[44px] blur-3xl opacity-80 pointer-events-none" />
      
      <Card3D depth={14} glow={true} className="w-full">
        <div className="relative rounded-[32px] overflow-hidden border-2 border-white/90 shadow-[0_25px_60px_-15px_rgba(0,102,255,0.22)] bg-white group">
          
          {/* Authentic High-Res 3D Campaign Graphic */}
          <img 
            src="/images/dukaan-pro-campaign.png" 
            alt="Dukaan Pro Plan & Dukaan Pro Studio - Now Available"
            className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-[1.015]"
            loading="eager"
          />

          {/* Interactive Clickable Hotspots for the two cards in the poster */}
          <div className="absolute inset-0 z-20 pointer-events-auto flex flex-col justify-end">
            <div className="h-[45%] w-full grid grid-cols-2 gap-2 p-3 sm:p-4">
              {/* Left Card Hotspot -> Pro Plan Subscription */}
              <Link 
                to="/subscribe?plan=pro" 
                title="Upgrade to Dukaan Pro Plan (₹499/mo)"
                aria-label="Upgrade to Dukaan Pro Plan"
                className="h-full rounded-2xl focus:outline-none hover:bg-blue-600/5 active:scale-95 transition-all cursor-pointer"
              />

              {/* Right Card Hotspot -> Pro Studio Showcase */}
              <a 
                href="#dukaan-pro" 
                title="Explore Dukaan Pro Studio Customizer"
                aria-label="Explore Dukaan Pro Studio"
                className="h-full rounded-2xl focus:outline-none hover:bg-blue-600/5 active:scale-95 transition-all cursor-pointer"
              />
            </div>
            <div className="h-[14%] w-full" />
          </div>

        </div>
      </Card3D>

      {/* Subtle Hint Below Card */}
      <div className="mt-3 text-center text-[11px] font-medium text-slate-500">
        👆 Tap either card to explore <strong className="text-blue-600">Pro Plan</strong> or <strong className="text-blue-600">Pro Studio</strong>
      </div>

    </div>
  );
}
