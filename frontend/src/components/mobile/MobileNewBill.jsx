import React, { useState } from "react";
import { ArrowLeft, Search, Plus, Minus, ShoppingBag, Check, Trash2, Printer, Share2, Sparkles } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const initialProducts = [
  { id: 1, name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Grocery", price: 245, stock: 18, unit: "bag" },
  { id: 2, name: "Amul Butter Pasteurized 100g", category: "Dairy", price: 56, stock: 24, unit: "pack" },
  { id: 3, name: "Tata Salt Vacuum Evaporated 1kg", category: "Grocery", price: 28, stock: 45, unit: "pack" },
  { id: 4, name: "Fortune Sunlite Sunflower Oil 1L", category: "Grocery", price: 165, stock: 12, unit: "pouch" },
  { id: 5, name: "Maggi 2-Minute Noodles 70g", category: "Snacks", price: 14, stock: 80, unit: "pack" },
  { id: 6, name: "Coca-Cola Original Taste 750ml", category: "Beverages", price: 40, stock: 4, unit: "bottle" },
  { id: 7, name: "Britannia Good Day Butter Cookies", category: "Snacks", price: 30, stock: 35, unit: "pack" },
  { id: 8, name: "Parle-G Gold Biscuits 1kg", category: "Snacks", price: 75, stock: 20, unit: "pack" },
];

export default function MobileNewBill({ onBack, onTabChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [cart, setCart] = useState({
    1: 1, // Aashirvaad Atta
    2: 1, // Amul Butter
  });
  const [billSuccessModal, setBillSuccessModal] = useState(false);
  const [customerName, setCustomerName] = useState("Ramesh Sharma");
  const [customerPhone, setCustomerPhone] = useState("9825123456");

  const categories = ["All", "Grocery", "Dairy", "Snacks", "Beverages"];

  const filteredProducts = initialProducts.filter((p) => {
    const matchesCat = selectedCat === "All" || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = initialProducts.find((item) => item.id === parseInt(id, 10));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const handleCreateBill = () => {
    if (totalItemsCount === 0) return;
    setBillSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 select-none relative">
      {/* Top Header */}
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
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">New Bill</h1>
              <p className="text-[11px] font-semibold text-slate-400">Bill #B1029 · Counter 1</p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0066FF] text-xs font-bold">
            POS Mode
          </div>
        </div>

        {/* Customer Input Card */}
        <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/70">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
          />
        </div>

        {/* Search */}
        <div className="mt-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === cat
                  ? "bg-[#0066FF] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Product List */}
      <div className="p-4 space-y-2.5">
        {filteredProducts.map((p) => {
          const qty = cart[p.id] || 0;
          return (
            <div
              key={p.id}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {p.category}
                  </span>
                  {p.stock <= 5 && (
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                      Low: {p.stock}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">{p.name}</div>
                <div className="text-xs font-black text-[#0066FF] mt-1">
                  ₹ {p.price}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">/ {p.unit}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {qty === 0 ? (
                <button
                  onClick={() => updateQty(p.id, 1)}
                  className="px-3.5 py-1.5 bg-blue-50 text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200/60 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(p.id, -1)}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-extrabold text-[#0066FF] w-4 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQty(p.id, 1)}
                    className="w-7 h-7 bg-[#0066FF] rounded-lg flex items-center justify-center text-white shadow-xs active:scale-90 transition-transform cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center font-bold text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">
                  {totalItemsCount} item{totalItemsCount > 1 ? "s" : ""} added
                </div>
                <div className="text-base font-black text-white">₹ {totalAmount}</div>
              </div>
            </div>

            <button
              onClick={handleCreateBill}
              className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Create Bill</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bill Created Success Modal */}
      {billSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 select-none animate-in slide-in-from-bottom duration-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Bill Created Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Invoice #B1029 · Total: ₹ {totalAmount}</p>

            <div className="bg-slate-50 rounded-xl p-3 my-4 border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Customer</span>
                <span className="font-bold text-slate-800">{customerName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Items Count</span>
                <span className="font-bold text-slate-800">{totalItemsCount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode</span>
                <span className="font-bold text-emerald-600">Cash / UPI</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => alert("Printing thermal receipt...")}
                className="py-3 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>
              <button
                onClick={() => alert("Bill shared via WhatsApp to " + customerPhone)}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            <button
              onClick={() => {
                setBillSuccessModal(false);
                setCart({});
                if (onBack) onBack();
              }}
              className="w-full py-3 bg-[#0066FF] text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Done & Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <MobileBottomNav activeTab="billing" onTabChange={onTabChange} />
    </div>
  );
}
