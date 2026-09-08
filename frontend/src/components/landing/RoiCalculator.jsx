import React, { useState } from "react";
import { 
  Calculator, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  IndianRupee, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RoiCalculator() {
  const [dailyCustomers, setDailyCustomers] = useState(120);

  // Calculations based on 30 days/month
  // Average traditional manual paper bill takes ~45 seconds. Dukaan takes ~2 seconds.
  const timeSavedMinutesPerDay = Math.round((dailyCustomers * 40) / 60);
  const hoursSavedPerMonth = Math.round((timeSavedMinutesPerDay * 30) / 60);

  // Average kirana udhaar recovery delay without automated WhatsApp is 45-60 days. With Dukaan WhatsApp reminders it's 18 days.
  const estimatedUdhaarTracked = Math.round(dailyCustomers * 180 * 30 * 0.15); // ~15% on udhaar
  const fasterRecoveryPercent = 42;

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 border-t border-brand-mitti" id="calculator">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-mitti bg-white text-xs font-semibold uppercase tracking-widest text-brand-terracotta shadow-xs mb-3">
          <Calculator className="w-3.5 h-3.5 text-brand-terracotta" />
          <span>Interactive Savings Tool</span>
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-indigo">
          Calculate Your Time & Profit Gains
        </h2>
        <p className="mt-3 text-sm sm:text-base text-brand-indigo/70 font-medium">
          Drag the slider below to see how much time and money Dukaan saves for your counter every month.
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-brand-mitti p-7 sm:p-10 shadow-xl max-w-4xl mx-auto">
        
        {/* Slider Controls */}
        <div className="space-y-4 pb-8 border-b border-brand-mitti">
          <div className="flex items-center justify-between">
            <label htmlFor="customer-range" className="font-heading font-extrabold text-base sm:text-lg text-brand-indigo">
              How many customers visit your shop daily?
            </label>
            <div className="font-mono font-black text-2xl sm:text-3xl text-brand-terracotta bg-brand-sand px-4 py-1 rounded-2xl border border-brand-mitti">
              {dailyCustomers} <span className="text-xs font-sans font-bold text-brand-indigo/60 uppercase">/ day</span>
            </div>
          </div>

          <input
            id="customer-range"
            type="range"
            min="25"
            max="500"
            step="5"
            value={dailyCustomers}
            onChange={(e) => setDailyCustomers(Number(e.target.value))}
            className="w-full h-3 bg-brand-sand rounded-lg appearance-none cursor-pointer accent-brand-terracotta"
          />

          <div className="flex justify-between text-xs font-bold text-brand-indigo/40 font-mono">
            <span>25 Customers</span>
            <span>250 Regular Rush</span>
            <span>500 Supermarket Rush</span>
          </div>
        </div>

        {/* Dynamic Outputs Grid */}
        <div className="grid sm:grid-cols-3 gap-5 pt-8">
          
          {/* Output 1: Hours Saved */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-amber-900">
                ~{hoursSavedPerMonth} hrs
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800/80 mt-1">
                Saved Per Month
              </div>
              <p className="text-[11px] text-amber-900/70 mt-1 font-medium">
                No slow hand-writing bills or calculating totals manually on a pocket calculator.
              </p>
            </div>
          </div>

          {/* Output 2: Cash Reconciliation */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-emerald-900">
                100%
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800/80 mt-1">
                Cash Drawer Balance
              </div>
              <p className="text-[11px] text-emerald-900/70 mt-1 font-medium">
                Zero drawer leakage with Shift Handover (F9) and automatic cash shortage alarms.
              </p>
            </div>
          </div>

          {/* Output 3: Faster Udhaar Recovery */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-purple-900">
                +{fasterRecoveryPercent}%
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-800/80 mt-1">
                Faster Udhaar Recovery
              </div>
              <p className="text-[11px] text-purple-900/70 mt-1 font-medium">
                Polite 1-tap WhatsApp payment reminders sent directly to customer phones with total ledger.
              </p>
            </div>
          </div>

        </div>

        {/* CTA Banner inside calculator */}
        <div className="mt-8 pt-6 border-t border-brand-mitti flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-indigo">
            <Sparkles className="w-4 h-4 text-brand-terracotta" />
            <span>Ready to save time and stop revenue leakage on your counter?</span>
          </div>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </section>
  );
}
