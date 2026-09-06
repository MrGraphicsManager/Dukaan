import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, Package, Edit, MoreVertical, Filter, Tag, Percent, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";

export default function MobileProducts({ onBack, onTabChange }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCost, setNewProductCost] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductCat, setNewProductCat] = useState("Kirana & Grains");
  const [items, setItems] = useState(() => getStoredProducts());

  useEffect(() => {
    setItems(getStoredProducts());
  }, []);

  const categories = ["All", "Kirana & Grains", "Dairy & Eggs", "Biscuits & Snacks", "Beverages & Tea", "Spices & Masala", "Household & Soaps"];

  const getPrice = (p) => p.price || p.selling_price || 0;
  const getCost = (p) => p.costPrice || p.purchase_price || Math.round(getPrice(p) * 0.85);

  const filtered = items.filter((p) => {
    const pCat = p.category || "General";
    const catMatch = activeTab === "All" || pCat.toLowerCase().includes(activeTab.toLowerCase());
    const searchMatch = (p.name || "").toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) {
      toast.error("Please enter product name and selling price.");
      return;
    }
    const priceNum = parseFloat(newProductPrice) || 0;
    const costNum = parseFloat(newProductCost) || Math.round(priceNum * 0.82);

    const newItem = {
      id: "prod_" + Date.now(),
      name: newProductName.trim(),
      category: newProductCat,
      selling_price: priceNum,
      price: priceNum,
      purchase_price: costNum,
      costPrice: costNum,
      stock: parseInt(newProductStock, 10) || 15,
      min_stock: 5,
      unit: "pack",
      unlimited_stock: false,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveStoredProducts(updated);

    setShowAddModal(false);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductCost("");
    setNewProductStock("");
    toast.success(`${newItem.name} saved to inventory!`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editProduct) return;

    const updated = items.map((it) => {
      if (it.id === editProduct.id) {
        return {
          ...it,
          name: editProduct.name,
          selling_price: parseFloat(editProduct.selling_price || editProduct.price) || 0,
          price: parseFloat(editProduct.selling_price || editProduct.price) || 0,
          stock: parseInt(editProduct.stock, 10) || 0,
          category: editProduct.category || it.category,
        };
      }
      return it;
    });

    setItems(updated);
    saveStoredProducts(updated);
    setEditProduct(null);
    toast.success("Product updated successfully!");
  };

  const handleDeleteProduct = (id) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveStoredProducts(updated);
    setEditProduct(null);
    toast.success("Product removed from inventory.");
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
              <p className="text-[11px] font-semibold text-slate-400">{items.length} Live Inventory Items</p>
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

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === cat
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
      <div className="p-4 space-y-2">
        {filtered.map((item) => {
          const price = getPrice(item);
          const cost = getCost(item);
          const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
          return (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold text-sm shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-slate-900">₹ {price}</span>
                    <span className="text-[10px] font-semibold text-slate-400">CP: ₹ {cost}</span>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">
                      {margin}% margin
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-xs font-bold ${item.stock <= 3 ? "text-rose-600" : "text-slate-700"}`}>
                    {item.stock} in stock
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase">{item.unit || "pack"}</div>
                </div>
                <button
                  onClick={() => setEditProduct({ ...item })}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add New Inventory Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="245"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Purchase / Cost (₹)</label>
                  <input
                    type="number"
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                    placeholder="210"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newProductCat}
                    onChange={(e) => setNewProductCat(e.target.value)}
                    className="w-full bg-slate-50 px-2 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Edit Product</h2>
              <button
                onClick={() => setEditProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editProduct.selling_price || editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value, selling_price: e.target.value })}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editProduct.id)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0066FF] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dock Nav */}
      <MobileBottomNav activeTab="products" onTabChange={onTabChange} />
    </div>
  );
}
