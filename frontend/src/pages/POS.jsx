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
  Volume2,
  VolumeX,
  Share2,
  Crown,
  AlertTriangle,
  ChevronRight,
  X,
  Table as TableIcon,
  LayoutGrid,
  Minimize2,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  Clock
} from "lucide-react";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";
import { getStoredCustomers, saveStoredCustomers } from "@/pages/Customers";
import { useAuth } from "@/lib/AuthContext";
import { playVoiceSoundbox } from "@/lib/soundbox";
import { findFMCGByBarcode } from "@/lib/fmcgMasterCatalog";
import { 
  getProBillingSettings, 
  getProThemeSettings, 
  saveProThemeSettings, 
  getProLabsSettings 
} from "@/lib/proCustomizations";
import { 
  isCashierModeActive, 
  getActiveCashierName, 
  getCurrentShift, 
  endCurrentShift 
} from "@/lib/proStaffPermissions";

export default function POS() {
  const nav = useNavigate();
  const { lang, user, shops, currentShopId } = useAuth();
  const userPlan = user?.subscription?.plan || "starter";
  const isPremium = userPlan === "premium" || user?.is_premium || user?.is_admin;

  const [products, setProducts] = useState(() => getStoredProducts());
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]); // {product_id, name, price, qty, unit}
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat"); // "flat" or "percent"
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState(() => getStoredCustomers());
  const [shop, setShop] = useState(null);

  // Feature #45: Gating for Medical Store on Premium Plan
  const activeShop = (shops || []).find(s => s?.id === currentShopId) || shops?.[0];
  const shopCategory = (activeShop?.store_category || shop?.store_category || "").toLowerCase();
  const isMedicalStore = shopCategory.includes("medical") || shopCategory.includes("pharmacy");
  const canUseExpiryGuard = isPremium && isMedicalStore;
  
  // Soundbox audio state (Premium only)
  const [soundboxEnabled, setSoundboxEnabled] = useState(isPremium);

  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Completed bill & WhatsApp state
  const [completedBill, setCompletedBill] = useState(null);
  const [waPhone, setWaPhone] = useState("");
  const [autoResetTimer, setAutoResetTimer] = useState(null);

  // New Customer modal state
  const [newCustomer, setNewCustomer] = useState({ open: false, name: "", phone: "" });

  // Mobile Cart Slide-up Drawer state
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Dukaan Pro: View Mode & Cart Hold/Recall State
  const [posViewMode, setPosViewMode] = useState(() => {
    return getProThemeSettings(user?.email)?.pos_view || "grid";
  });
  const [heldCart, setHeldCart] = useState(() => {
    try {
      const raw = sessionStorage.getItem(`dukaan_held_cart_${currentShopId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Shift Handover Modal State (F9)
  const [shiftHandoverOpen, setShiftHandoverOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState("");

  const activeCashierName = isCashierModeActive() 
    ? getActiveCashierName(currentShopId) 
    : (user?.name || "Owner");

  const handleHoldCart = () => {
    if (cart.length === 0) {
      toast.info("Cart is empty. Add products before holding bill.");
      return;
    }
    const data = {
      cart: [...cart],
      customerId,
      discount,
      discountType,
      heldAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    };
    sessionStorage.setItem(`dukaan_held_cart_${currentShopId}`, JSON.stringify(data));
    setHeldCart(data);
    setCart([]);
    setDiscount(0);
    setCustomerId("");
    toast.success("⏸️ Current bill held! Ready for next customer. Press [F8] to recall.");
  };

  const handleRecallCart = () => {
    if (!heldCart || !Array.isArray(heldCart.cart) || heldCart.cart.length === 0) {
      toast.info("No held bill found to recall.");
      return;
    }
    setCart(heldCart.cart);
    if (heldCart.customerId) setCustomerId(heldCart.customerId);
    if (heldCart.discount) setDiscount(heldCart.discount);
    if (heldCart.discountType) setDiscountType(heldCart.discountType);
    sessionStorage.removeItem(`dukaan_held_cart_${currentShopId}`);
    setHeldCart(null);
    toast.success(`▶️ Held bill restored with ${heldCart.cart.length} items!`);
  };

  useEffect(() => {
    const handlePosShortcuts = (e) => {
      // F7: Hold Cart
      if (e.key === "F7") {
        e.preventDefault();
        handleHoldCart();
      }
      // F8: Recall Cart
      else if (e.key === "F8") {
        e.preventDefault();
        handleRecallCart();
      }
      // F9: Shift Handover
      else if (e.key === "F9") {
        e.preventDefault();
        setShiftHandoverOpen(true);
      }
    };
    window.addEventListener("keydown", handlePosShortcuts);
    return () => window.removeEventListener("keydown", handlePosShortcuts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, customerId, discount, discountType, heldCart, currentShopId]);

  // Shift Handover Computation (F9)
  const currentShift = getCurrentShift() || {
    cashier_name: activeCashierName,
    started_at: new Date().toISOString(),
    opening_cash: 0
  };

  const shiftOrders = useMemo(() => {
    try {
      const orders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      const startTime = currentShift?.started_at ? new Date(currentShift.started_at).getTime() : 0;
      return orders.filter(o => {
        const orderTime = o.created_at ? new Date(o.created_at).getTime() : 0;
        return orderTime >= startTime;
      });
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShift?.started_at, shiftHandoverOpen]);

  const shiftStats = useMemo(() => {
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let udhaarSales = 0;

    shiftOrders.forEach(o => {
      const amt = Number(o.total || 0);
      const m = (o.payment_method || "cash").toLowerCase();
      if (m === "cash") cashSales += amt;
      else if (m === "upi" || m === "qr") upiSales += amt;
      else if (m === "card") cardSales += amt;
      else if (m === "udhaar") udhaarSales += amt;
      else cashSales += amt;
    });

    const totalSales = cashSales + upiSales + cardSales + udhaarSales;
    const openingCash = Number(currentShift?.opening_cash || 0);
    const expectedCash = openingCash + cashSales;
    const countedCash = countedCashInput === "" ? expectedCash : Number(countedCashInput) || 0;
    const variance = countedCash - expectedCash;

    return {
      cashSales,
      upiSales,
      cardSales,
      udhaarSales,
      totalSales,
      totalBills: shiftOrders.length,
      openingCash,
      expectedCash,
      countedCash,
      variance
    };
  }, [shiftOrders, currentShift?.opening_cash, countedCashInput]);

  const handlePrintHandoverSlip = () => {
    const shopName = shop?.name || activeShop?.name || "Apni Dukaan";
    const shopPhone = shop?.phone || activeShop?.phone || "";
    const printWin = window.open("", "_blank", "width=380,height=600");
    if (!printWin) {
      toast.error("Please allow popups to print shift handover slip.");
      return;
    }

    const varianceText = shiftStats.variance === 0 
      ? "PERFECT (BALANCED)" 
      : shiftStats.variance > 0 
        ? `+Rs.${shiftStats.variance.toFixed(2)} SURPLUS (EXTRA)` 
        : `-Rs.${Math.abs(shiftStats.variance).toFixed(2)} SHORTAGE (KAM)`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shift Handover - ${activeCashierName}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 14px; width: 80mm; }
            .center { text-align: center; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            .bold { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            td { padding: 2px 0; }
            .right { text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold" style="font-size: 16px;">${shopName}</div>
          <div class="center" style="font-size: 11px;">${shopPhone}</div>
          <div class="dashed"></div>
          <div class="center bold">SHIFT HANDOVER REPORT</div>
          <div class="center" style="font-size: 11px;">Cashier: ${activeCashierName}</div>
          <div class="center" style="font-size: 10px;">Shift: ${new Date(currentShift?.started_at || Date.now()).toLocaleTimeString("en-IN")} to ${new Date().toLocaleTimeString("en-IN")}</div>
          <div class="dashed"></div>
          <table>
            <tr><td>Total Bills Issued:</td><td class="right bold">${shiftStats.totalBills}</td></tr>
            <tr><td>Total Revenue:</td><td class="right bold">Rs. ${shiftStats.totalSales.toFixed(2)}</td></tr>
            <tr><td colspan="2" class="dashed"></td></tr>
            <tr><td>Opening Drawer Float:</td><td class="right">Rs. ${shiftStats.openingCash.toFixed(2)}</td></tr>
            <tr><td>Cash Collected:</td><td class="right">Rs. ${shiftStats.cashSales.toFixed(2)}</td></tr>
            <tr><td>Digital / UPI:</td><td class="right">Rs. ${shiftStats.upiSales.toFixed(2)}</td></tr>
            <tr><td>Card / Other:</td><td class="right">Rs. ${shiftStats.cardSales.toFixed(2)}</td></tr>
            <tr><td>Udhaar / Credit:</td><td class="right">Rs. ${shiftStats.udhaarSales.toFixed(2)}</td></tr>
            <tr><td colspan="2" class="dashed"></td></tr>
            <tr><td class="bold">Expected Drawer Cash:</td><td class="right bold">Rs. ${shiftStats.expectedCash.toFixed(2)}</td></tr>
            <tr><td class="bold">Actual Counted Cash:</td><td class="right bold">Rs. ${shiftStats.countedCash.toFixed(2)}</td></tr>
            <tr style="font-size: 13px;"><td class="bold">Variance Status:</td><td class="right bold">${varianceText}</td></tr>
          </table>
          <div class="dashed"></div>
          <br/><br/>
          <table style="margin-top: 15px;">
            <tr>
              <td class="center" style="width: 50%;">________________<br/>Cashier Signature</td>
              <td class="center" style="width: 50%;">________________<br/>Owner Signature</td>
            </tr>
          </table>
          <div class="dashed"></div>
          <div class="center" style="font-size: 10px; margin-top: 6px;">
            Dukaan Pro Security & Shift Ledger
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleShareShiftWhatsApp = () => {
    const shopName = shop?.name || activeShop?.name || "Apni Dukaan";
    const varianceStatus = shiftStats.variance === 0 
      ? "✅ Balanced (0 Variance)" 
      : shiftStats.variance > 0 
        ? `🟢 +₹${shiftStats.variance.toFixed(2)} Surplus (Extra)` 
        : `🔴 -₹${Math.abs(shiftStats.variance).toFixed(2)} Shortage (Kam)`;

    const msg = `📊 *SHIFT HANDOVER REPORT*\\n` +
      `*Store:* ${shopName}\\n` +
      `*Cashier:* ${activeCashierName}\\n` +
      `*Shift:* ${new Date(currentShift?.started_at || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}\\n` +
      `------------------------------\\n` +
      `• Bills Issued: ${shiftStats.totalBills}\\n` +
      `• Total Revenue: ₹${shiftStats.totalSales.toFixed(2)}\\n` +
      `• Cash Collected: ₹${shiftStats.cashSales.toFixed(2)}\\n` +
      `• Digital / UPI: ₹${shiftStats.upiSales.toFixed(2)}\\n` +
      `------------------------------\\n` +
      `💵 *Opening Cash:* ₹${shiftStats.openingCash.toFixed(2)}\\n` +
      `📥 *Expected Cash:* ₹${shiftStats.expectedCash.toFixed(2)}\\n` +
      `🤝 *Counted Cash:* ₹${shiftStats.countedCash.toFixed(2)}\\n` +
      `⚖️ *Variance:* ${varianceStatus}\\n` +
      `------------------------------\\n` +
      `_Logged via Dukaan Pro POS_`;

    const ownerPhone = (shop?.phone || activeShop?.phone || "").replace(/\\D/g, "");
    const url = `https://wa.me/${ownerPhone ? `91${ownerPhone}` : ""}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp with Shift Report...");
  };

  const handleFinalizeShift = () => {
    endCurrentShift(currentShopId, {
      ...shiftStats,
      shift_duration: `${new Date(currentShift?.started_at || Date.now()).toLocaleTimeString("en-IN")} - ${new Date().toLocaleTimeString("en-IN")}`
    });
    setShiftHandoverOpen(false);
    toast.success("✅ Shift closed successfully! Counter locked.");
  };

  useEffect(() => {
    api.get("/products")
      .then(r => setProducts(Array.isArray(r.data) && r.data.length > 0 ? r.data : getStoredProducts()))
      .catch(() => setProducts(getStoredProducts()));

    let localCusts = [];
    try {
      const raw = localStorage.getItem("dukaan_customers");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localCusts = parsed;
      }
    } catch {}

    api.get("/customers")
      .then(r => {
        const serverCusts = Array.isArray(r.data) ? r.data : [];
        const merged = [...serverCusts];
        localCusts.forEach(lc => {
          if (!merged.some(m => (m.id && m.id === lc.id) || (m.phone && lc.phone && m.phone === lc.phone))) {
            merged.push(lc);
          }
        });
        setCustomers(merged.length > 0 ? merged : localCusts);
      })
      .catch(() => setCustomers(localCusts));

    api.get("/shops").then(r => {
      const shopId = localStorage.getItem("dukaan_shop_id");
      const list = Array.isArray(r.data) ? r.data : [];
      setShop(list.find(s => s.id === shopId) || list[0]);
    });

    const handleProds = () => setProducts(getStoredProducts());
    const handleCusts = () => setCustomers(getStoredCustomers());
    window.addEventListener("dukaan_products_updated", handleProds);
    window.addEventListener("dukaan_customers_updated", handleCusts);
    return () => {
      window.removeEventListener("dukaan_products_updated", handleProds);
      window.removeEventListener("dukaan_customers_updated", handleCusts);
    };
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
    const isUnlimited = p.unlimited_stock === true;
    const availableStock = Number(p.stock !== undefined ? p.stock : 9999);

    if (!isUnlimited && availableStock <= 0) {
      toast.error(`"${p.name}" is out of stock!`);
      return;
    }

    // Feature #45: Expiry verification on item scan / addition
    if (canUseExpiryGuard && p.expiry_date) {
      const exp = new Date(p.expiry_date);
      if (!isNaN(exp.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expZero = new Date(exp);
        expZero.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expZero.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          toast.error(`⚠️ EXPIRED MEDICINE ALERT: "${p.name}" expired ${Math.abs(diffDays)} days ago (${p.expiry_date}). Do not dispense!`, {
            duration: 6000
          });
        } else if (diffDays <= 30) {
          toast.warning(`⚠️ NEAR EXPIRY WARNING: "${p.name}" expires in ${diffDays} days (${p.expiry_date}).`, {
            duration: 4000
          });
        }
      }
    }

    setCart(prev => {
      const idx = prev.findIndex(x => x.product_id === p.id);
      if (idx >= 0) {
        const currentQty = prev[idx].qty;
        if (!isUnlimited && currentQty >= availableStock) {
          toast.warning(`Cannot add more! Only ${availableStock} units available in stock for ${p.name}.`);
          return prev;
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: currentQty + 1 };
        return copy;
      }
      return [...prev, { 
        product_id: p.id, 
        name: p.name, 
        price: p.selling_price, 
        qty: 1, 
        category: p.category,
        batch_number: p.batch_number || "",
        expiry_date: p.expiry_date || "",
        max_stock: isUnlimited ? 99999 : availableStock,
        unlimited_stock: isUnlimited
      }];
    });
  };

  const updateQty = (idx, delta) => {
    setCart(prev => {
      const item = prev[idx];
      if (!item) return prev;
      const copy = [...prev];
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      if (delta > 0) {
        const prod = products.find(p => p.id === item.product_id);
        const isUnlimited = prod?.unlimited_stock === true || item.unlimited_stock === true;
        const maxLimit = isUnlimited ? 99999 : Number(prod?.stock ?? item.max_stock ?? 9999);
        if (!isUnlimited && newQty > maxLimit) {
          toast.warning(`Cannot exceed available stock (${maxLimit} units) for ${item.name}!`);
          return prev;
        }
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

  const createCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    const newC = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      notes: "Added from POS",
      total_purchases: 0,
      totalSpent: 0,
      total_paid: 0,
      total_pending: 0,
      udhaar: 0,
      created_at: new Date().toISOString()
    };

    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
    } catch {}
    const updated = [newC, ...stored];
    saveStoredCustomers(updated);

    setCustomers(prev => [newC, ...prev]);
    setCustomerId(newC.id);
    setNewCustomer({ open: false, name: "", phone: "" });
    toast.success(`⚡ Customer "${newC.name}" added and selected!`);

    api.post("/customers", newC).then(res => {
      if (res?.data?.id) {
        newC.id = res.data.id;
        try {
          const cur = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
          const idx = cur.findIndex(c => c.phone === newC.phone || c.id === newC.id);
          if (idx !== -1) {
            cur[idx].id = res.data.id;
            saveStoredCustomers(cur);
          }
        } catch {}
      }
    }).catch(() => {});
  };

  // Pricing math
  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const discountAmount = discountType === "percent" 
    ? Math.round((subtotal * Number(discount || 0)) / 100)
    : Number(discount || 0);
  const total = Math.max(0, subtotal - discountAmount);

  // Selected customer details
  const selectedCustomerObj = customers.find(c => c.id === customerId);

  const deductStockAndSync = (cartItems) => {
    const currentProds = getStoredProducts();
    const updated = currentProds.map(p => {
      const item = cartItems.find(ci => ci.product_id === p.id);
      if (item && !p.unlimited_stock) {
        const newStock = Math.max(0, Number(p.stock || 0) - Number(item.qty || 0));
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveStoredProducts(updated);
    setProducts(updated);
  };

  const updateCustomerLedger = (orderData) => {
    if (!selectedCustomerObj && !customerId) return;
    try {
      const stored = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
      const cId = customerId || selectedCustomerObj?.id;
      const updated = stored.map(c => {
        if (c.id === cId || (orderData.customer_phone && c.phone === orderData.customer_phone)) {
          const tot = Number(orderData.total || 0);
          const isUdhaar = orderData.payment_method === "udhaar";
          const newPending = Number(c.total_pending || c.udhaar || 0) + (isUdhaar ? tot : 0);
          const newPurchases = Number(c.total_purchases || c.totalSpent || 0) + tot;
          return {
            ...c,
            total_purchases: newPurchases,
            totalSpent: newPurchases,
            total_paid: Number(c.total_paid || 0) + (isUdhaar ? 0 : tot),
            total_pending: newPending,
            udhaar: newPending,
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });
      saveStoredCustomers(updated);
    } catch {}
  };

  // Bill submission (0.001s instant save)
  const handleCompleteBill = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (method === "udhaar" && !customerId) {
      toast.error("Please select a customer for Udhaar");
      return;
    }

    const orderId = `ord_${Date.now()}`;
    const orderNo = `OD-${Date.now().toString().slice(-4)}`;
    const now = new Date();

    const order = {
      id: orderId,
      order_no: orderNo,
      total,
      subtotal,
      discount: discountAmount,
      payment_method: method,
      status: method === "udhaar" ? "udhaar" : "paid",
      pending_amount: method === "udhaar" ? total : 0,
      paid_amount: method === "udhaar" ? 0 : total,
      customer_id: customerId || null,
      customer_name: selectedCustomerObj?.name || "Walk-in Customer",
      customer_phone: selectedCustomerObj?.phone || "",
      created_at: now.toISOString(),
      items: cart,
      change: method === "cash" && Number(amountReceived) > total ? Number(amountReceived) - total : 0,
      billed_by: activeCashierName
    };

    const billData = {
      order_no: orderNo,
      id: orderId,
      total,
      payment_method: method,
      items: cart,
      customer_name: selectedCustomerObj?.name || "Walk-in Customer",
      customer_phone: selectedCustomerObj?.phone || "",
      change: order.change,
      billed_by: activeCashierName
    };

    // ⚡ STEP 1: INSTANT LOCAL SAVE IN 0.001 SEC
    const savedOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
    const updatedOrders = [order, ...savedOrders];
    localStorage.setItem("dukaan_orders", JSON.stringify(updatedOrders));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dukaan_orders_updated", { detail: updatedOrders }));
    }

    // Deduct purchased items from stock immediately
    deductStockAndSync(cart);
    // Update customer ledger immediately
    updateCustomerLedger(order);

    setPayOpen(false);
    setCompletedBill(billData);
    setWaPhone(selectedCustomerObj?.phone || "");

    toast.success(`⚡ Bill #${orderNo} created successfully!`);

    // Soundbox voice announcement (Premium only)
    const isChimeMuted = localStorage.getItem("dukaan_payment_alert_chime") === "false";
    if (soundboxEnabled && isPremium && !isChimeMuted) {
      playVoiceSoundbox(total, method, lang);
    }

    // Auto-reset after 6 seconds for next customer
    const timer = setTimeout(() => {
      setCompletedBill(null);
      clearCart();
    }, 6000);
    setAutoResetTimer(timer);

    // ⚡ STEP 2: ASYNC SERVER SYNC (FIRE-AND-FORGET)
    const payload = {
      items: cart,
      discount: Number(discountAmount || 0),
      customer_id: customerId || null,
      payment_method: method,
      amount_received: method === "cash" ? Number(amountReceived || total) : null,
    };

    api.post("/orders", payload).then(res => {
      if (res?.data?.id) {
        try {
          const list = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
          const idx = list.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            list[idx].id = res.data.id;
            if (res.data.order_no) list[idx].order_no = res.data.order_no;
            localStorage.setItem("dukaan_orders", JSON.stringify(list));
          }
        } catch {}
      }
    }).catch(() => {});
  };

  const handleSendWhatsAppBill = (billToShare) => {
    const b = billToShare || completedBill;
    if (!b) return;
    const phone = (waPhone || b.customer_phone || "").replace(/\D/g, "");
    const shopName = shop?.name || "Apni Dukaan";
    const itemsText = (b.items || []).map(it => `• ${it.name} x ${it.qty} = ₹${Number(it.price || it.selling_price || 0) * Number(it.qty || 1)}`).join("\n");
    const msg = `🧾 *${shopName}* — Digital Cash Memo\n` +
      `Bill #${b.order_no}\n` +
      `------------------------------\n` +
      `${itemsText}\n` +
      `------------------------------\n` +
      `*Grand Total: ₹${b.total}*\n` +
      `Paid Via: ${b.payment_method?.toUpperCase()}\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")}\n\n` +
      `Thank you for shopping with us! Please visit again. 🙏\n` +
      `_Powered by Dukaan · A PEAN Product_`;

    const url = `https://wa.me/${phone ? `91${phone}` : ""}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp...");
  };

  // Feature 16 & Dukaan Pro Custom Billing: Master Thermal & Custom Receipt Engine
  const handlePrintReceipt = (billToPrint) => {
    const b = billToPrint || completedBill;
    if (!b) return;
    const proBilling = getProBillingSettings(currentShopId);
    const brandingEnabled = localStorage.getItem("dukaan_receipt_branding_enabled") !== "false";
    const shopName = shop?.name || activeShop?.name || "Apni Dukaan";
    const shopPhone = shop?.phone || activeShop?.phone || "";
    const tagline = proBilling?.tagline || "";
    const terms = proBilling?.terms_and_conditions || "";
    const showUpi = proBilling?.show_upi_qr;
    const isThermalCompact = proBilling?.template === "thermal_compact";
    const isTaxInvoice = proBilling?.template === "gst_tax";
    const isA4 = proBilling?.template === "modern_a4";

    const cust = customers.find(c => (c.id && c.id === b.customer_id) || (c.phone && b.customer_phone && c.phone === b.customer_phone));
    const prevUdhaar = cust ? Number(cust.total_pending || 0) : 0;

    const itemsHtml = (b.items || []).map(it => `
      <tr>
        <td style="padding: 3px 0; text-align: left;">${it.name} x${it.qty}</td>
        <td style="padding: 3px 0; text-align: right; font-family: monospace;">₹${Number(it.price || it.selling_price || 0) * Number(it.qty || 1)}</td>
      </tr>
    `).join("");

    const printWin = window.open("", "_blank", isA4 ? "width=800,height=900" : "width=380,height=600");
    if (!printWin) {
      toast.error("Please allow popups to print thermal receipts.");
      return;
    }

    const printWidth = isA4 ? "210mm" : isThermalCompact ? "58mm" : "80mm";
    const fontSize = isThermalCompact ? "11px" : isA4 ? "14px" : "12px";

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${b.order_no}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: ${fontSize}; color: #000; width: ${printWidth}; }
              .center { text-align: center; }
              .dashed { border-top: 1px dashed #000; margin: 8px 0; }
              .bold { font-weight: bold; }
            }
            body { font-family: 'Courier New', Courier, monospace; font-size: ${fontSize}; margin: 0; padding: 14px; width: ${printWidth}; max-width: ${isA4 ? "100%" : "80mm"}; }
            .center { text-align: center; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            .bold { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: ${fontSize}; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold" style="font-size: ${isA4 ? '20px' : '16px'};">${shopName}</div>
          ${tagline ? `<div class="center" style="font-size: 11px; font-style: italic; color: #444;">${tagline}</div>` : ""}
          <div class="center" style="font-size: 11px;">${shopPhone ? `Ph: ${shopPhone}` : ""}</div>
          ${isTaxInvoice ? `<div class="center bold" style="font-size: 11px; margin-top: 2px;">TAX INVOICE · GSTIN: 24ABCDE1234F1Z5</div>` : ""}
          <div class="dashed"></div>
          <div>Bill No: #${b.order_no}</div>
          <div>Date: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</div>
          <div>Customer: ${b.customer_name || "Walk-in"}</div>
          <div class="dashed"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px dashed #000;">
                <th style="text-align: left; padding-bottom: 4px;">Item</th>
                <th style="text-align: right; padding-bottom: 4px;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="dashed"></div>
          <table>
            <tr>
              <td class="bold">GRAND TOTAL:</td>
              <td class="bold" style="text-align: right; font-size: 14px;">₹${b.total}</td>
            </tr>
            <tr>
              <td>Payment Mode:</td>
              <td style="text-align: right; text-transform: uppercase;">${b.payment_method}</td>
            </tr>
            ${b.change > 0 ? `<tr><td>Change Returned:</td><td style="text-align: right;">₹${b.change}</td></tr>` : ""}
            ${(proBilling?.show_customer_balance && prevUdhaar > 0) ? `
              <tr>
                <td style="color: #666;">Previous Khata Dues:</td>
                <td style="text-align: right; font-weight: bold; color: #b45309;">₹${prevUdhaar}</td>
              </tr>
            ` : ""}
          </table>
          ${showUpi ? `
            <div class="dashed"></div>
            <div class="center" style="font-size: 10px; margin: 4px 0;">
              <b>Scan UPI to Pay</b><br/>
              ${shop?.upi_id ? `<span style="font-family: monospace;">UPI: ${shop.upi_id}</span>` : ""}
            </div>
          ` : ""}
          ${terms ? `
            <div class="dashed"></div>
            <div style="font-size: 9px; color: #444; white-space: pre-line; line-height: 1.3;">
              ${terms}
            </div>
          ` : ""}
          <div class="dashed"></div>
          <div class="center">${proBilling?.custom_footer_note || "Thank you for visiting! 🙏"}</div>
          ${brandingEnabled ? `
            <div class="center" style="font-size: 9px; margin-top: 12px; color: #555;">
              *** Powered by Dukaan · A PEAN Product ***<br/>
              Smart Thermal POS Engine
            </div>
          ` : ""}
          <div style="height: 20px;"></div>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handlePrintTestDiagnostic = () => {
    const printWin = window.open("", "_blank", "width=380,height=500");
    if (!printWin) {
      toast.error("Please allow popups to run printer test.");
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Diagnostic Test</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 10px; width: 58mm; text-align: center; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div style="font-weight: bold; font-size: 14px;">DUKAAN PRINTER TEST</div>
          <div>58mm / 80mm ESC/POS OK</div>
          <div class="line"></div>
          <div>Left Margin: OK [0]</div>
          <div>Right Margin: OK [32 Col]</div>
          <div>Feed & Cut Test: PASS</div>
          <div class="line"></div>
          <div>Date: ${new Date().toLocaleString("en-IN")}</div>
          <div style="margin-top: 10px;">OfficialDukaan.in Hardware Guard</div>
          <div style="height: 30px;">.</div>
        </body>
      </html>
    `);
    printWin.document.close();
    toast.success("Diagnostic receipt dispatched to thermal spooler!");
  };

  // Feature 18: Universal FMCG Barcode Scanner Auto-match in POS
  const fmcgMatched = useMemo(() => {
    if (!q || q.trim().length < 4) return null;
    return findFMCGByBarcode(q.trim());
  }, [q]);

  const handleAddFmcgDirect = (item) => {
    addToCart({
      id: `fmcg_${item.barcode}`,
      name: item.name,
      selling_price: item.selling_price,
      stock: 99,
      unlimited_stock: true,
      category: item.category
    });
    setQ("");
    toast.success(`⚡ Added "${item.name}" directly to cart!`);
  };

  const handleManualReset = () => {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    setCompletedBill(null);
    clearCart();
  };

  return (
    <div className="animate-fade-up max-w-[1500px] mx-auto pb-36 lg:pb-12 font-sans selection:bg-brand-terracotta/20">
      
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

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Quick Mobile Bill Trigger Button */}
          <Button
            onClick={() => setMobileCartOpen(true)}
            className="lg:hidden rounded-full bg-brand-terracotta text-white text-xs font-bold px-3.5 h-10 flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Bill ({cart.reduce((a, c) => a + c.qty, 0)})</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!isPremium) {
                toast.info("Voice Soundbox is a Premium feature. Upgrade to Premium for real-time UPI voice announcements!");
                return;
              }
              setSoundboxEnabled(v => !v);
            }}
            className={`rounded-full border-2 text-xs font-bold px-3.5 h-10 flex items-center gap-1.5 transition-all ${
              !isPremium
                ? "border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/60"
                : soundboxEnabled 
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" 
                  : "border-brand-mitti bg-white text-brand-indigo/60 hover:bg-brand-sand"
            }`}
            title={isPremium ? "Toggle Voice Soundbox Announcement" : "Voice Soundbox (Premium Plan Feature)"}
          >
            {!isPremium ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Soundbox (PRO)</span>
              </>
            ) : (
              <>
                {soundboxEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" /> : <VolumeX className="w-4 h-4 text-brand-indigo/40" />}
                <span className="hidden sm:inline">Soundbox: {soundboxEnabled ? "ON" : "OFF"}</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => nav("/app/counter")}
            className="rounded-full border-2 border-brand-mitti hover:border-brand-indigo bg-white text-brand-indigo text-xs font-bold px-4 h-10 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Counter Mode (F1-F6)</span>
          </Button>
          {/* POS View Switcher (Grid vs Table vs Compact) */}
          <div className="flex items-center p-1 rounded-xl bg-brand-sand/60 border border-brand-mitti">
            <button
              onClick={() => {
                setPosViewMode("grid");
                saveProThemeSettings(user?.email, { pos_view: "grid" });
                toast.info("Visual Grid layout activated");
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                posViewMode === "grid" ? "bg-brand-indigo text-white shadow-xs" : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
              title="Visual Grid Mode (Touch / Images)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => {
                setPosViewMode("table");
                saveProThemeSettings(user?.email, { pos_view: "table" });
                toast.info("Barcode Table layout activated");
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                posViewMode === "table" ? "bg-brand-indigo text-white shadow-xs" : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
              title="Compact Barcode Table Mode (Supermarket)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              onClick={() => {
                setPosViewMode("compact");
                saveProThemeSettings(user?.email, { pos_view: "compact" });
                toast.info("Minimalist Counter mode activated");
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                posViewMode === "compact" ? "bg-brand-indigo text-white shadow-xs" : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
              title="Minimalist Rapid Mode"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Fast</span>
            </button>
          </div>

          {/* Hold & Recall Buttons (F7 & F8) */}
          <button
            onClick={handleHoldCart}
            disabled={cart.length === 0}
            className="px-3 h-10 rounded-full border border-brand-mitti bg-white hover:bg-brand-sand text-brand-indigo text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all active:scale-95"
            title="Hold Current Bill (F7)"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Hold</span>
            <span className="font-mono text-[10px] text-brand-indigo/50">F7</span>
          </button>

          {heldCart && (
            <button
              onClick={handleRecallCart}
              className="px-3 h-10 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse active:scale-95 transition-all"
              title="Recall Held Bill (F8)"
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Recall ({heldCart.cart?.length || 1})</span>
              <span className="font-mono text-[10px] text-purple-200">F8</span>
            </button>
          )}

          {/* Shift Handover (F9) */}
          <button
            onClick={() => setShiftHandoverOpen(true)}
            className="px-3 h-10 rounded-full border border-brand-mitti bg-white hover:bg-brand-sand text-brand-indigo text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            title="Shift Handover & Drawer Cash (F9)"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Shift</span>
            <span className="font-mono text-[10px] text-brand-indigo/50">F9</span>
          </button>

          <Button
            variant="outline"
            onClick={handlePrintTestDiagnostic}
            className="rounded-full border-2 border-brand-mitti hover:border-brand-indigo bg-white text-brand-indigo text-xs font-bold px-3.5 h-10 flex items-center gap-1.5"
            title="ESC/POS Thermal Printer Diagnostics (Feature #25)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Printer Test</span>
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
                placeholder="Search products by name, barcode or category (e.g. Atta, Maggi, Dettol)..."
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

            {/* FMCG Universal Barcode Matched Banner (Feature #18) */}
            {fmcgMatched && (
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fade-up">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span>FMCG Master Barcode Match: {fmcgMatched.name}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">₹{fmcgMatched.selling_price}</span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Standard MRP ₹{fmcgMatched.mrp} · {fmcgMatched.category} · HSN {fmcgMatched.hsn}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddFmcgDirect(fmcgMatched)}
                  className="h-8 px-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
                >
                  + Add to Cart
                </Button>
              </div>
            )}

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

          {/* Product View Rendering: Table vs Grid */}
          {posViewMode === "table" ? (
            <div className="bg-white rounded-3xl border-2 border-brand-mitti overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-brand-sand/60 text-brand-indigo/70 uppercase text-[10px] font-bold border-b border-brand-mitti">
                    <tr>
                      <th className="py-3 px-3.5">Barcode</th>
                      <th className="py-3 px-3.5">Item Name</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Stock</th>
                      <th className="py-3 px-3.5 text-right">Selling Price</th>
                      <th className="py-3 px-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-mitti/60">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-brand-indigo/50">
                          No products found matching keyword.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => {
                        const inCart = cart.find(x => x.product_id === p.id);
                        const isOutOfStock = !p.unlimited_stock && p.stock <= 0;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-mono text-slate-500">{p.barcode || "—"}</td>
                            <td className="py-2.5 px-3.5 font-bold text-brand-indigo">{p.name}</td>
                            <td className="py-2.5 px-3.5 text-brand-indigo/60">{p.category || "General"}</td>
                            <td className="py-2.5 px-3.5">
                              <span className={`font-bold ${p.unlimited_stock ? "text-slate-500" : p.stock <= 0 ? "text-rose-600" : p.stock <= 5 ? "text-amber-700" : "text-emerald-700"}`}>
                                {p.unlimited_stock ? "Unlimited" : p.stock <= 0 ? "Out of stock" : `${p.stock} pcs`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-display font-bold text-sm text-brand-indigo">
                              {money(p.selling_price)}
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              {inCart ? (
                                <div className="inline-flex items-center bg-brand-terracotta text-white rounded-xl h-8 px-1.5 shadow-xs">
                                  <button
                                    onClick={() => updateQty(cart.findIndex(x => x.product_id === p.id), -1)}
                                    className="px-1.5 font-bold hover:bg-black/10 rounded"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-mono font-extrabold">{inCart.qty}</span>
                                  <button
                                    onClick={() => updateQty(cart.findIndex(x => x.product_id === p.id), 1)}
                                    className="px-1.5 font-bold hover:bg-black/10 rounded"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  disabled={isOutOfStock}
                                  onClick={() => addToCart(p)}
                                  className="h-8 px-3.5 rounded-xl bg-brand-sand hover:bg-brand-terracotta hover:text-white text-brand-indigo font-bold text-xs border border-brand-mitti transition-all active:scale-95 disabled:opacity-50"
                                >
                                  + ADD
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
          /* Product Grid */
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
                    onClick={() => !isOutOfStock && !inCart && addToCart(p)}
                    data-testid={`pos-product-${p.id}`}
                    className={`relative rounded-3xl border-2 p-3.5 sm:p-4 transition-all flex flex-col justify-between select-none ${
                      isOutOfStock 
                        ? "bg-brand-mitti/30 border-brand-mitti/60 opacity-60 cursor-not-allowed" 
                        : inCart
                          ? "bg-white border-brand-terracotta shadow-sm ring-2 ring-brand-terracotta/20"
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
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo/50 truncate">
                          {p.category || "General"}
                        </span>
                        {canUseExpiryGuard && p.expiry_date && (() => {
                          const exp = new Date(p.expiry_date);
                          if (isNaN(exp.getTime())) return null;
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const expZ = new Date(exp);
                          expZ.setHours(0,0,0,0);
                          const diff = Math.ceil((expZ.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          if (diff < 0) {
                            return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 shrink-0">Expired</span>;
                          } else if (diff <= 30) {
                            return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">Exp: {diff}d</span>;
                          }
                          return null;
                        })()}
                      </div>
                      <h4 className="font-heading font-bold text-brand-indigo text-sm leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                      {canUseExpiryGuard && p.batch_number && (
                        <div className="text-[10px] font-mono font-semibold text-slate-400 mt-1">
                          Lot: {p.batch_number}
                        </div>
                      )}
                    </div>

                    <div className="mt-3.5 sm:mt-4 pt-3 border-t border-brand-mitti/60 flex items-center justify-between gap-1.5">
                      <div>
                        <div className="font-display font-bold text-base sm:text-lg text-brand-indigo">
                          {money(p.selling_price)}
                        </div>
                        <div className={`text-[10px] font-bold ${
                          p.unlimited_stock ? "text-brand-indigo/60" :
                          p.stock <= 0 ? "text-red-700" :
                          p.stock <= (p.min_stock || 5) ? "text-amber-800" : "text-emerald-700"
                        }`}>
                          {p.unlimited_stock ? "Unlimited" : p.stock <= 0 ? "Out" : `${p.stock} left`}
                        </div>
                      </div>

                      {/* Direct Card Quantity Stepper (Mobile & Desktop) */}
                      {!isOutOfStock && (
                        inCart ? (
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center bg-brand-terracotta text-white rounded-xl shadow-xs border border-brand-terracotta overflow-hidden h-9 shrink-0"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cartIdx = cart.findIndex(x => x.product_id === p.id);
                                if (cartIdx >= 0) updateQty(cartIdx, -1);
                              }}
                              className="w-8 h-full flex items-center justify-center hover:bg-black/10 active:scale-90 font-bold transition-all"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 text-white" />
                            </button>
                            <span className="font-mono font-extrabold text-xs px-1.5 text-center text-white min-w-[20px]">
                              {inCart.qty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cartIdx = cart.findIndex(x => x.product_id === p.id);
                                if (cartIdx >= 0) updateQty(cartIdx, 1);
                              }}
                              className="w-8 h-full flex items-center justify-center hover:bg-black/10 active:scale-90 font-bold transition-all"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            className="h-9 px-3 rounded-xl bg-brand-sand hover:bg-brand-terracotta hover:text-white text-brand-indigo text-xs font-bold flex items-center gap-1 active:scale-95 transition-all border border-brand-mitti shadow-2xs shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ADD</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          )}

        </div>

        {/* =========================================================
            RIGHT SECTION: INTERACTIVE BILL SLIP & CART REGISTER (Desktop)
        ========================================================= */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border-2 border-brand-mitti shadow-md p-6 lg:sticky lg:top-24 flex-col justify-between">
          
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
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-brand-indigo/60 font-mono">
                        <span>{money(item.price)} × {item.qty}</span>
                        {canUseExpiryGuard && item.batch_number && (
                          <span className="text-[9px] font-mono font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-brand-mitti">
                            Lot: {item.batch_number}
                          </span>
                        )}
                        {canUseExpiryGuard && item.expiry_date && (() => {
                          const exp = new Date(item.expiry_date);
                          if (isNaN(exp.getTime())) return null;
                          const isExp = exp.getTime() < new Date().setHours(0,0,0,0);
                          return isExp ? (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                              ⚠️ Expired
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-brand-mitti shadow-xs">
                      <button 
                        onClick={() => updateQty(idx, -1)}
                        className="w-7 h-7 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-xs w-5 text-center text-brand-indigo">
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateQty(idx, 1)}
                        className="w-7 h-7 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold active:scale-90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 border-2 border-brand-mitti">
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
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-brand-indigo space-y-2.5">
                  <span className="font-bold text-brand-indigo block">Select Customer for Udhaar:</span>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="bg-white border-brand-mitti rounded-xl h-10 text-xs font-medium">
                      <SelectValue placeholder="Choose registered customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.phone && `· ${c.phone}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setNewCustomer({ open: true, name: "", phone: "" })}
                    className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1 pt-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + Create New Customer
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-brand-sand border border-brand-mitti text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-indigo/60">Debtor:</span>
                    <span className="font-bold text-brand-indigo text-sm">{selectedCustomerObj?.name}</span>
                  </div>
                  {selectedCustomerObj?.phone && (
                    <div className="flex justify-between items-center text-brand-indigo/70 font-mono">
                      <span>Phone:</span>
                      <span>{selectedCustomerObj.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-brand-mitti/60">
                    <span className="text-brand-indigo/60">Current Outstanding:</span>
                    <span className="font-bold text-brand-terracotta">{money(selectedCustomerObj?.total_pending || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-brand-mitti/60 text-emerald-800 font-bold">
                    <span>New Total After This Bill:</span>
                    <span>{money(Number(selectedCustomerObj?.total_pending || 0) + total)}</span>
                  </div>
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

          {/* WhatsApp Digital Bill Sender */}
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-left space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>1-Tap WhatsApp Digital Bill</span>
              </span>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Paperless</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Customer Mobile (e.g. 9876543210)"
                value={waPhone}
                onChange={(e) => {
                  if (autoResetTimer) clearTimeout(autoResetTimer);
                  setWaPhone(e.target.value);
                }}
                className="h-10 text-xs rounded-xl bg-white border-emerald-300 font-mono"
              />
              <Button
                onClick={() => handleSendWhatsAppBill()}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span>Send Bill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button
              onClick={() => handlePrintReceipt(completedBill)}
              className="w-full h-12 rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> 🖨️ Print 58mm/80mm Thermal Slip
            </Button>

            <Button
              onClick={() => {
                if (completedBill?.id) nav(`/app/orders/${completedBill.id}`);
              }}
              className="w-full h-12 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4" /> View Printable Invoice
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
            <span>Ready for next customer · Auto-refreshing in a moment</span>
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

      {/* =========================================================
          SHIFT HANDOVER & CASH RECONCILIATION MODAL (F9)
      ========================================================= */}
      <Dialog open={shiftHandoverOpen} onOpenChange={setShiftHandoverOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border-2 border-brand-mitti shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl text-brand-indigo flex items-center gap-2">
                  Shift Handover & Drawer
                </DialogTitle>
                <p className="text-xs text-brand-indigo/60">
                  Cashier: <strong className="text-brand-indigo">{activeCashierName}</strong> · Started: {new Date(currentShift?.started_at || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Shift Sales Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-brand-sand/60 border border-brand-mitti">
                <span className="text-[11px] font-bold text-brand-indigo/60 uppercase">Total Bills</span>
                <p className="text-lg font-extrabold text-brand-indigo font-display">{shiftStats.totalBills}</p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-sand/60 border border-brand-mitti">
                <span className="text-[11px] font-bold text-brand-indigo/60 uppercase">Total Revenue</span>
                <p className="text-lg font-extrabold text-brand-indigo font-display">{money(shiftStats.totalSales)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Cash Collected</span>
                <p className="text-lg font-extrabold text-emerald-700 font-display">{money(shiftStats.cashSales)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase">UPI / Digital</span>
                <p className="text-lg font-extrabold text-purple-700 font-display">{money(shiftStats.upiSales)}</p>
              </div>
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand-mitti space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-brand-indigo/70">
                <span>Opening Cash Float:</span>
                <span className="font-mono font-bold text-brand-indigo">{money(shiftStats.openingCash)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-indigo border-t border-brand-mitti/50 pt-2">
                <span>Expected Drawer Cash:</span>
                <span className="font-mono text-sm text-brand-indigo">{money(shiftStats.expectedCash)}</span>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo flex items-center justify-between">
                  <span>Actual Counted Cash in Drawer</span>
                  <button 
                    type="button" 
                    onClick={() => setCountedCashInput(String(shiftStats.expectedCash))}
                    className="text-[10px] text-blue-600 hover:underline font-normal"
                  >
                    Match Expected
                  </button>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-brand-indigo/50">₹</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder={String(shiftStats.expectedCash)}
                    value={countedCashInput}
                    onChange={(e) => setCountedCashInput(e.target.value)}
                    className="pl-7 rounded-xl border-brand-mitti font-bold text-base text-brand-indigo"
                  />
                </div>
              </div>

              {/* Variance Indicator */}
              <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                shiftStats.variance === 0
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : shiftStats.variance > 0
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-rose-50 border-rose-300 text-rose-800"
              }`}>
                <span>Reconciliation:</span>
                <span>
                  {shiftStats.variance === 0 
                    ? "✓ Perfect Match (₹0)" 
                    : shiftStats.variance > 0 
                      ? `+₹${shiftStats.variance.toFixed(2)} Surplus (Extra)` 
                      : `-₹${Math.abs(shiftStats.variance).toFixed(2)} Shortage (Kam)`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-1">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handlePrintHandoverSlip}
                className="rounded-xl border-brand-mitti text-xs font-bold flex items-center justify-center gap-1.5 h-10 hover:border-brand-indigo"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Print Thermal Slip</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShareShiftWhatsApp}
                className="rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 h-10"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>WhatsApp Owner</span>
              </Button>
            </div>

            <Button
              onClick={handleFinalizeShift}
              className="w-full h-11 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Close Shift & Lock Counter</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* =========================================================
          MOBILE FLOATING CART PILL (lg:hidden)
      ========================================================= */}
      {cart.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-[76px] inset-x-3 z-40 bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-3.5 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-terracotta text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {cart.reduce((a, c) => a + c.qty, 0)}
            </div>
            <div>
              <div className="text-sm font-extrabold leading-tight">{money(total)}</div>
              <div className="text-[11px] text-white/80 font-medium">{cart.length} item{cart.length > 1 ? "s" : ""} in bill</div>
            </div>
          </div>
          <button
            onClick={() => setMobileCartOpen(true)}
            className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Review & Pay</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================
          MOBILE SLIDE-UP BILL DRAWER (lg:hidden)
      ========================================================= */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-brand-indigo/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileCartOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-h-[88vh] bg-white rounded-t-3xl shadow-2xl border-t-2 border-brand-mitti flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            
            {/* Drawer Drag handle & Header */}
            <div className="p-4 border-b border-brand-mitti/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-terracotta/10 text-brand-terracotta grid place-items-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-indigo">
                    Active Bill Slip
                  </h3>
                  <p className="text-[11px] text-brand-indigo/60">
                    {cart.reduce((acc, it) => acc + it.qty, 0)} item{cart.reduce((acc, it) => acc + it.qty, 0) !== 1 ? "s" : ""} in cart
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setMobileCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo/70 hover:text-brand-indigo transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              
              {/* Customer Khata Selector */}
              <div className="p-3 rounded-2xl bg-brand-sand/70 border border-brand-mitti">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-brand-indigo/70 uppercase tracking-wider">
                    Customer / Khata
                  </span>
                  <button
                    onClick={() => setNewCustomer({ ...newCustomer, open: true })}
                    className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> + Add
                  </button>
                </div>

                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="bg-white border-brand-mitti rounded-xl h-9 text-xs font-medium">
                    <SelectValue placeholder="Walk-in Customer" />
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
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-brand-indigo/50 text-xs">
                    <ShoppingBag className="w-7 h-7 opacity-30 mx-auto mb-1.5" />
                    Cart is empty. Tap any product to add.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div 
                      key={item.product_id}
                      className="p-2.5 rounded-2xl bg-brand-sand/40 border border-brand-mitti/80 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-brand-indigo text-xs truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-brand-indigo/60 font-mono">
                          {money(item.price)} × {item.qty}
                        </div>
                      </div>

                      {/* Quantity Controls (Large 36px touch targets for mobile) */}
                      <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-xl border border-brand-mitti">
                        <button 
                          onClick={() => updateQty(idx, -1)}
                          className="w-9 h-9 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold active:scale-90 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold text-sm w-5 text-center text-brand-indigo">
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(idx, 1)}
                          className="w-9 h-9 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold active:scale-90 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="font-heading font-extrabold text-xs text-brand-indigo min-w-[50px] text-right">
                        {money(item.price * item.qty)}
                      </div>

                      <button 
                        onClick={() => removeItem(idx)}
                        className="text-brand-indigo/30 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal & Discount */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-brand-mitti space-y-2 text-xs">
                  <div className="flex justify-between text-brand-indigo/70 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-brand-indigo font-mono">{money(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-brand-indigo/70 font-medium flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-brand-terracotta" />
                      Discount
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="0"
                        className="w-16 h-7 text-right rounded-lg border-brand-mitti text-xs"
                      />
                      <button
                        onClick={() => setDiscountType(prev => prev === "flat" ? "percent" : "flat")}
                        className="px-2 py-1 rounded-lg bg-brand-sand border border-brand-mitti font-bold text-[10px] text-brand-indigo"
                      >
                        {discountType === "flat" ? "₹" : "%"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-mitti flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-widest font-extrabold text-brand-terracotta">
                      Total Due
                    </span>
                    <span className="font-display font-extrabold text-2xl text-brand-indigo">
                      {money(total)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Checkout Action */}
            <div className="p-4 border-t border-brand-mitti bg-brand-sand/20">
              <Button
                disabled={cart.length === 0}
                onClick={() => {
                  setMobileCartOpen(false);
                  setMethod("cash");
                  setAmountReceived(String(total));
                  setPayOpen(true);
                }}
                className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Payment · {money(total)}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
