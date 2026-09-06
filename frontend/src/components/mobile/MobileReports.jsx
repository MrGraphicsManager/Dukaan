import React, { useState } from "react";
import { ArrowLeft, TrendingUp, Calendar, Download, DollarSign, Receipt, Users, ArrowUpRight } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

export default function MobileReports({ onBack, onTabChange }) {
  const [period, setPeriod] = useState("week");

  const weeklyData = [
    { day: "Mon", sales: 8400, height: 45 },
    { day: "Tue", sales: 11200, height: 60 },
    { day: "Wed", sales: 9800, height: 52 },
    { day: "Thu", sales: 14500, height: 80 },
    { day: "Fri", sales: 12450, height: 68 },
    { day: "Sat", sales: 18200, height: 95 },
    { day: "Sun", sales: 16100, height: 85 },
  ];

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
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">Sales & Reports</h1>
              <p className="text-[11px] font-semibold text-slate-400">Revenue & Profit Overview</p>
            </div>
          </div>
          <button
            onClick={() => alert("Downloading PDF sales report...")}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                period === item.id ? "bg-white text-[#0066FF] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-150/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">₹ 90,650</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last week</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-150/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Net Profit</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">₹ 24,180</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Margin: ~26.6%</div>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-extrabold text-slate-900">Weekly Sales Breakdown</div>
              <div className="text-[11px] text-slate-400">Daily earnings Monday - Sunday</div>
            </div>
            <span className="text-xs font-black text-[#0066FF]">₹ 90,650</span>
          </div>

          {/* Bar Chart Display */}
          <div className="flex items-end justify-between h-36 pt-4 border-b border-slate-100">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="text-[9px] font-bold text-slate-400">₹{(d.sales / 1000).toFixed(0)}k</div>
                <div
                  style={{ height: `${d.height}%` }}
                  className={`w-6 rounded-t-md transition-all ${
                    d.day === "Sat" ? "bg-[#0066FF]" : "bg-blue-200 hover:bg-blue-300"
                  }`}
                />
                <span className="text-[10px] font-bold text-slate-600 mt-1">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Modes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150/80 shadow-2xs">
          <div className="text-xs font-extrabold text-slate-900 mb-3">Payment Methods Breakdown</div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>UPI / QR Code</span>
                <span className="text-[#0066FF]">65% · ₹ 58,920</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#0066FF] rounded-full w-[65%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Cash Payment</span>
                <span className="text-emerald-600">30% · ₹ 27,200</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Udhaar / Khata Credit</span>
                <span className="text-amber-600">5% · ₹ 4,530</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[5%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
