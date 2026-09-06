import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, AlertTriangle, CheckCircle2, Warehouse, RefreshCw, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";

export default function MobileStock({ onBack, onTabChange }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stockList, setStockList] = useState(() => getStoredProducts());

  useEffect(() => {
    setStockList(getStoredProducts());
  }, []);

  const getMinStock = (item) => item.min_stock !== undefined ? item.min_stock : 5;
  const getStock = (item) => item.stock !== undefined ? item.stock : 10;

  const lowCount = stockList.filter((s) => getStock(s) > 0 && getStock(s) <= getMinStock(s)).length;
  const outCount = stockList.filter((s) => getStock(s) === 0).length;

  const filtered = stockList.filter((item) => {
    const s = getStock(item);
    const min = getMinStock(item);
    if (filter === "low") return s > 0 && s <= min;
    if (filter === "out") return s === 0;
    return true;
  }).filter((item) => (item.name || "").toLowerCase().includes(search.toLowerCase()));

  const handleRestock = (id) => {
    const updated = stockList.map((item) =>
      item.id === id ? { ...item, stock: getStock(item) + 10 } : item
    );
    setStockList(updated);
    saveStoredProducts(updated);
    toast.success("Added +10 units to inventory");
  };

  const handleBulkRestock = () => {
    const updated = stockList.map((item) => {
      const s = getStock(item);
      const min = getMinStock(item);
      if (s <= min) {
        return { ...item, stock: min + 15 };
      }
      return item;
    });
    setStockList(updated);
    saveStoredProducts(updated);
    toast.success("Restocked all low & out-of-stock items!");
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
              <h1 className="text-base font-black text-slate-900 leading-tight">Stock Inventory</h1>
              <p className="text-[11px] font-semibold text-slate-400">Warehouse & Shelf Capacity</p>
            </div>
          </div>

          <button
            onClick={handleBulkRestock}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restock All</span>
          </button>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div
            onClick={() => setFilter(filter === "low" ? "all" : "low")}
            className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
              filter === "low" ? "bg-amber-100/70 border-amber-300 shadow-xs" : "bg-amber-50 border-amber-200/60"
            }`}
          >
            <div className="text-[10px] font-extrabold text-amber-700 uppercase">Low Stock</div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{lowCount} Items</div>
          </div>
          <div
            onClick={() => setFilter(filter === "out" ? "all" : "out")}
            className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
              filter === "out" ? "bg-red-100/70 border-red-300 shadow-xs" : "bg-red-50 border-red-200/60"
            }`}
          >
            <div className="text-[10px] font-extrabold text-red-700 uppercase">Out of Stock</div>
            <div className="text-lg font-black text-red-900 mt-0.5">{outCount} Items</div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>
      </header>

      {/* Inventory Item Rows */}
      <div className="p-4 space-y-2.5">
        {filtered.map((item) => {
          const s = getStock(item);
          const min = getMinStock(item);
          const isOut = s === 0;
          const isLow = s > 0 && s <= min;
          const status = isOut ? "out" : isLow ? "low" : "good";
          const maxStock = Math.max(s + 10, 30);
          const percent = Math.min(100, Math.round((s / maxStock) * 100));

          return (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">{item.category || "General"}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase ${
                        status === "out"
                          ? "text-red-600"
                          : status === "low"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {status === "out" ? "Out of Stock" : status === "low" ? "Low Stock" : "Sufficient"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestock(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] font-black text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+10</span>
                </button>
              </div>

              {/* Stock Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-500">Available: {s} {item.unit || "units"}</span>
                  <span className="text-slate-400">Min Alert: {min}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      status === "out"
                        ? "bg-red-500"
                        : status === "low"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dock Nav */}
      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
