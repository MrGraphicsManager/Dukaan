import React, { useState } from "react";
import { ArrowLeft, Search, AlertTriangle, CheckCircle2, Warehouse, RefreshCw, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";

const initialStockItems = [
  { id: 1, name: "Coca-Cola Original 750ml", category: "Beverages", stock: 4, maxStock: 25, minStock: 10, status: "low" },
  { id: 2, name: "Tide Plus Detergent 1kg", category: "Cleaning", stock: 2, maxStock: 20, minStock: 8, status: "low" },
  { id: 3, name: "Farm Fresh Eggs (6 pcs)", category: "Dairy", stock: 1, maxStock: 30, minStock: 12, status: "critical" },
  { id: 4, name: "Harvest Gold Bread 400g", category: "Bakery", stock: 0, maxStock: 20, minStock: 10, status: "out" },
  { id: 5, name: "Amul Butter 100g", category: "Dairy", stock: 24, maxStock: 30, minStock: 10, status: "good" },
  { id: 6, name: "Aashirvaad Atta 5kg", category: "Grocery", stock: 18, maxStock: 25, minStock: 10, status: "good" },
  { id: 7, name: "Tata Salt 1kg", category: "Grocery", stock: 45, maxStock: 50, minStock: 15, status: "good" },
];

export default function MobileStock({ onBack, onTabChange }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stockList, setStockList] = useState(initialStockItems);

  const lowCount = stockList.filter((s) => s.stock > 0 && s.stock <= s.minStock).length;
  const outCount = stockList.filter((s) => s.stock === 0).length;

  const filtered = stockList.filter((item) => {
    if (filter === "low") return item.stock > 0 && item.stock <= item.minStock;
    if (filter === "out") return item.stock === 0;
    return true;
  }).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleRestock = (id) => {
    setStockList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: item.stock + 10, status: "good" } : item))
    );
    toast.success("Added +10 units to inventory");
  };

  const handleBulkRestock = () => {
    setStockList((prev) =>
      prev.map((item) => (item.stock <= item.minStock ? { ...item, stock: item.minStock + 10 } : item))
    );
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
            onClick={() => setFilter("low")}
            className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
              filter === "low" ? "bg-amber-100/70 border-amber-300 shadow-xs" : "bg-amber-50 border-amber-200/60"
            }`}
          >
            <div className="text-[10px] font-extrabold text-amber-700 uppercase">Low Stock</div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{lowCount} Items</div>
          </div>
          <div
            onClick={() => setFilter("out")}
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2">
          {["all", "low", "out"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-black capitalize transition-colors cursor-pointer ${
                filter === t ? "bg-[#0066FF] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? `All (${stockList.length})` : t === "low" ? `Low (${lowCount})` : `Out (${outCount})`}
            </button>
          ))}
        </div>
      </header>

      {/* Stock Items List */}
      <div className="p-4 space-y-2.5">
        {filtered.map((item) => {
          const isOut = item.stock === 0;
          const isLow = item.stock > 0 && item.stock <= item.minStock;
          const fillPercent = Math.min(100, Math.round((item.stock / item.maxStock) * 100));

          return (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                    {isOut ? (
                      <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        OUT OF STOCK
                      </span>
                    ) : isLow ? (
                      <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        LOW ({item.stock} left)
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        IN STOCK ({item.stock})
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-black text-slate-800 truncate mt-1">{item.name}</div>
                </div>

                <button
                  onClick={() => handleRestock(item.id)}
                  className="px-3 py-1.5 bg-blue-50 text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-xl text-xs font-black flex items-center gap-1 transition-colors cursor-pointer active:scale-95 shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+10</span>
                </button>
              </div>

              {/* Capacity Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                  <span>Capacity</span>
                  <span>{item.stock} / {item.maxStock} units</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${fillPercent}%` }}
                    className={`h-full rounded-full transition-all ${
                      isOut ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-[#0066FF]"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MobileBottomNav activeTab="products" onTabChange={onTabChange} />
    </div>
  );
}
