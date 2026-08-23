import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Minus, X, Search, Banknote, QrCode, Wallet, Infinity as InfinityIcon } from "lucide-react";

export default function POS() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]); // {product_id, name, price, qty}
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [busy, setBusy] = useState(false);
  const [shop, setShop] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ open: false, name: "", phone: "" });

  useEffect(() => {
    api.get("/products").then(r => setProducts(r.data));
    api.get("/customers").then(r => setCustomers(r.data));
    api.get("/shops").then(r => {
      const shopId = localStorage.getItem("dukaan_shop_id");
      setShop(r.data.find(s => s.id === shopId) || r.data[0]);
    });
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(p => p.name.toLowerCase().includes(s) || (p.category||"").toLowerCase().includes(s));
  }, [products, q]);

  const addToCart = (p) => {
    setCart(prev => {
      const i = prev.findIndex(x => x.product_id === p.id);
      if (i >= 0) {
        const c = [...prev]; c[i] = { ...c[i], qty: c[i].qty + 1 }; return c;
      }
      return [...prev, { product_id: p.id, name: p.name, price: p.selling_price, qty: 1 }];
    });
  };
  const setQty = (idx, delta) => {
    setCart(prev => {
      const c = [...prev];
      c[idx] = { ...c[idx], qty: Math.max(1, c[idx].qty + delta) };
      return c;
    });
  };
  const removeItem = (idx) => setCart(prev => prev.filter((_,i)=>i!==idx));

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const createOrder = async (pm) => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    if (pm === "udhaar" && !customerId) { toast.error("Select a customer for udhaar"); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/orders", {
        items: cart, discount: Number(discount||0),
        customer_id: customerId || null,
        payment_method: pm,
        amount_received: pm === "cash" ? Number(amountReceived || total) : null,
      });
      toast.success(`Bill #${data.order_no} saved!`);
      setPayOpen(false);
      nav(`/app/orders/${data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save");
    } finally { setBusy(false); }
  };

  const createCustomer = async () => {
    if (!newCustomer.name) return;
    const { data } = await api.post("/customers", { name: newCustomer.name, phone: newCustomer.phone });
    setCustomers([...customers, data]);
    setCustomerId(data.id);
    setNewCustomer({ open: false, name: "", phone: "" });
    toast.success("Customer added");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6 animate-fade-up">
      {/* Products */}
      <div>
        <h1 className="font-heading text-2xl font-bold">New Bill</h1>
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-indigo/50" />
          <Input
            data-testid="pos-product-search"
            placeholder="Search products…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="pl-9 h-12"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-brand-indigo/60 border border-dashed border-brand-mitti rounded-xl">
              No products yet. <button onClick={()=>nav("/app/products")} className="text-brand-terracotta font-semibold">Add products →</button>
            </div>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              data-testid={`pos-product-${p.id}`}
              disabled={!p.unlimited_stock && p.stock <= 0}
              className={`text-left rounded-xl border p-3 min-h-[96px] transition-colors ${(!p.unlimited_stock && p.stock<=0) ? "border-brand-mitti bg-brand-mitti/30 text-brand-indigo/40" : "border-brand-mitti bg-white hover:bg-brand-mitti/40"}`}
            >
              <div className="font-heading font-semibold text-brand-indigo leading-tight">{p.name}</div>
              <div className="text-xs text-brand-indigo/60 mt-0.5">{p.category}</div>
              <div className="mt-2 flex items-end justify-between">
                <div className="font-bold">{money(p.selling_price)}</div>
                <div className={`text-xs ${p.unlimited_stock ? "text-brand-indigo/50" : p.stock<=p.min_stock ? "text-brand-terracotta" : "text-brand-indigo/50"}`}>
                  {p.unlimited_stock ? <span className="inline-flex items-center gap-0.5"><InfinityIcon className="w-3 h-3"/></span> : `Stock: ${p.stock}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="rounded-xl border border-brand-mitti bg-white shadow-card p-4 h-fit lg:sticky lg:top-20">
        <h2 className="font-heading text-lg font-bold">Cart</h2>
        <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto" data-testid="pos-cart">
          {cart.length === 0 && <div className="text-sm text-brand-indigo/60 py-6 text-center">No items yet</div>}
          {cart.map((it, i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-brand-mitti last:border-0">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                <div className="text-xs text-brand-indigo/60">{money(it.price)} × {it.qty} = {money(it.price*it.qty)}</div>
              </div>
              <button onClick={()=>setQty(i,-1)} className="w-8 h-8 rounded border border-brand-mitti grid place-items-center hover:bg-brand-mitti/40"><Minus className="w-3.5 h-3.5"/></button>
              <span className="w-6 text-center font-semibold">{it.qty}</span>
              <button onClick={()=>setQty(i,+1)} className="w-8 h-8 rounded border border-brand-mitti grid place-items-center hover:bg-brand-mitti/40"><Plus className="w-3.5 h-3.5"/></button>
              <button onClick={()=>removeItem(i)} className="w-8 h-8 rounded text-destructive hover:bg-destructive/10 grid place-items-center"><X className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex items-center justify-between gap-2">
            <span>Discount</span>
            <Input data-testid="pos-discount" type="number" min="0" value={discount} onChange={(e)=>setDiscount(e.target.value)} className="w-24 h-9 text-right" />
          </div>
          <div className="flex justify-between text-lg font-heading font-bold text-brand-terracotta"><span>Total</span><span>{money(total)}</span></div>
        </div>
        <div className="mt-3">
          <Label className="text-xs">Customer (optional for cash/UPI)</Label>
          <div className="flex gap-2 mt-1">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger data-testid="pos-customer-select" className="flex-1"><SelectValue placeholder="Walk-in customer" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=>setNewCustomer({...newCustomer, open:true})} data-testid="pos-new-customer" className="border-brand-mitti">+ New</Button>
          </div>
        </div>
        <Button
          disabled={cart.length===0}
          onClick={() => setPayOpen(true)}
          data-testid="pos-proceed-payment"
          className="mt-4 w-full h-12 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform"
        >
          Proceed to Payment · {money(total)}
        </Button>
      </div>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Choose payment</DialogTitle></DialogHeader>
          {!method && (
            <div className="grid grid-cols-3 gap-3">
              <button data-testid="pay-cash" onClick={()=>setMethod("cash")} className="rounded-xl border border-brand-mitti p-4 hover:bg-brand-mitti/40 transition-colors">
                <Banknote className="w-6 h-6 text-brand-leaf" />
                <div className="mt-2 font-heading font-bold">Cash</div>
              </button>
              <button data-testid="pay-upi" onClick={()=>setMethod("upi")} className="rounded-xl border border-brand-mitti p-4 hover:bg-brand-mitti/40 transition-colors">
                <QrCode className="w-6 h-6 text-brand-indigo" />
                <div className="mt-2 font-heading font-bold">UPI</div>
              </button>
              <button data-testid="pay-udhaar" onClick={()=>setMethod("udhaar")} className="rounded-xl border border-brand-mitti p-4 hover:bg-brand-mitti/40 transition-colors">
                <Wallet className="w-6 h-6 text-brand-terracotta" />
                <div className="mt-2 font-heading font-bold">Udhaar</div>
              </button>
            </div>
          )}
          {method === "cash" && (
            <div className="space-y-3">
              <Label>Amount received</Label>
              <Input data-testid="pay-cash-amount" type="number" value={amountReceived} onChange={(e)=>setAmountReceived(e.target.value)} placeholder={String(total)} />
              {amountReceived && Number(amountReceived) > total && (
                <div className="text-sm text-brand-leaf">Return: {money(Number(amountReceived) - total)}</div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={()=>setMethod(null)}>Back</Button>
                <Button disabled={busy} onClick={()=>createOrder("cash")} data-testid="pay-cash-confirm" className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
                  Confirm · {money(total)}
                </Button>
              </DialogFooter>
            </div>
          )}
          {method === "upi" && (
            <div className="space-y-3 text-center">
              <div className="text-sm text-brand-indigo/70">Ask customer to scan this QR</div>
              <div className="mx-auto w-56 h-56 border border-brand-mitti rounded-xl bg-white grid place-items-center overflow-hidden">
                {shop?.upi_qr_data_url ? (
                  <img src={shop.upi_qr_data_url} alt="UPI QR" className="w-full h-full object-contain" />
                ) : shop?.upi_id ? (
                  <img src={`${API_BASE}/upi/qr?amount=${total}`} alt="UPI QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-sm text-brand-indigo/60 px-3">
                    No UPI QR configured. <br />
                    <button onClick={()=>nav("/app/settings")} className="text-brand-terracotta font-semibold">Set it up →</button>
                  </div>
                )}
              </div>
              {shop?.upi_id && <div className="text-sm">UPI ID: <b>{shop.upi_id}</b></div>}
              <div className="text-lg font-heading font-bold text-brand-terracotta">Pay {money(total)}</div>
              <DialogFooter>
                <Button variant="ghost" onClick={()=>setMethod(null)}>Back</Button>
                <Button disabled={busy} onClick={()=>createOrder("upi")} data-testid="pay-upi-confirm" className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
                  Payment Received
                </Button>
              </DialogFooter>
            </div>
          )}
          {method === "udhaar" && (
            <div className="space-y-3">
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger data-testid="udhaar-customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.phone && `· ${c.phone}`}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="text-sm text-brand-indigo/70">This adds <b>{money(total)}</b> to their pending balance.</div>
              <DialogFooter>
                <Button variant="ghost" onClick={()=>setMethod(null)}>Back</Button>
                <Button disabled={busy || !customerId} onClick={()=>createOrder("udhaar")} data-testid="pay-udhaar-confirm" className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
                  Save as Udhaar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New customer dialog */}
      <Dialog open={newCustomer.open} onOpenChange={(o)=>setNewCustomer({...newCustomer, open:o})}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input data-testid="new-customer-name" value={newCustomer.name} onChange={(e)=>setNewCustomer({...newCustomer, name:e.target.value})}/></div>
            <div><Label>Phone</Label><Input data-testid="new-customer-phone" value={newCustomer.phone} onChange={(e)=>setNewCustomer({...newCustomer, phone:e.target.value})}/></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=>setNewCustomer({open:false, name:"", phone:""})}>Cancel</Button>
            <Button onClick={createCustomer} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
