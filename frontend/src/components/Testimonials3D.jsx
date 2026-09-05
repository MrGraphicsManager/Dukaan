import React from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Quote, Store } from "lucide-react";

export default function Testimonials3D() {
  const reviews = [
    {
      name: "Ramesh Patel",
      store: "Patel Kirana & Super Stores",
      city: "Ahmedabad, Gujarat",
      quote: "Pehle udhaar ka hisab likhne me roz 1 ghanta lagta tha. Ab Dukaan se 1 second me WhatsApp reminder chala jata hai aur grahak time par chukta kar dete hain.",
      metric: "₹45,000 Udhaar Recovered",
      stars: 5,
    },
    {
      name: "Sunil Gupta",
      store: "Gupta Provision Mart",
      city: "Karol Bagh, Delhi",
      quote: "Camera scanner itna fast hai ki Maggi ya Atta ke packet par camera rakhte hi bill me add ho jata hai. Sham ke time counter par bheed khatam ho gayi.",
      metric: "1.2s Billing Speed",
      stars: 5,
    },
    {
      name: "Mahesh Sharma",
      store: "Sharma General & Dairy",
      city: "Jaipur, Rajasthan",
      quote: "Hamare yahan light ya internet chala bhi jaye, tab bhi Dukaan offline chalta rehta hai. Bill banne me koi rukawat nahi aati.",
      metric: "100% Offline Uptime",
      stars: 5,
    },
  ];

  return (
    <section className="relative z-20 py-24 px-6 max-w-6xl mx-auto bg-[#07090e]">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Star className="w-3.5 h-3.5 fill-amber-400" /> Trusted by Indian Retailers
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Loved on Every Counter. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
            Across 1,200+ Stores.
          </span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className="p-7 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(r.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {r.metric}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{r.quote}"
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm">
                {r.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{r.name}</div>
                <div className="text-xs text-slate-400">{r.store} · {r.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
