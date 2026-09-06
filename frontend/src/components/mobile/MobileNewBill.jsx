import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Check, 
  Trash2, 
  Printer, 
  Share2, 
  Barcode, 
  Percent, 
  Banknote, 
  QrCode, 
  Wallet,
  Sparkles,
  Camera,
  User,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import MobileThermalReceiptModal from "./MobileThermalReceiptModal";
import MobileBarcodeScannerModal from "./MobileBarcodeScannerModal";
import { playVoiceSoundbox } from "@/lib/soundbox";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";

export default function MobileNewBill({ onBack, onTabChange, merchantData }) {
  const [products, setProducts] = useState(() => getStoredProducts());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("Ramesh Sharma");
  const [customerPhone, setCustomerPhone] = useState("9825123456");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState("");
  const [completedBill, setCompletedBill] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  // Sync products on mount
  useEffect(() => {
    setProducts(getStoredProducts());
  }, []);

  const categories = ["All", "Kirana & Grains", "Dairy & Eggs", "Biscuits & Snacks", "Beverages & Tea", "Spices & Masala", "Household & Soaps"];

  const filteredProducts = products.filter((p) => {
    const pName = p.name || "";
    const pCat = p.category || "General";
    const matchesCat = selectedCat === "All" || pCat.toLowerCase().includes(selectedCat.toLowerCase());
    const matchesSearch = pName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getProductPrice = (p) => p.price || p.selling_price || 0;

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

  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((item) => String(item.id) === String(id));
    return sum + (p ? getProductPrice(p) * qty : 0);
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeToReturn = cashTendered ? Math.max(0, parseFloat(cashTendered) - grandTotal) : 0;

  const handleProductScanned = (scannedProduct) => {
    let target = products.find(
      (p) =>
        String(p.id) === String(scannedProduct.id) ||
        (p.barcode && String(p.barcode) === String(scannedProduct.barcode)) ||
        p.name.toLowerCase() === scannedProduct.name.toLowerCase()
    );

    if (!target) {
      target = {
        id: scannedProduct.id || "prod_" + Date.now(),
        name: scannedProduct.name,
        selling_price: scannedProduct.price || 50,
        purchase_price: Math.round((scannedProduct.price || 50) * 0.8),
        stock: 25,
        min_stock: 5,
        category: scannedProduct.category || "Grocery",
      };
      const updatedList = [target, ...products];
      setProducts(updatedList);
      saveStoredProducts(updatedList);
    }

    updateQty(target.id, 1);
  };

  const handleCreateBill = () => {
    if (totalItemsCount === 0) {
      toast.error("Cart is empty. Please add items first.");
      return;
    }

    const itemsList = Object.entries(cart).map(([id, qty]) => {
      const p = products.find((item) => String(item.id) === String(id));
      const rate = p ? getProductPrice(p) : 0;
      return {
        name: p ? p.name : "Item",
        qty,
        rate,
        total: rate * qty,
      };
    });

    const billId = `B${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const billRecord = {
      id: `#${billId}`,
      date: dateStr,
      customer: customerName || "Walk-in Guest",
      customerPhone: customerPhone || "9825123456",
      payment: paymentMode,
      discount: discountAmount,
      itemsList,
      total: grandTotal,
      items_count: totalItemsCount,
      source: "mobile",
      channel: "Mobile POS",
      status: paymentMode === "Udhaar" ? "pending" : "completed",
      created_at: now.toISOString(),
    };

    // 1. Deduct Stock in persistent products store
    try {
      const stored = getStoredProducts();
      const updated = stored.map((p) => {
        const qtyBought = cart[p.id] || 0;
        if (qtyBought > 0 && !p.unlimited_stock) {
          const curStock = p.stock !== undefined ? p.stock : 10;
          return { ...p, stock: Math.max(0, curStock - qtyBought) };
        }
        return p;
      });
      saveStoredProducts(updated);
      setProducts(updated);
    } catch (e) {
      console.warn("Stock deduction fallback:", e);
    }

    // 2. Persist order in dukaan_orders
    try {
      const savedOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      localStorage.setItem("dukaan_orders", JSON.stringify([billRecord, ...savedOrders]));
    } catch (e) {
      console.warn("Order persistence fallback:", e);
    }

    // 3. Update Customer & Udhaar Ledger
    try {
      let customers = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
      const cleanPhone = (customerPhone || "").trim();
      const cIdx = customers.findIndex((c) => c.phone === cleanPhone || c.name === customerName);

      if (cIdx >= 0) {
        customers[cIdx].bills = (customers[cIdx].bills || 0) + 1;
        customers[cIdx].totalSpent = (customers[cIdx].totalSpent || 0) + grandTotal;
        if (paymentMode === "Udhaar") {
          customers[cIdx].udhaar = (customers[cIdx].udhaar || 0) + grandTotal;
        }
      } else if (cleanPhone || customerName) {
        customers.push({
          id: "cust_" + Date.now(),
          name: customerName || "Customer",
          phone: cleanPhone || "9876543210",
          bills: 1,
          totalSpent: grandTotal,
          udhaar: paymentMode === "Udhaar" ? grandTotal : 0,
          address: "Navsari",
        });
      }
      localStorage.setItem("dukaan_customers", JSON.stringify(customers));
    } catch (e) {
      console.warn("Customer ledger fallback:", e);
    }

    // 4. Play Voice Soundbox chime (Paytm / PhonePe Soundbox)
    try {
      playVoiceSoundbox(grandTotal, paymentMode.toLowerCase(), "en");
    } catch {}

    setCompletedBill(billRecord);
    setCart({});
    toast.success(`Bill #${billId} generated & inventory updated!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-32 select-none relative">
      
      {/* Thermal Receipt Modal on Bill Completion */}
      <MobileThermalReceiptModal
        isOpen={Boolean(completedBill)}
        billData={completedBill}
        merchantData={merchantData}
        onClose={() => setCompletedBill(null)}
      />

      {/* Real Camera Barcode Scanner Modal */}
      <MobileBarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductScanned={handleProductScanned}
        catalog={products}
      />

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
              <h1 className="text-base font-black text-slate-900 leading-tight">Mobile Counter POS</h1>
              <p className="text-[11px] font-semibold text-slate-400">Quick 2-Second Checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="px-3 py-1.5 bg-[#0066FF] hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items or tap scan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
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

      {/* Customer Quick Input Card */}
      <div className="p-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer Details</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Khata / Udhaar Synced</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Mobile Number"
              className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
            />
          </div>
        </div>
      </div>

      {/* Product Grid / List */}
      <div className="px-4 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Store Catalog ({filteredProducts.length} items)
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredProducts.map((p) => {
            const qty = cart[p.id] || 0;
            const price = getProductPrice(p);
            return (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-[#0066FF]">₹ {price}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{p.category || "General"}</span>
                    {p.stock !== undefined && (
                      <span className={`text-[10px] font-bold ${p.stock <= 5 ? "text-rose-500" : "text-slate-400"}`}>
                        · {p.stock} left
                      </span>
                    )}
                  </div>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => updateQty(p.id, 1)}
                    className="px-4 py-1.5 rounded-xl bg-blue-50 text-[#0066FF] hover:bg-blue-100 font-black text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD</span>
                  </button>
                ) : (
                  <div className="flex items-center bg-[#0066FF] text-white rounded-xl shadow-xs overflow-hidden">
                    <button
                      onClick={() => updateQty(p.id, -1)}
                      className="p-1.5 hover:bg-blue-700 active:scale-90 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-black select-none">{qty}</span>
                    <button
                      onClick={() => updateQty(p.id, 1)}
                      className="p-1.5 hover:bg-blue-700 active:scale-90 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Dock & Checkout Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl">
          <div className="space-y-2.5">
            {/* Payment Mode Selector */}
            <div className="flex items-center justify-between gap-1.5">
              {[
                { id: "Cash", icon: Banknote },
                { id: "UPI", icon: QrCode },
                { id: "Udhaar", icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMode(m.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? "bg-[#0066FF] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Total and Print Bill Action Button */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"} in Cart
                </div>
                <div className="text-xl font-black text-slate-900">₹ {grandTotal}</div>
              </div>

              <button
                onClick={handleCreateBill}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>FINISH BILL & PRINT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dock Nav */}
      <MobileBottomNav activeTab="billing" onTabChange={onTabChange} />
    </div>
  );
}
