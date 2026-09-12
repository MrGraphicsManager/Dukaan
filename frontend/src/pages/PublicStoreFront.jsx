import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Phone, 
  MapPin, 
  Send, 
  ArrowRight, 
  CheckCircle,
  Truck,
  Store,
  Clock,
  Sparkles
} from "lucide-react";
import { DEFAULT_PRODUCTS_LIST } from "@/lib/defaultProducts";

export default function PublicStoreFront() {
  const { shopSlug } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer order info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("delivery"); // delivery | pickup
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Load store profile and products from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
      const localProducts = JSON.parse(localStorage.getItem("dukaan_products") || "null");
      
      const sName = user.store_name || user.business_name || (shopSlug ? decodeURIComponent(shopSlug) : "Dukaan Superstore");
      setStoreData({
        name: sName,
        phone: user.phone || "919876543210",
        address: user.address || "Main Bazaar, City Center",
        upiId: user.upi_id || "merchant@upi"
      });

      if (Array.isArray(localProducts) && localProducts.length > 0) {
        setProducts(localProducts);
      } else {
        setProducts(DEFAULT_PRODUCTS_LIST);
      }
    } catch {
      setProducts(DEFAULT_PRODUCTS_LIST);
      setStoreData({
        name: "Dukaan Superstore",
        phone: "919876543210",
        address: "Main Market Road",
        upiId: "merchant@upi"
      });
    }
  }, [shopSlug]);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode || "").includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.selling_price || product.price || 0),
          quantity: 1,
          image: product.image_url
        }
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrderWhatsApp = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
      alert("Please provide your name and phone number");
      return;
    }

    const cleanPhone = (storeData?.phone || "919876543210").replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

    const itemsText = cart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.name}* × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(0)}`
      )
      .join("\n");

    const message = `🛍️ *NEW ORDER via Dukaan Online Store*
━━━━━━━━━━━━━━━━━━━
🏪 *Store:* ${storeData?.name}
👤 *Customer:* ${customerName} (${customerPhone})
🛵 *Order Mode:* ${deliveryMode === "delivery" ? "Home Delivery 🚚" : "Store Counter Pickup 🏬"}
${deliveryMode === "delivery" ? `📍 *Address:* ${address || "Provided on call"}\n` : ""}
━━━━━━━━━━━━━━━━━━━
*Items Ordered:*
${itemsText}
━━━━━━━━━━━━━━━━━━━
💰 *Total Payable:* ₹${cartTotal.toFixed(0)}
💳 *Payment:* Cash / UPI on ${deliveryMode === "delivery" ? "Delivery" : "Pickup"}

_Order placed via Dukaan 3.0 Omnichannel_`;

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    setOrderPlaced(true);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Order online directly from your local neighbourhood store · Superfast dispatch!</span>
      </div>

      {/* Store Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {storeData?.name || "Dukaan Superstore"}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" /> {storeData?.address || "Main Market"}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Clock className="w-3 h-3" /> Open Now
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">View Cart</span>
          {cartItemCount > 0 && (
            <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-extrabold">
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Order Placed Success Banner */}
        {orderPlaced && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-emerald-900">
                  Order Successfully Dispatched to Merchant via WhatsApp!
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The store is preparing your bill and order. They will confirm on your WhatsApp shortly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOrderPlaced(false)}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Order More Items
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">
              Available Items ({filteredProducts.length})
            </h2>
            <span className="text-xs text-slate-500">Live Counter Catalog</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No matching products found</div>
              <p className="text-xs text-slate-500 mt-1">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const inCart = cart.find((c) => c.id === prod.id);
                const price = Number(prod.selling_price || prod.price || 0);

                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-blue-500/40 p-4 flex flex-col justify-between transition-all hover:shadow-lg duration-200"
                  >
                    <div className="space-y-2">
                      <div className="w-full aspect-square rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-4xl">🛒</span>
                        )}
                        {prod.category && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs">
                            {prod.category}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition">
                          {prod.name}
                        </h3>
                        {prod.mrp && prod.mrp > price && (
                          <div className="text-xs text-slate-400 line-through mt-0.5">
                            MRP ₹{prod.mrp}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          ₹{price.toFixed(0)}
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1.5 border border-blue-600 rounded-xl bg-blue-50 p-1">
                          <button
                            onClick={() => updateQuantity(prod.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-blue-600 flex items-center justify-center text-xs font-bold shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-extrabold text-blue-900 px-1 font-mono">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(prod.id, 1)}
                            className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(prod)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Pill on Mobile */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-between shadow-2xl shadow-blue-600/40"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cartItemCount} Items in Cart</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-base font-extrabold">
              <span>₹{cartTotal.toFixed(0)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Your Order Cart ({cartItemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  Your cart is empty. Tap items to add!
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        ₹{item.price.toFixed(0)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs text-slate-600"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900 w-16 text-right">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details Form */}
            {cart.length > 0 && (
              <form onSubmit={handlePlaceOrderWhatsApp} className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
                {/* Delivery Mode Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("delivery")}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      deliveryMode === "delivery"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" /> Home Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("pickup")}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      deliveryMode === "pickup"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" /> Store Pickup
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Number (10 digits)"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  {deliveryMode === "delivery" && (
                    <input
                      type="text"
                      placeholder="Delivery Address / Flat / Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-500">Total Payable:</span>
                  <span className="text-xl font-extrabold font-mono text-blue-600">
                    ₹{cartTotal.toFixed(0)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" /> Place Order via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>Powered by Dukaan 3.0 · Retail Operating System</p>
        <p className="mt-1">
          <Link to="/" className="text-blue-600 hover:underline">
            Launch your own digital store on officialdukaan.in
          </Link>
        </p>
      </footer>
    </div>
  );
}
