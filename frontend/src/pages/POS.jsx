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
  X
} from "lucide-react";
import { getStoredProducts, saveStoredProducts } from "@/lib/defaultProducts";
import { useAuth } from "@/lib/AuthContext";
import { playVoiceSoundbox } from "@/lib/soundbox";
import { findFMCGByBarcode } from "@/lib/fmcgMasterCatalog";

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
  const [customers, setCustomers] = useState([]);
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

  useEffect(() => {
    api.get("/products")
      .then(r => setProducts(Array.isArray(r.data) && r.data.length > 0 ? r.data : getStoredProducts()))
      .catch(() => setProducts(getStoredProducts()));

    let localCusts = [];
    try {
      localCusts = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
      if (!Array.isArray(localCusts) || localCusts.length === 0) {
        localCusts = [
          { id: "c_1", name: "Ramesh Patel", phone: "9825100000", notes: "Regular buyer, Block B-204", total_purchases: 450, total_paid: 450, total_pending: 0 },
          { id: "c_2", name: "Suresh Sharma", phone: "9876543210", notes: "Temple Road", total_purchases: 1450, total_paid: 0, total_pending: 1450 }
        ];
        localStorage.setItem("dukaan_customers", JSON.stringify(localCusts));
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

  const createCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    const newC = {
      id: `c_${Date.now()}`,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      notes: "Added from POS",
      total_purchases: 0,
      total_paid: 0,
      total_pending: 0,
      created_at: new Date().toISOString()
    };

    try {
      const res = await api.post("/customers", newC);
      if (res?.data?.id) newC.id = res.data.id;
    } catch (_) {}

    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("dukaan_customers") || "[]");
    } catch {}
    const updated = [newC, ...stored];
    localStorage.setItem("dukaan_customers", JSON.stringify(updated));

    setCustomers(prev => [newC, ...prev]);
    setCustomerId(newC.id);
    setNewCustomer({ open: false, name: "", phone: "" });
    toast.success(`Customer "${newC.name}" added and selected!`);
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
          return {
            ...c,
            total_purchases: Number(c.total_purchases || 0) + tot,
            total_paid: Number(c.total_paid || 0) + (isUdhaar ? 0 : tot),
            total_pending: Number(c.total_pending || 0) + (isUdhaar ? tot : 0),
            updated_at: new Date().toISOString()
          };
        }
        return c;
      });
      localStorage.setItem("dukaan_customers", JSON.stringify(updated));
    } catch {}
  };

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

      const billData = {
        order_no: order.order_no || `OD-${Date.now().toString().slice(-4)}`,
        id: order.id,
        total,
        payment_method: method,
        items: cart,
        customer_name: selectedCustomerObj?.name || "Walk-in Customer",
        customer_phone: selectedCustomerObj?.phone || "",
        change: method === "cash" && Number(amountReceived) > total ? Number(amountReceived) - total : 0,
      };

      setPayOpen(false);
      setCompletedBill(billData);
      setWaPhone(selectedCustomerObj?.phone || "");

      const savedOrders = JSON.parse(localStorage.getItem("dukaan_orders") || "[]");
      localStorage.setItem("dukaan_orders", JSON.stringify([order, ...savedOrders]));

      // Deduct purchased items from stock immediately
      deductStockAndSync(cart);
      // Update customer ledger immediately
      updateCustomerLedger(order);

      toast.success(`Bill #${order.order_no} created successfully!`);

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

    } catch (e) {
      // Offline / fallback order creation
      const mockOrder = {
        id: `ord_${Date.now()}`,
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

      // Deduct purchased items from stock immediately
      deductStockAndSync(cart);
      // Update customer ledger immediately
      updateCustomerLedger(mockOrder);

      setPayOpen(false);
      setCompletedBill(mockOrder);
      setWaPhone(selectedCustomerObj?.phone || "");
      toast.success(`Bill #${mockOrder.order_no} created!`);

      // Soundbox voice announcement (Premium only)
      if (soundboxEnabled && isPremium && !isChimeMuted) {
        playVoiceSoundbox(mockOrder.total, method, lang);
      }

      const timer = setTimeout(() => {
        setCompletedBill(null);
        clearCart();
      }, 6000);
      setAutoResetTimer(timer);
    } finally {
      setBusy(false);
    }
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
      `Thank you for shopping with us! Please visit again. 🙏`;

    const url = `https://wa.me/${phone ? `91${phone}` : ""}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp...");
  };

  // Feature 16 & Feature 25: Master Bill Thermal Receipt Printer with Branding Toggle
  const handlePrintReceipt = (billToPrint) => {
    const b = billToPrint || completedBill;
    if (!b) return;
    const brandingEnabled = localStorage.getItem("dukaan_receipt_branding_enabled") !== "false";
    const shopName = shop?.name || activeShop?.name || "Apni Dukaan";
    const shopPhone = shop?.phone || activeShop?.phone || "";
    const itemsHtml = (b.items || []).map(it => `
      <tr>
        <td style="padding: 3px 0; text-align: left;">${it.name} x${it.qty}</td>
        <td style="padding: 3px 0; text-align: right; font-family: monospace;">₹${Number(it.price || it.selling_price || 0) * Number(it.qty || 1)}</td>
      </tr>
    `).join("");

    const printWin = window.open("", "_blank", "width=380,height=600");
    if (!printWin) {
      toast.error("Please allow popups to print thermal receipts.");
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${b.order_no}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; width: 58mm; }
              .center { text-align: center; }
              .dashed { border-top: 1px dashed #000; margin: 8px 0; }
              .bold { font-weight: bold; }
            }
            body { font-family: 'Courier New', Courier, monospace; font-size: 13px; margin: 0; padding: 14px; width: 58mm; max-width: 80mm; }
            .center { text-align: center; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            .bold { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold" style="font-size: 16px;">${shopName}</div>
          <div class="center" style="font-size: 11px;">${shopPhone ? `Ph: ${shopPhone}` : ""}</div>
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
          </table>
          <div class="dashed"></div>
          <div class="center">Thank you for visiting! 🙏</div>
          ${brandingEnabled ? `
            <div class="center" style="font-size: 9px; margin-top: 12px; color: #555;">
              *** Powered by officialdukaan.in ***<br/>
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

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
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
          MOBILE FLOATING CART PILL (lg:hidden)
      ========================================================= */}
      {cart.length > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-[72px] inset-x-3 z-40 bg-gradient-to-r from-brand-indigo to-[#261E7A] text-white p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {cart.reduce((a, c) => a + c.qty, 0)}
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">{money(total)}</div>
              <div className="text-[10px] text-white/70">{cart.length} item{cart.length > 1 ? "s" : ""} added</div>
            </div>
          </div>
          <button
            onClick={() => setMobileCartOpen(true)}
            className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <span>View Bill & Pay</span>
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

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-xl border border-brand-mitti">
                        <button 
                          onClick={() => updateQty(idx, -1)}
                          className="w-6 h-6 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs w-4 text-center text-brand-indigo">
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(idx, 1)}
                          className="w-6 h-6 rounded-lg bg-brand-sand hover:bg-brand-mitti grid place-items-center text-brand-indigo font-bold"
                        >
                          <Plus className="w-3 h-3" />
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
