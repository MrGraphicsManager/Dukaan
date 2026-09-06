import React, { useState } from "react";
import { ArrowLeft, Search, Plus, Package, Edit, MoreVertical, Filter, Tag, Percent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";

const initialProducts = [
  { id: 1, name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Grocery", price: 245, costPrice: 210, stock: 18, unit: "bag" },
  { id: 2, name: "Amul Butter Pasteurized 100g", category: "Dairy", price: 56, costPrice: 48, stock: 24, unit: "pack" },
  { id: 3, name: "Tata Salt Vacuum Evaporated 1kg", category: "Grocery", price: 28, costPrice: 22, stock: 45, unit: "pack" },
  { id: 4, name: "Fortune Sunlite Sunflower Oil 1L", category: "Grocery", price: 165, costPrice: 145, stock: 12, unit: "pouch" },
  { id: 5, name: "Maggi 2-Minute Noodles 70g", category: "Snacks", price: 14, costPrice: 11, stock: 80, unit: "pack" },
  { id: 6, name: "Coca-Cola Original Taste 750ml", category: "Beverages", price: 40, costPrice: 32, stock: 4, unit: "bottle" },
  { id: 7, name: "Tide Plus Detergent Powder 1kg", category: "Cleaning", price: 110, costPrice: 92, stock: 2, unit: "pack" },
  { id: 8, name: "Farm Fresh White Eggs 6 pcs", category: "Dairy", price: 42, costPrice: 35, stock: 1, unit: "tray" },
];

export default function MobileProducts({ onBack, onTabChange }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCost, setNewProductCost] = useState("");
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
    const priceNum = parseFloat(newProductPrice) || 0;
    const costNum = parseFloat(newProductCost) || Math.round(priceNum * 0.85);

    const newItem = {
      id: Date.now(),
      name: newProductName,
      category: "Grocery",
      price: priceNum,
      costPrice: costNum,
      stock: parseInt(newProductStock, 10) || 10,
      unit: "pack",
    };
    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductCost("");
    setNewProductStock("");
    toast.success(`${newItem.name} added to catalog!`);
  };

  const handleDeleteProduct = (id) => {
    setItems(items.filter((it) => it.id !== id));
    setEditProduct(null);
    toast.success("Product deleted");
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
              <h1 className="text-base font-black text-slate-900 leading-tight">Products Catalog</h1>
              <p className="text-[11px] font-semibold text-slate-400">{items.length} Total Inventory Items</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#0066FF] hover:bg-blue-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer"
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
              className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap transition-colors cursor-pointer ${
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
        {filtered.map((item) => {
          const margin = Math.round(((item.price - item.costPrice) / item.price) * 100);
          return (
            <div
              key={item.id}
              onClick={() => setEditProduct(item)}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-100 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] shrink-0 font-black">
                <Package className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">{item.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Category: <strong className="text-slate-600">{item.category}</strong>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="font-black text-[#0066FF]">₹ {item.price}</span>
                  <span className="text-[10px] text-slate-400">Cost: ₹{item.costPrice}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600">
                    +{margin}% margin
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full block ${
                    item.stock <= 4 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.stock} left
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 select-none animate-in slide-in-from-bottom duration-200 space-y-3">
            <h3 className="text-sm font-black text-slate-900">Product Details</h3>
            <div className="text-xs font-bold text-slate-800">{editProduct.name}</div>
            
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Selling Price</span>
                <span className="font-black text-[#0066FF]">₹ {editProduct.price}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Cost Price</span>
                <span className="font-bold text-slate-700">₹ {editProduct.costPrice}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => handleDeleteProduct(editProduct.id)}
                className="py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setEditProduct(null)}
                className="py-2.5 bg-[#0066FF] text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 select-none animate-in slide-in-from-bottom duration-200">
            <h3 className="text-sm font-black text-slate-900 mb-3">Add New Inventory Item</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
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

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#0066FF] text-white rounded-xl font-black text-xs cursor-pointer shadow-md shadow-blue-500/20"
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
