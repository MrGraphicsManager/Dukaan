import React, { useState } from "react";
import { ArrowLeft, Search, Plus, Package, Edit, MoreVertical, Filter, Tag } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const initialProducts = [
  { id: 1, name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Grocery", price: 245, costPrice: 220, stock: 18, unit: "bag" },
  { id: 2, name: "Amul Butter Pasteurized 100g", category: "Dairy", price: 56, costPrice: 50, stock: 24, unit: "pack" },
  { id: 3, name: "Tata Salt Vacuum Evaporated 1kg", category: "Grocery", price: 28, costPrice: 22, stock: 45, unit: "pack" },
  { id: 4, name: "Fortune Sunlite Sunflower Oil 1L", category: "Grocery", price: 165, costPrice: 150, stock: 12, unit: "pouch" },
  { id: 5, name: "Maggi 2-Minute Noodles 70g", category: "Snacks", price: 14, costPrice: 12, stock: 80, unit: "pack" },
  { id: 6, name: "Coca-Cola Original Taste 750ml", category: "Beverages", price: 40, costPrice: 34, stock: 4, unit: "bottle" },
  { id: 7, name: "Tide Plus Detergent Powder 1kg", category: "Cleaning", price: 110, costPrice: 95, stock: 2, unit: "pack" },
  { id: 8, name: "Farm Fresh White Eggs 6 pcs", category: "Dairy", price: 42, costPrice: 36, stock: 1, unit: "tray" },
];

export default function MobileProducts({ onBack, onTabChange }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [items, setItems] = useState(initialProducts);

  const categories = ["All", "Grocery", "Dairy", "Snacks", "Beverages", "Cleaning"];

  const filtered = items.filter((p) => {
    const catMatch = activeTab === "All" || p.category === activeTab;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    const newItem = {
      id: Date.now(),
      name: newProductName,
      category: "Grocery",
      price: parseFloat(newProductPrice) || 0,
      costPrice: Math.round((parseFloat(newProductPrice) || 0) * 0.85),
      stock: parseInt(newProductStock, 10) || 10,
      unit: "pack",
    };
    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductStock("");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
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
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">Products Catalog</h1>
              <p className="text-[11px] font-semibold text-slate-400">{items.length} Total Items</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#0066FF] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveTab(c)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === c
                  ? "bg-[#0066FF] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* Product List */}
      <div className="p-4 space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] shrink-0 font-bold">
              <Package className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Category: <span className="font-semibold text-slate-600">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="font-black text-[#0066FF]">₹ {item.price}</span>
                <span className="text-[10px] text-slate-400">Cost: ₹ {item.costPrice}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.stock <= 4 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.stock} in stock
                </span>
              </div>
            </div>

            <button
              onClick={() => alert("Edit product: " + item.name)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 select-none animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parle Hide & Seek 120g"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#0066FF] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <MobileBottomNav activeTab="products" onTabChange={onTabChange} />
    </div>
  );
}
