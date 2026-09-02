import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, ShieldAlert, Zap, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CounterMode() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-sand flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-10 md:p-14 border-2 border-brand-mitti shadow-xl max-w-md w-full flex flex-col items-center relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-terracotta/10 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 text-amber-700 flex items-center justify-center mb-6 shadow-sm">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Temporarily Locked
        </span>

        <h1 className="font-display text-3xl font-bold text-brand-indigo mb-2 tracking-tight">
          Counter Mode Locked
        </h1>

        <p className="text-sm text-brand-indigo/70 leading-relaxed max-w-sm mb-8">
          High-speed keyboard counter billing (F1-F6) is currently locked for maintenance on this shop. Please use the standard POS billing screen.
        </p>

        <div className="w-full space-y-3">
          <Button
            onClick={() => navigate("/app/pos")}
            className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Open Standard POS Billing
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/app")}
            className="w-full h-12 rounded-2xl border-2 border-brand-mitti hover:border-brand-indigo text-brand-indigo font-bold text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
