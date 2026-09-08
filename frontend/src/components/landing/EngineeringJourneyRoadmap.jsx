import React from "react";
import { 
  Rocket, 
  GitCommit, 
  CheckCircle2, 
  Cpu, 
  Code, 
  Layers, 
  ShieldCheck, 
  Flame,
  Zap,
  Server
} from "lucide-react";

const MILESTONES = [
  {
    days: "Day 1 – 2",
    tag: "Core Engine",
    title: "Instant POS & Offline Khata",
    desc: "Built sub-second billing engine, keyboard shortcuts (F1-F6), Kirana inventory tracking, and dual-layer offline persistence so counters never stall.",
    badge: "< 2s Billing"
  },
  {
    days: "Day 3 – 4",
    tag: "Enterprise Auth",
    title: "Google OAuth 2.0 & Super Admin",
    desc: "Integrated official Google Cloud OAuth, RFC 822 Base64 SMTPS email OTP verification, and single-admin session-scoped master control portal.",
    badge: "1-Click Login"
  },
  {
    days: "Day 5 – 6",
    tag: "3D & Mobile",
    title: "Interactive Kiosks & Soundbox",
    desc: "Crafted 3D tilt canvas kiosks with Framer Motion, 8-screen mobile companion app suite, and real-time multilingual UPI audio announcements.",
    badge: "Built-in Audio"
  },
  {
    days: "Day 7",
    tag: "Flagship",
    title: "Dukaan Pro & Cashier Security",
    desc: "Shipped Pro Studio custom invoice designer (58mm/80mm/GST A4), Cashier Mode with Master Owner PIN, and POS Shift Handover (F9).",
    badge: "Enterprise Pro"
  }
];

const TECH_PILLS = [
  { name: "React 19", role: "Frontend Engine", icon: "⚛️" },
  { name: "Python FastAPI", role: "High-Throughput Async API", icon: "🐍" },
  { name: "MongoDB & Motor", role: "Cloud Database", icon: "🍃" },
  { name: "Netlify Edge", role: "Global Serverless CDN", icon: "☁️" },
  { name: "ESC/POS Engine", role: "58mm/80mm Thermal Print", icon: "🖨️" },
  { name: "Tailwind CSS", role: "Design System", icon: "🎨" }
];

export default function EngineeringJourneyRoadmap() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-24 border-t border-brand-mitti" id="our-story">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs mb-3">
          <Rocket className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>The Making of Dukaan</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo">
          From 0 to Full Cloud POS in 7 Days
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-indigo/70 font-medium">
          Behind every feature is intense, relentless engineering. Over 90 commits, continuous testing, and zero compromises on speed.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti shadow-xs text-center">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-brand-terracotta">7 Days</div>
          <div className="text-xs font-bold text-brand-indigo/60 uppercase mt-1 tracking-wider">Concept to Launch</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti shadow-xs text-center">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-brand-indigo">90+</div>
          <div className="text-xs font-bold text-brand-indigo/60 uppercase mt-1 tracking-wider">Production Commits</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti shadow-xs text-center">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-600">&lt;2s</div>
          <div className="text-xs font-bold text-brand-indigo/60 uppercase mt-1 tracking-wider">POS Bill Generation</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border-2 border-brand-mitti shadow-xs text-center">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-blue-600">100%</div>
          <div className="text-xs font-bold text-brand-indigo/60 uppercase mt-1 tracking-wider">Offline-First Resilient</div>
        </div>
      </div>

      {/* Horizontal / Grid Roadmap Stages */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {MILESTONES.map((m, idx) => (
          <div 
            key={m.days} 
            className="p-6 rounded-3xl bg-white border-2 border-brand-mitti hover:border-brand-terracotta/40 hover:shadow-md transition-all flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-extrabold text-xs text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-1 rounded-full">
                  {m.days}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  STAGE 0{idx + 1}
                </span>
              </div>

              <h3 className="font-heading text-lg font-bold text-brand-indigo mb-2">
                {m.title}
              </h3>
              <p className="text-xs text-brand-indigo/70 leading-relaxed">
                {m.desc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-brand-mitti/60 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </span>
              <span className="text-brand-indigo/50 font-mono text-[10px] bg-brand-sand px-2 py-0.5 rounded">
                {m.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack Transparent Banner */}
      <div className="bg-white rounded-3xl border-2 border-brand-mitti p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-mitti">
          <div>
            <h4 className="font-heading text-lg font-bold text-brand-indigo flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-terracotta" />
              <span>Technology Stack & Architecture</span>
            </h4>
            <p className="text-xs text-brand-indigo/60 mt-0.5">
              Built with modern, open standard technologies for zero lag and maximum reliability.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-indigo/60 bg-brand-sand px-3 py-1 rounded-full border border-brand-mitti self-start sm:self-auto">
            100% In-House Engineered
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          {TECH_PILLS.map(t => (
            <div key={t.name} className="p-3 rounded-2xl bg-brand-sand/50 border border-brand-mitti text-center">
              <span className="text-xl block mb-1">{t.icon}</span>
              <div className="font-bold text-xs text-brand-indigo">{t.name}</div>
              <div className="text-[10px] text-brand-indigo/60 mt-0.5 leading-tight">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
