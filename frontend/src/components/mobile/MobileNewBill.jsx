import React, { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import MobileBottomNav from "./MobileBottomNav";
import MobileThermalReceiptModal from "./MobileThermalReceiptModal";
import { playVoiceSoundbox } from "@/lib/soundbox";

const initialCatalog = [
  { id: 1, name: "Aashirvaad Shudh Chakki Atta 5kg", category: "Grocery", price: 245, stock: 18, unit: "bag" },
  { id: 2, name: "Amul Butter Pasteurized 100g", category: "Dairy", price: 56, stock: 24, unit: "pack" },
  { id: 3, name: "Tata Salt Vacuum Evaporated 1kg", category: "Grocery", price: 28, stock: 45, unit: "pack" },
  { id: 4, name: "Fortune Sunlite Sunflower Oil 1L", category: "Grocery", price: 165, stock: 12, unit: "pouch" },
  { id: 5, name: "Maggi 2-Minute Noodles 70g", category: "Snacks", price: 14, stock: 80, unit: "pack" },
  { id: 6, name: "Coca-Cola Original Taste 750ml", category: "Beverages", price: 40, stock: 4, unit: "bottle" },
  { id: 7, name: "Britannia Good Day Cookies", category: "Snacks", price: 30, stock: 35, unit: "pack" },
  { id: 8, name: "Parle-G Gold Biscuits 1kg", category: "Snacks", price: 75, stock: 20, unit: "pack" },
];

export default function MobileNewBill({ onBack, onTabChange, merchantData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [cart, setCart] = useState({ 1: 1, 2: 1 });
  const [customerName, setCustomerName] = useState("Ramesh Sharma");
  const [customerPhone, setCustomerPhone] = useState("9825123456");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState("");
  const [completedBill, setCompletedBill] = useState(null);

  const categories = ["All", "Grocery", "Dairy", "Snacks", "Beverages"];

  const filteredProducts = initialCatalog.filter((p) => {
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
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = initialCatalog.find((item) => item.id === parseInt(id, 10));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeToReturn = cashTendered ? Math.max(0, parseFloat(cashTendered) - grandTotal) : 0;

  const handleCreateBill = () => {
    if (totalItemsCount === 0) return;

    const itemsList = Object.entries(cart).map(([id, qty]) => {
      const p = initialCatalog.find((item) => item.id === parseInt(id, 10));
      return {
        name: p ? p.name : "Item",
        qty,
        rate: p ? p.price : 0,
        total: (p ? p.price : 0) * qty,
      };
    });

    const billRecord = {
      id: `#B${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      customer: customerName || "Walk-in Guest",
      customerPhone: customerPhone,
      payment: paymentMode,
      discount: discountAmount,
      itemsList,
      total: grandTotal,
    };

    // Play Voice Soundbox (like Paytm/PhonePe soundbox!)
    try {
      playVoiceSoundbox(grandTotal, paymentMode.toLowerCase(), "en");
    } catch {}

    setCompletedBill(billRecord);
    toast.success(`Bill ${billRecord.id} generated!`);
  };

  const handleScanSimulation = () => {
    // Simulate barcode beep & adding an FMCG product
    const randomProduct = initialCatalog[Math.floor(Math.random() * initialCatalog.length)];
    updateQty(randomProduct.id, 1);
    toast.success(`Scanned: ${randomProduct.name} (₹${randomProduct.price})`);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-32 select-none relative">
      
      {/* Thermal Receipt Modal on Bill Completion */}
      <MobileThermalReceiptModal
        isOpen={Boolean(completedBill)}
        onClose={() => {
          setCompletedBill(null);
          setCart({});
          if (onBack) onBack();
        }}
        billData={completedBill}
        merchantData={merchantData}
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
              <h1 className="text-base font-black text-slate-900 leading-tight">New Bill</h1>
              <p className="text-[11px] font-semibold text-slate-400">Terminal POS · Quick Billing</p>
            </div>
          </div>

          <button
            onClick={handleScanSimulation}
            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0066FF] font-extrabold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
          >
            <Barcode className="w-4 h-4" />
            <span>Scan</span>
          </button>
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
            maxLength={10}
            placeholder="Mobile Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
            className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
          />
        </div>

        {/* Search */}
        <div className="mt-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items or brand name..."
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
                    <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.2 rounded">
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

              {/* Stepper */}
              {qty === 0 ? (
                <button
                  onClick={() => updateQty(p.id, 1)}
                  className="px-3.5 py-1.5 bg-blue-50 text-[#0066FF] hover:bg-[#0066FF] hover:text-white rounded-xl text-xs font-black flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 rounded-xl p-1">
                  <button
                    onClick={() => updateQty(p.id, -1)}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-[#0066FF] w-4 text-center">
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

      {/* Floating Bottom Checkout Panel */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-900 text-white p-3.5 rounded-3xl shadow-2xl border border-slate-800 space-y-2.5">
            
            {/* Payment Method & Discount Selector */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              {/* Payment tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                {["Cash", "UPI", "Udhaar"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMode(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      paymentMode === m ? "bg-[#0066FF] text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Discount toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDiscountAmount(discountAmount > 0 ? 0 : 20)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    discountAmount > 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {discountAmount > 0 ? "₹20 OFF applied" : "+ Discount"}
                </button>
              </div>
            </div>

            {/* Total Row & CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center font-bold text-white shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400">
                    {totalItemsCount} items · {paymentMode}
                  </div>
                  <div className="text-base font-black text-white">
                    ₹ {grandTotal}{" "}
                    {discountAmount > 0 && <span className="text-xs line-through text-slate-500">₹{subtotal}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateBill}
                className="px-5 py-2.5 bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Bill</span>
                <Check className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <MobileBottomNav activeTab="billing" onTabChange={onTabChange} />
    </div>
  );
}
