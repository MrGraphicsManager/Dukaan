import React, { useState } from "react";
import { ArrowLeft, TrendingUp, Calendar, Download, DollarSign, Receipt, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileReports({ onBack, onTabChange }) {
  const [period, setPeriod] = useState("week");
  const [selectedDayIdx, setSelectedDayIdx] = useState(5); // Saturday active

  const weeklyData = [
    { day: "Mon", sales: 8400, bills: 18, height: 45 },
    { day: "Tue", sales: 11200, bills: 24, height: 60 },
    { day: "Wed", sales: 9800, bills: 21, height: 52 },
    { day: "Thu", sales: 14500, bills: 29, height: 80 },
    { day: "Fri", sales: 12450, bills: 28, height: 68 },
    { day: "Sat", sales: 18200, bills: 36, height: 95 },
    { day: "Sun", sales: 16100, bills: 32, height: 85 },
  ];

  const activeDay = weeklyData[selectedDayIdx];

  const handleExport = () => {
    toast.success("Sales Report PDF generated & saved!");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">Sales & Reports</h1>
              <p className="text-[11px] font-semibold text-slate-400">Revenue & Profit Performance</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066FF] hover:bg-blue-100 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 mt-3 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                period === item.id ? "bg-white text-[#0066FF] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-3.5">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-150/80 shadow-2xs">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Revenue</div>
            <div className="text-xl font-black text-slate-900 mt-1">₹ 90,650</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-black mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last week</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-150/80 shadow-2xs">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Net Profit</div>
            <div className="text-xl font-black text-emerald-600 mt-1">₹ 24,180</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">Margin: ~26.6%</div>
          </div>
        </div>

        {/* Interactive Bar Chart Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-slate-900">Weekly Earnings Breakdown</div>
              <div className="text-[10px] text-slate-400">Tap a bar to view daily stats</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-[#0066FF] block">₹ {activeDay.sales}</span>
              <span className="text-[10px] text-slate-400">{activeDay.bills} Bills on {activeDay.day}</span>
            </div>
          </div>

          {/* Bar Chart Display */}
          <div className="flex items-end justify-between h-36 pt-4 border-b border-slate-100">
            {weeklyData.map((d, i) => {
              const isSelected = selectedDayIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDayIdx(i)}
                  className="flex flex-col items-center gap-1 flex-1 cursor-pointer group"
                >
                  <div className={`text-[9px] font-bold ${isSelected ? "text-[#0066FF]" : "text-slate-400"}`}>
                    ₹{(d.sales / 1000).toFixed(0)}k
                  </div>
                  <div
                    style={{ height: `${d.height}%` }}
                    className={`w-6 rounded-t-md transition-all ${
                      isSelected
                        ? "bg-[#0066FF] shadow-md shadow-blue-500/30 scale-y-105"
                        : "bg-blue-100 group-hover:bg-blue-200"
                    }`}
                  />
                  <span className={`text-[10px] font-black mt-1 ${isSelected ? "text-[#0066FF]" : "text-slate-600"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Modes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs space-y-2.5">
          <div className="text-xs font-black text-slate-900 mb-2">Payment Channels Breakdown</div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>UPI / QR Payment</span>
              <span className="text-[#0066FF] font-black">65% · ₹ 58,920</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#0066FF] rounded-full w-[65%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Cash Billing</span>
              <span className="text-emerald-600 font-black">30% · ₹ 27,200</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Udhaar / Khata Credit</span>
              <span className="text-amber-600 font-black">5% · ₹ 4,530</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[5%]" />
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
