import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Check, 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  BarChart3, 
  Zap, 
  DollarSign, 
  Crown,
  CheckCircle2,
  X
} from "lucide-react";
import { DEFAULT_PRO_DASHBOARD, saveProDashboardWidgets } from "@/lib/proCustomizations";

export default function ProDashboardCustomizer({
  isOpen,
  onClose,
  widgets,
  setWidgets,
  userEmail,
  isPro
}) {
  const nav = useNavigate();
  const [localWidgets, setLocalWidgets] = useState(widgets || DEFAULT_PRO_DASHBOARD);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setLocalWidgets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    saveProDashboardWidgets(userEmail, localWidgets);
    setWidgets(localWidgets);
    toast.success("Dashboard layout updated successfully!");
    onClose();
  };

  const handleReset = () => {
    setLocalWidgets({ ...DEFAULT_PRO_DASHBOARD });
    saveProDashboardWidgets(userEmail, DEFAULT_PRO_DASHBOARD);
    setWidgets({ ...DEFAULT_PRO_DASHBOARD });
    toast.info("Dashboard layout reset to default.");
    onClose();
  };

  const WIDGET_OPTIONS = [
    {
      key: "sales_kpi",
      name: "Today's Core KPI Metric Cards",
      description: "Sales revenue, order count, UPI digital payments & pending udhaar totals.",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      key: "profit_estimate",
      name: "Daily Profit Estimate & EOD Closing",
      description: "Gross margin breakdown and End-of-Day register closing summary.",
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50"
    },
    {
      key: "udhaar_summary",
      name: "Khata / Udhaar Balances Card",
      description: "Fast customer ledger overview showing outstanding market balances.",
      icon: Wallet,
      color: "text-blue-600 bg-blue-50"
    },
    {
      key: "low_stock_alerts",
      name: "Low Stock Warnings & 1-Tap Restock",
      description: "Critical threshold inventory warnings with instant restock buttons.",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50"
    },
    {
      key: "hourly_sales_chart",
      name: "Hourly Peak Traffic Rush Chart",
      description: "Visual time-slot graph revealing customer footfall and sales velocity.",
      icon: BarChart3,
      color: "text-purple-600 bg-purple-50"
    },
    {
      key: "quick_actions",
      name: "Quick Action Counter Shortcuts",
      description: "Immediate action bar (+ Naya Bill, + Udhaar Likho, + Naya Item).",
      icon: Zap,
      color: "text-indigo-600 bg-indigo-50"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 border-2 border-brand-mitti shadow-2xl space-y-5 animate-scale-in relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-brand-mitti/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 grid place-items-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg text-brand-indigo">
                  Customize Dashboard
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 font-mono">
                  PRO
                </span>
              </div>
              <p className="text-xs text-brand-indigo/60">
                Show, hide, or rearrange widgets to suit your daily counter workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 grid place-items-center text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Non-pro banner */}
        {!isPro && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white flex items-center justify-between gap-3 shadow-md">
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Dukaan Pro Feature
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                Start 14-day free trial to permanently customize your shop dashboard.
              </p>
            </div>
            <Button
              onClick={() => nav("/subscribe?plan=pro")}
              className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shrink-0"
            >
              Upgrade Free
            </Button>
          </div>
        )}

        {/* Widget Switches List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {WIDGET_OPTIONS.map((item) => {
            const isEnabled = localWidgets[item.key] !== false;
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? "border-purple-500/40 bg-purple-50/40 shadow-xs"
                    : "border-slate-200 bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-brand-indigo flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {isEnabled && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <div className="text-[10px] text-brand-indigo/60 leading-tight mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Toggle switch */}
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => {}}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-mitti/60">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-xs text-brand-indigo/60 hover:text-brand-indigo flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Apply Changes</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
