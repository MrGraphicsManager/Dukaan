import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Banknote, 
  QrCode, 
  Wallet, 
  CreditCard,
  Infinity as InfinityIcon, 
  Sparkles,
  Printer,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  UserPlus,
  Percent,
  Receipt,
  Store,
  Tag,
  ShoppingBag,
  Zap,
  Volume2
} from "lucide-react";

export default function POS() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]); // {product_id, name, price, qty, unit}
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat"); // "flat" or "percent"
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [shop, setShop] = useState(null);
  
  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Completed bill dialog state
  const [completedBill, setCompletedBill] = useState(null);
  const [autoResetTimer, setAutoResetTimer] = useState(null);

  // New Customer modal state
  const [newCustomer, setNewCustomer] = useState({ open: false, name: "", phone: "" });

  useEffect(() => {
    api.get("/products").then(r => setProducts(Array.isArray(r.data) ? r.data : []));
    api.get("/customers").then(r => setCustomers(Array.isArray(r.data) ? r.data : []));
    api.get("/shops").then(r => {
      const shopId = localStorage.getItem("dukaan_shop_id");
      const list = Array.isArray(r.data) ? r.data : [];
      setShop(list.find(s => s.id === shopId) || list[0]);
    });
  }, []);

  // Compute categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filtered products by search & category
  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategory !== "All") {
      list = list.filter(p => (p.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(s) || 
      (p.category || "").toLowerCase().includes(s)
    );
  }, [products, q, selectedCategory]);

  // Cart operations
  const addToCart = (p) => {
    setCart(prev => {
      const idx = prev.findIndex(x => x.product_id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { 
        product_id: p.id, 
        name: p.name, 
        price: p.selling_price, 
        qty: 1, 
        category: p.category 
      }];
    });
  };

  const updateQty = (idx, delta) => {
    setCart(prev => {
      const copy = [...prev];
      const newQty = copy[idx].qty + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      copy[idx] = { ...copy[idx], qty: newQty };
      return copy;
    });
  };

  const removeItem = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerId("");
  };

  // Pricing math
  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const discountAmount = discountType === "percent" 
    ? Math.round((subtotal * Number(discount || 0)) / 100)
    : Number(discount || 0);
  const total = Math.max(0, subtotal - discountAmount);

  // Selected customer details
  const selectedCustomerObj = customers.find(c => c.id === customerId);

  // Bill submission
  const handleCompleteBill = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (method === "udhaar" && !customerId) {
      toast.error("Please select a customer for Udhaar");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        items: cart,
        discount: Number(discountAmount || 0),
        customer_id: customerId || null,
        payment_method: method,
        amount_received: method === "cash" ? Number(amountReceived || total) : null,
      };

      const res = await api.post("/orders", payload);
      const order = res.data;

      setPayOpen(false);
      setCompletedBill({
        order_no: order.order_no || `OD-${Date.now().toString().slice(-4)}`,
        id: order.id,
        total,
        payment_method: method,
        items: cart,
        change: method === "cash" && Number(amountReceived) > total ? Number(amountReceived) - total : 0,
      });

      const savedOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      localStorage.setItem("dukaan_orders", JSON.stringify([order, ...savedOrders]));

      toast.success(`Bill #${order.order_no} created successfully!`);

      // Sound feedback simulation
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("Bill ready");
        u.rate = 1.2;
        window.speechSynthesis.speak(u);
      }

      // Auto-reset after 3 seconds for next customer
      const timer = setTimeout(() => {
        setCompletedBill(null);
        clearCart();
      }, 3000);
      setAutoResetTimer(timer);

    } catch (e) {
      // Offline / demo fallback order creation
      const mockOrder = {
        id: `demo_order_${Date.now()}`,
        order_no: `OD-${Math.floor(1000 + Math.random() * 9000)}`,
        total,
        payment_method: method,
        status: method === "udhaar" ? "udhaar" : "paid",
        customer_name: selectedCustomerObj?.name || "Walk-in Customer",
        customer_phone: selectedCustomerObj?.phone || "",
        created_at: new Date().toISOString(),
        items: cart,
        change: method === "cash" && Number(amountReceived) > total ? Number(amountReceived) - total : 0,
      };

      const savedOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      localStorage.setItem("dukaan_orders", JSON.stringify([mockOrder, ...savedOrders]));

      setPayOpen(false);
      setCompletedBill(mockOrder);
      toast.success(`Bill #${mockOrder.order_no} created!`);

      const timer = setTimeout(() => {
        setCompletedBill(null);
        clearCart();
      }, 3000);
      setAutoResetTimer(timer);
    } finally {
      setBusy(false);
    }
  };

  const handleManualReset = () => {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    setCompletedBill(null);
    clearCart();
  };

  const createCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const { data } = await api.post("/customers", { name: newCustomer.name, phone: newCustomer.phone });
      setCustomers(prev => [...prev, data]);
      setCustomerId(data.id);
      setNewCustomer({ open: false, name: "", phone: "" });
      toast.success("Customer added to directory");
    } catch {
      const demoC = { id: `c_${Date.now()}`, name: newCustomer.name, phone: newCustomer.phone };
      setCustomers(prev => [...prev, demoC]);
      setCustomerId(demoC.id);
      setNewCustomer({ open: false, name: "", phone: "" });
      toast.success("Customer added");
    }
  };

  return (
    <div className="animate-fade-up max-w-[1500px] mx-auto pb-12 font-sans selection:bg-brand-terracotta/20">
      
      {/* Top POS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-brand-mitti">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-terracotta text-white grid place-items-center shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-indigo tracking-tight">
              New Bill & POS
            </h1>
            <p className="text-xs text-brand-indigo/60 font-medium mt-0.5">
              Instant Counter Billing · Press <span className="font-bold text-brand-indigo">F1</span> for keyboard mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => nav("/app/counter")}
            className="rounded-full border-2 border-brand-mitti hover:border-brand-indigo bg-white text-brand-indigo text-xs font-bold px-4 h-10 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Counter Mode (F1-F6)</span>
          </Button>
          <Button
            variant="outline"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="rounded-full border-brand-mitti hover:bg-red-50 text-red-600 text-xs font-semibold px-4 h-10 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Bill</span>
          </Button>
        </div>
      </div>

      {/* Main POS Workspace (Grid: Left Catalog, Right Active Cart Slip) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* =========================================================
            LEFT SECTION: SEARCH, CATEGORIES & PRODUCT GRID
        ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          
          {/* Search bar & Category filter */}
          <div className="space-y-3.5 bg-white p-5 rounded-3xl border-2 border-brand-mitti shadow-sm">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
              <Input
                data-testid="pos-product-search"
                placeholder="Search products by name or category (e.g. Atta, Oil, Milk)..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-12 pr-4 h-13 rounded-2xl border-2 border-brand-mitti focus-visible:border-brand-terracotta bg-brand-sand/50 text-base text-brand-indigo"
              />
              {q && (
                <button 
                  onClick={() => setQ("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-indigo/50 hover:text-brand-indigo"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Scroll Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      isActive 
                        ? "bg-brand-indigo text-white border-brand-indigo shadow-xs" 
                        : "bg-brand-sand/60 hover:bg-brand-mitti/60 text-brand-indigo/70 border-brand-mitti"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-brand-mitti p-8">
                <ShoppingBag className="w-12 h-12 text-brand-indigo/30 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-lg text-brand-indigo">No products found</h3>
                <p className="text-xs text-brand-indigo/60 mt-1">Try a different search keyword or category.</p>
                <Button 
                  onClick={() => nav("/app/products")}
                  className="mt-4 rounded-full bg-brand-terracotta text-white text-xs font-bold"
                >
                  + Add New Product to Inventory
                </Button>
              </div>
            ) : (
              filtered.map((p) => {
                const inCart = cart.find(x => x.product_id === p.id);
                const isOutOfStock = !p.unlimited_stock && p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    data-testid={`pos-product-${p.id}`}
                    className={`relative rounded-3xl border-2 p-4 transition-all flex flex-col justify-between select-none ${
                      isOutOfStock 
                        ? "bg-brand-mitti/30 border-brand-mitti/60 opacity-60 cursor-not-allowed" 
                        : "bg-white border-brand-mitti hover:border-brand-indigo/40 hover:shadow-md active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    {/* Cart Quantity Badge on Product Card */}
                    {inCart && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-terracotta text-white font-extrabold text-xs grid place-items-center shadow-md border-2 border-white animate-bounce">
                        {inCart.qty}
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo/50 mb-1">
                        {p.category || "General"}
                      </div>
                      <h4 className="font-heading font-bold text-brand-indigo text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-mitti/60 flex items-center justify-between">
                      <span className="font-display font-bold text-lg text-brand-indigo">
                        {money(p.selling_price)}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.unlimited_stock ? "bg-brand-indigo/10 text-brand-indigo" :
                          p.stock <= 0 ? "bg-red-100 text-red-700" :
                          p.stock <= (p.min_stock || 5) ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {p.unlimited_stock ? <span className="inline-flex items-center gap-0.5"><InfinityIcon className="w-3 h-3" /> Prepared</span> : p.stock <= 0 ? "Out" : `${p.stock} left`}
                        </span>
                        
                        {!isOutOfStock && (
                          <span className="w-7 h-7 rounded-xl bg-brand-sand hover:bg-brand-terracotta hover:text-white grid place-items-center transition-colors text-brand-indigo">
                            <Plus className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* =========================================================
            RIGHT SECTION: INTERACTIVE BILL SLIP & CART REGISTER
        ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border-2 border-brand-mitti shadow-md p-6 lg:sticky lg:top-24 flex flex-col justify-between">
          
          <div>
            {/* Bill Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-mitti">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-indigo/50">ACTIVE BILL SLIP</span>
                <h3 className="font-display text-2xl font-bold text-brand-indigo mt-0.5">
                  Items ({cart.reduce((acc, it) => acc + it.qty, 0)})
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-sand border border-brand-mitti text-xs font-bold text-brand-indigo">
                Live POS
              </span>
            </div>

            {/* Customer Khata Selector */}
            <div className="mt-4 p-3.5 rounded-2xl bg-brand-sand border border-brand-mitti">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-brand-indigo/70 uppercase tracking-wider">
                  Customer / Khata
                </span>
                <button
                  onClick={() => setNewCustomer({ ...newCustomer, open: true })}
                  className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> + Add New
                </button>
              </div>

              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger data-testid="pos-customer-select" className="bg-white border-brand-mitti rounded-xl h-10 text-xs font-medium">
                  <SelectValue placeholder="Walk-in Customer (Cash / UPI)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in Customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.phone && `· ${c.phone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCustomerObj && (
                <div className="mt-2 pt-2 border-t border-brand-mitti/60 text-xs flex items-center justify-between text-brand-indigo/70">
                  <span>Customer selected:</span>
                  <span className="font-bold text-brand-indigo">{selectedCustomerObj.name}</span>
                </div>
              )}
            </div>

            {/* Itemized Cart List */}
            <div className="mt-4 space-y-2.5 max-h-[35vh] overflow-y-auto pr-1" data-testid="pos-cart">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-brand-indigo/50 text-xs">
                  <ShoppingBag className="w-8 h-8 opacity-30 mx-auto mb-2" />
                  Cart is empty. <br />Tap any product on the left to add.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div 
                    key={item.product_id}
                    className="p-3 rounded-2xl bg-brand-sand/50 border border-brand-mitti/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-brand-indigo text-xs truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-brand-indigo/60 font-mono mt-0.5">
                        {money(item.price)} × {item.qty}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-brand-mitti shadow-xs">
                      <button 
                        onClick={() => updateQty(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs w-5 text-center text-brand-indigo">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateQty(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-heading font-extrabold text-xs text-brand-indigo w-16 text-right">
                      {money(item.price * item.qty)}
                    </div>

                    <button 
                      onClick={() => removeItem(idx)}
                      className="text-brand-indigo/40 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discount */}
            <div className="mt-5 pt-4 border-t border-brand-mitti space-y-2.5 text-xs">
              <div className="flex justify-between text-brand-indigo/70 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-brand-indigo font-mono">{money(subtotal)}</span>
              </div>

              {/* Discount Row */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-brand-indigo/70 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-brand-terracotta" />
                  Discount
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-20 h-8 text-right rounded-lg border-brand-mitti text-xs"
                  />
                  <button
                    onClick={() => setDiscountType(prev => prev === "flat" ? "percent" : "flat")}
                    className="px-2 py-1 rounded-lg bg-brand-sand border border-brand-mitti font-bold text-[10px] text-brand-indigo"
                  >
                    {discountType === "flat" ? "₹ Flat" : "% Off"}
                  </button>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-brand-mitti flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest font-extrabold text-brand-terracotta">
                    Total Due
                  </span>
                  <div className="text-[10px] text-brand-indigo/50">Incl. all taxes</div>
                </div>
                <div className="font-display font-extrabold text-3xl text-brand-indigo tracking-tight">
                  {money(total)}
                </div>
              </div>
            </div>
          </div>

          {/* Proceed to Payment Button */}
          <div className="mt-6 pt-2">
            <Button
              disabled={cart.length === 0}
              onClick={() => {
                setMethod("cash");
                setAmountReceived(String(total));
                setPayOpen(true);
              }}
              data-testid="pos-proceed-payment"
              className="w-full h-14 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-base shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Complete Bill · {money(total)}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

        </div>

      </div>

      {/* =========================================================
          PAYMENT MODAL (Cash / UPI / Card / Udhaar)
      ========================================================= */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-2 border-brand-mitti">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center justify-between">
              <span>Payment Mode</span>
              <span className="font-display text-2xl text-brand-terracotta font-extrabold">{money(total)}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { id: "cash", label: "Cash", icon: Banknote, color: "bg-emerald-50 text-emerald-700" },
              { id: "upi", label: "UPI QR", icon: QrCode, color: "bg-blue-50 text-blue-700" },
              { id: "card", label: "Card", icon: CreditCard, color: "bg-purple-50 text-purple-700" },
              { id: "udhaar", label: "Udhaar", icon: Wallet, color: "bg-orange-50 text-brand-terracotta" },
            ].map((pm) => {
              const isSelected = method === pm.id;
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected 
                      ? "border-brand-terracotta bg-white shadow-sm" 
                      : "border-brand-mitti bg-brand-sand/50 hover:bg-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "text-brand-terracotta" : "text-brand-indigo/60"}`} />
                  <span className={`text-xs font-bold ${isSelected ? "text-brand-indigo" : "text-brand-indigo/70"}`}>
                    {pm.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CASH MODE SPECIFIC */}
          {method === "cash" && (
            <div className="mt-5 space-y-4">
              <div>
                <Label className="text-xs uppercase font-bold text-brand-indigo/70">
                  Amount Received from Customer
                </Label>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={String(total)}
                  className="mt-1.5 h-12 text-xl font-bold font-mono rounded-xl border-brand-mitti"
                />
              </div>

              {/* Quick Cash Denomination Buttons */}
              <div className="flex items-center gap-2">
                {[total, 100, 200, 500, 2000].filter(n => n >= total || n === total).map((amt, i) => (
                  <button
                    key={i}
                    onClick={() => setAmountReceived(String(amt))}
                    className="px-2.5 py-1 rounded-lg bg-brand-sand border border-brand-mitti text-xs font-bold hover:border-brand-indigo"
                  >
                    {amt === total ? "Exact" : `₹${amt}`}
                  </button>
                ))}
              </div>

              {/* Change Return Box */}
              {Number(amountReceived) > total && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase">Change to Return:</span>
                  <span className="font-display font-extrabold text-2xl text-emerald-700">
                    {money(Number(amountReceived) - total)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* UPI MODE SPECIFIC */}
          {method === "upi" && (
            <div className="mt-4 text-center space-y-3">
              <div className="text-xs text-brand-indigo/60 font-medium">Customer will scan & pay with any UPI App:</div>
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border-2 border-brand-mitti shadow-md grid place-items-center">
                {shop?.upi_qr_data_url ? (
                  <img src={shop.upi_qr_data_url} alt="UPI QR" className="w-full h-full object-contain" />
                ) : shop?.upi_id ? (
                  <img src={`${API_BASE}/upi/qr?amount=${total}`} alt="UPI QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="w-16 h-16 text-brand-indigo/40 mx-auto mb-2" />
                    <span className="text-xs text-brand-indigo/70 font-semibold">Ready for UPI Scan</span>
                  </div>
                )}
              </div>
              {shop?.upi_id && (
                <div className="text-xs font-mono font-bold text-brand-indigo bg-brand-sand py-1 px-3 rounded-full inline-block border border-brand-mitti">
                  UPI ID: {shop.upi_id}
                </div>
              )}
            </div>
          )}

          {/* UDHAAR MODE SPECIFIC */}
          {method === "udhaar" && (
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-terracotta shrink-0" />
                <span>This bill of <b>{money(total)}</b> will be added to the customer's pending Udhaar Khata.</span>
              </div>
              {!customerId || customerId === "none" ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                  Please select or add a Customer above to save as Udhaar.
                </div>
              ) : (
                <div className="text-xs text-brand-indigo/70">
                  Customer: <b>{selectedCustomerObj?.name}</b>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="ghost"
              onClick={() => setPayOpen(false)}
              className="rounded-full text-brand-indigo/60"
            >
              Cancel
            </Button>
            <Button
              disabled={busy || (method === "udhaar" && (!customerId || customerId === "none"))}
              onClick={handleCompleteBill}
              className="rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold flex-1 h-12 shadow-md"
            >
              {busy ? "Generating Bill..." : "Confirm & Save Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          POST-BILL CELEBRATION & PRINT DIALOG (AUTO-RESET READY)
      ========================================================= */}
      <Dialog open={!!completedBill} onOpenChange={(o) => !o && handleManualReset()}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-2 border-brand-mitti text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <DialogTitle className="font-display text-3xl font-extrabold text-brand-indigo">
            Bill Ready!
          </DialogTitle>
          <p className="text-sm text-brand-indigo/70 mt-1">
            Bill <b>#{completedBill?.order_no}</b> created successfully.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-brand-sand border border-brand-mitti text-left space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span>Total Paid:</span>
              <span className="font-bold text-base text-brand-indigo">{money(completedBill?.total)}</span>
            </div>
            <div className="flex justify-between text-brand-indigo/60">
              <span>Payment Mode:</span>
              <span className="uppercase font-bold">{completedBill?.payment_method}</span>
            </div>
            {completedBill?.change > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-brand-mitti/60">
                <span>Change Returned:</span>
                <span>{money(completedBill.change)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <Button
              onClick={() => {
                if (completedBill?.id) nav(`/app/orders/${completedBill.id}`);
              }}
              className="w-full h-12 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> View Printable Invoice
            </Button>

            <Button
              variant="outline"
              onClick={handleManualReset}
              className="w-full h-12 rounded-full border-2 border-brand-mitti hover:border-brand-indigo text-brand-indigo font-bold text-sm"
            >
              + New Bill (Next Customer)
            </Button>
          </div>

          <div className="mt-4 text-[11px] text-brand-indigo/60 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Preparing next bill automatically in 3 seconds...</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          NEW CUSTOMER MODAL
      ========================================================= */}
      <Dialog open={newCustomer.open} onOpenChange={(o) => setNewCustomer({ ...newCustomer, open: o })}>
        <DialogContent className="max-w-sm rounded-3xl p-6 border-2 border-brand-mitti">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-brand-indigo">Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70">Full Name</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="e.g. Ramesh Bhai"
                className="rounded-xl border-brand-mitti mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70">Phone Number (10 Digits)</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="e.g. 9825100000"
                className="rounded-xl border-brand-mitti mt-1"
              />
            </div>
          </div>
          <DialogFooter className="mt-5 gap-2">
            <Button variant="ghost" onClick={() => setNewCustomer({ open: false, name: "", phone: "" })}>
              Cancel
            </Button>
            <Button onClick={createCustomer} className="rounded-full bg-brand-terracotta text-white font-bold">
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
