import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Infinity as InfinityIcon, 
  Search, 
  Package, 
  TrendingUp, 
  Layers, 
  AlertTriangle,
  LayoutGrid,
  List,
  Sparkles,
  Tag,
  Boxes,
  CheckCircle2,
  DollarSign,
  Warehouse
} from "lucide-react";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";

const EMPTY = { 
  name: "", 
  category: "Kirana & Grains", 
  selling_price: "", 
  purchase_price: "", 
  stock: 10, 
  min_stock: 5, 
  unlimited_stock: false 
};

const DEFAULT_CATEGORIES = [
  "Kirana & Grains",
  "Edible Oil & Ghee",
  "Dairy & Eggs",
  "Biscuits & Snacks",
  "Spices & Masala",
  "Beverages & Tea",
  "Personal Care",
  "Household & Soaps",
  "General"
];

export default function Products() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getStoredProducts());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "in_stock", "low_stock", "out_of_stock"
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [form, setForm] = useState({ open: false, mode: "create", data: EMPTY });
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get("/products", { params: { q: q || undefined, category } })
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setItems(r.data);
          saveStoredProducts(r.data);
        } else {
          setItems(getStoredProducts());
        }
      })
      .catch(() => {
        setItems(getStoredProducts());
      });
  };

  useEffect(() => {
    load();
    /* eslint-disable-next-line */
  }, [q, category]);

  const allCategories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    items.forEach(p => { if (p.category) set.add(p.category.trim()); });
    return ["all", ...Array.from(set)];
  }, [items]);

  // Filtered by search, category, and stock status
  const filtered = useMemo(() => {
    return items.filter(p => {
      // Stock status filter
      if (statusFilter === "in_stock" && (p.stock <= (p.min_stock || 0) && !p.unlimited_stock)) return false;
      if (statusFilter === "low_stock" && (p.unlimited_stock || p.stock <= 0 || p.stock > (p.min_stock || 5))) return false;
      if (statusFilter === "out_of_stock" && (p.unlimited_stock || p.stock > 0)) return false;
      return true;
    });
  }, [items, statusFilter]);

  // Inventory value & stats
  const totalStockValue = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.unlimited_stock ? 0 : (it.selling_price || 0) * (it.stock || 0)), 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(p => !p.unlimited_stock && p.stock <= (p.min_stock || 5)).length;
  }, [items]);

  const submit = async () => {
    const data = {
      ...form.data,
      selling_price: Number(form.data.selling_price || 0),
      purchase_price: Number(form.data.purchase_price || 0),
      stock: form.data.unlimited_stock ? 0 : Number(form.data.stock || 0),
      min_stock: form.data.unlimited_stock ? 0 : Number(form.data.min_stock || 5),
      unlimited_stock: !!form.data.unlimited_stock
    };
    if (!data.name.trim()) return toast.error("Product name is required");
    if (data.selling_price <= 0) return toast.error("Please enter a valid selling price");

    setBusy(true);
    try {
      if (form.mode === "create") {
        try {
          const res = await api.post("/products", data);
          if (res?.data?.id) data.id = res.data.id;
        } catch (_) {}
        if (!data.id) data.id = `prod_${Date.now()}`;
        const currentStored = getStoredProducts();
        const updated = [data, ...currentStored];
        saveStoredProducts(updated);
        setItems(updated);
        toast.success(`Product "${data.name}" added to inventory!`);
      } else {
        try {
          await api.put(`/products/${form.data.id}`, data);
        } catch (_) {}
        const currentStored = getStoredProducts();
        const updated = currentStored.map(p => (p.id === form.data.id ? { ...p, ...data } : p));
        saveStoredProducts(updated);
        setItems(updated);
        toast.success(`Product "${data.name}" updated!`);
      }
      setForm({ open: false, mode: "create", data: EMPTY });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save product");
    } finally {
      setBusy(false);
    }
  };

  const del = async (p) => {
    if (!confirm(`Are you sure you want to delete ${p.name}?`)) return;
    try {
      try { await api.delete(`/products/${p.id}`); } catch (_) {}
      const currentStored = getStoredProducts();
      const updated = currentStored.filter(item => item.id !== p.id);
      saveStoredProducts(updated);
      setItems(updated);
      toast.success(`Deleted ${p.name}`);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // Live profit margin calculation for modal form
  const selling = Number(form.data.selling_price || 0);
  const purchase = Number(form.data.purchase_price || 0);
  const profitMargin = selling > 0 && purchase > 0 ? Math.round(((selling - purchase) / selling) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">PRODUCT CATALOG</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-emerald-300">
                {items.length} SKUs Active
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Products & Pricing
            </h1>
          </div>
        </div>

        {/* Stats & Add Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-white/60">Total Stock Value</div>
            <div className="font-display text-xl font-bold text-white">{money(totalStockValue)}</div>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-amber-300">Low Stock</div>
            <div className="font-display text-xl font-bold text-amber-300">{lowStockCount} items</div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/app/stock")}
            className="h-12 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5"
          >
            <Warehouse className="w-4 h-4" /> Stock Control
          </Button>
          <Button 
            onClick={() => setForm({ open: true, mode: "create", data: EMPTY })} 
            data-testid="add-product-btn" 
            className="h-12 px-5 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-glow active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* =========================================================
          CONTROLS BAR: SEARCH, FILTERS & VIEW TOGGLE
      ========================================================= */}
      <div className="bg-white p-4 rounded-3xl border-2 border-brand-mitti shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Search & Category */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
            <Input 
              data-testid="product-search" 
              placeholder="Search by product name or category…" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              className="pl-11 pr-4 h-11 rounded-2xl border-brand-mitti bg-brand-sand/50 text-sm font-medium text-brand-indigo" 
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44 h-11 rounded-2xl border-brand-mitti bg-brand-sand/50 text-xs font-bold text-brand-indigo">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(c => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: Stock Status Pills & View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-mitti">
            {[
              { id: "all", label: "All" },
              { id: "in_stock", label: "In Stock" },
              { id: "low_stock", label: `Low Stock (${lowStockCount})` },
              { id: "out_of_stock", label: "Out of Stock" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id 
                    ? "bg-white text-brand-indigo shadow-xs" 
                    : "text-brand-indigo/60 hover:text-brand-indigo"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-mitti">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl ${viewMode === "grid" ? "bg-white text-brand-indigo shadow-xs" : "text-brand-indigo/40"}`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl ${viewMode === "table" ? "bg-white text-brand-indigo shadow-xs" : "text-brand-indigo/40"}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================
          PRODUCT DISPLAY: GRID VIEW OR TABLE VIEW
      ========================================================= */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-brand-mitti p-8">
          <Boxes className="w-12 h-12 text-brand-indigo/30 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-brand-indigo">No products found</h3>
          <p className="text-xs text-brand-indigo/60 mt-1">Try adjusting your search query or category filter.</p>
          <Button 
            onClick={() => setForm({ open: true, mode: "create", data: EMPTY })} 
            className="mt-4 rounded-full bg-brand-terracotta text-white text-xs font-bold"
          >
            + Add New Product
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" data-testid="products-grid">
          {filtered.map(p => {
            const isLow = !p.unlimited_stock && p.stock > 0 && p.stock <= (p.min_stock || 5);
            const isOut = !p.unlimited_stock && p.stock <= 0;
            const margin = p.selling_price && p.purchase_price 
              ? Math.round(((p.selling_price - p.purchase_price) / p.selling_price) * 100) 
              : null;

            return (
              <div 
                key={p.id}
                className="bg-white rounded-3xl border-2 border-brand-mitti p-5 shadow-xs hover:border-brand-indigo/30 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo/60 bg-brand-sand px-2.5 py-1 rounded-full border border-brand-mitti">
                      {p.category || "General"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.unlimited_stock ? "bg-brand-indigo/10 text-brand-indigo" :
                      isOut ? "bg-red-100 text-red-700" :
                      isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {p.unlimited_stock ? "Unlimited" : isOut ? "Out of stock" : `${p.stock} in stock`}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-brand-indigo leading-snug line-clamp-2">
                    {p.name}
                  </h3>

                  {/* Pricing breakdown */}
                  <div className="mt-4 p-3 rounded-2xl bg-brand-sand/50 border border-brand-mitti/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-brand-indigo/50 uppercase font-bold">Selling Price</div>
                      <div className="font-display font-bold text-xl text-brand-indigo">
                        {money(p.selling_price)}
                      </div>
                    </div>
                    {p.purchase_price > 0 && (
                      <div className="text-right">
                        <div className="text-[10px] text-brand-indigo/50 uppercase font-bold">Cost / Margin</div>
                        <div className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1">
                          <span>{money(p.purchase_price)}</span>
                          {margin !== null && (
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              +{margin}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-brand-mitti/60 flex items-center justify-between">
                  <span className="text-[11px] text-brand-indigo/50 font-medium">
                    Min Threshold: {p.unlimited_stock ? "—" : p.min_stock || 5}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setForm({ open: true, mode: "edit", data: p })}
                      className="p-2 rounded-xl bg-brand-sand hover:bg-brand-mitti text-brand-indigo transition-colors"
                      title="Edit Product"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => del(p)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-3xl border-2 border-brand-mitti bg-white shadow-xs">
          <table className="w-full text-sm font-sans text-brand-indigo">
            <thead className="bg-brand-sand border-b-2 border-brand-mitti text-left text-[11px] uppercase tracking-wider font-bold text-brand-terracotta">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4 text-right">Purchase Price</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-right">Min Level</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-mitti" data-testid="products-table">
              {filtered.map(p => {
                const isLow = !p.unlimited_stock && p.stock > 0 && p.stock <= (p.min_stock || 5);
                const isOut = !p.unlimited_stock && p.stock <= 0;
                return (
                  <tr key={p.id} className="hover:bg-brand-sand/50 transition-colors">
                    <td className="px-6 py-4 font-heading font-bold text-base">{p.name}</td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase text-brand-indigo/60">{p.category}</td>
                    <td className="px-6 py-4 text-right font-display font-bold text-base">{money(p.selling_price)}</td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-brand-indigo/60">{p.purchase_price ? money(p.purchase_price) : "—"}</td>
                    <td className="px-6 py-4 text-right font-display font-bold text-base">
                      {p.unlimited_stock ? <InfinityIcon className="w-4 h-4 inline text-brand-indigo/40" /> : p.stock}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-brand-indigo/50">{p.unlimited_stock ? "—" : p.min_stock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        p.unlimited_stock ? "bg-brand-indigo/10 text-brand-indigo" :
                        isOut ? "bg-red-100 text-red-700" :
                        isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {p.unlimited_stock ? "Unlimited" : isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setForm({ open: true, mode: "edit", data: p })}
                          className="p-2 rounded-lg bg-brand-sand hover:bg-brand-mitti text-brand-indigo"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => del(p)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          ADD / EDIT PRODUCT MODAL
      ========================================================= */}
      <Dialog open={form.open} onOpenChange={(o) => setForm({ ...form, open: o })}>
        <DialogContent className="max-w-lg rounded-3xl p-7 border-2 border-brand-mitti">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-terracotta" />
              <span>{form.mode === "create" ? "Add New Product" : "Edit Product"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {/* Name */}
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Product Name *</Label>
              <Input
                value={form.data.name}
                onChange={(e) => setForm({ ...form, data: { ...form.data, name: e.target.value } })}
                placeholder="e.g. Aashirvaad Shudh Atta 5kg"
                className="mt-1 h-11 rounded-xl border-brand-mitti text-base font-semibold"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Category</Label>
              <Select 
                value={form.data.category} 
                onValueChange={(cat) => setForm({ ...form, data: { ...form.data, category: cat } })}
              >
                <SelectTrigger className="mt-1 h-11 rounded-xl border-brand-mitti">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Rows */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Selling Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.data.selling_price}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, selling_price: e.target.value } })}
                  placeholder="240"
                  className="mt-1 h-11 rounded-xl border-brand-mitti text-base font-bold font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Purchase Cost (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.data.purchase_price}
                  onChange={(e) => setForm({ ...form, data: { ...form.data, purchase_price: e.target.value } })}
                  placeholder="190"
                  className="mt-1 h-11 rounded-xl border-brand-mitti text-base font-mono"
                />
              </div>
            </div>

            {/* Profit Margin Preview Bar */}
            {profitMargin > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Estimated Profit Margin:</span>
                <span className="font-heading text-sm text-emerald-700">+{profitMargin}% per item</span>
              </div>
            )}

            {/* Stock Settings */}
            <div className="pt-2 border-t border-brand-mitti space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="unlimited-stock"
                  checked={form.data.unlimited_stock}
                  onCheckedChange={(checked) => setForm({ ...form, data: { ...form.data, unlimited_stock: !!checked } })}
                />
                <Label htmlFor="unlimited-stock" className="text-xs font-bold text-brand-indigo cursor-pointer">
                  Unlimited / Prepared Stock (Chai, samosas, fresh snacks)
                </Label>
              </div>

              {!form.data.unlimited_stock && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Initial Stock Count</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.data.stock}
                      onChange={(e) => setForm({ ...form, data: { ...form.data, stock: e.target.value } })}
                      className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Low Stock Alert Level</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.data.min_stock}
                      onChange={(e) => setForm({ ...form, data: { ...form.data, min_stock: e.target.value } })}
                      className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-5 gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setForm({ open: false, mode: "create", data: EMPTY })}
              className="rounded-full text-brand-indigo/70"
            >
              Cancel
            </Button>
            <Button 
              disabled={busy} 
              onClick={submit} 
              className="rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold h-11 px-6 shadow-md"
            >
              {busy ? "Saving…" : form.mode === "create" ? "Add to Catalog" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
