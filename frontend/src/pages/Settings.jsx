import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Plus } from "lucide-react";

const EMPTY_SHOP = {
  name:"", owner_name:"", phone:"", address:"", upi_id:"", upi_qr_data_url:"",
  logo_data_url:"", invoice_footer:"Thank you for shopping with us!", min_stock_default:5
};

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

export default function Settings() {
  const { shops, currentShopId, loadShops, setActiveShop } = useAuth();
  const [form, setForm] = useState(EMPTY_SHOP);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ ...EMPTY_SHOP });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = shops.find(x => x.id === currentShopId);
    if (s) setForm({ ...EMPTY_SHOP, ...s });
  }, [currentShopId, shops]);

  const save = async () => {
    if (!currentShopId) return;
    setBusy(true);
    try {
      const payload = { ...form, min_stock_default: Number(form.min_stock_default||5) };
      await api.put(`/shops/${currentShopId}`, payload);
      toast.success("Shop saved");
      await loadShops(currentShopId);
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  const createShop = async () => {
    if (!newForm.name) return toast.error("Name required");
    setBusy(true);
    try {
      const { data } = await api.post("/shops", { ...newForm, min_stock_default: Number(newForm.min_stock_default||5) });
      await loadShops(data.id);
      setActiveShop(data.id);
      setCreating(false);
      setNewForm({ ...EMPTY_SHOP });
      toast.success("Shop created");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  const uploadImage = async (e, key, target = "form") => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await fileToDataUrl(file);
    if (target === "form") setForm({ ...form, [key]: url });
    else setNewForm({ ...newForm, [key]: url });
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Shop settings</h1>

      <Card className="border-brand-mitti shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Your shops</div>
          <div className="flex flex-wrap gap-2">
            {shops.map(s => (
              <button key={s.id} onClick={()=>setActiveShop(s.id)} data-testid={`select-shop-${s.id}`}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                  s.id===currentShopId ? "bg-brand-indigo text-white border-brand-indigo" : "bg-white text-brand-indigo border-brand-mitti hover:bg-brand-mitti/40"
                }`}>
                <Store className="w-3.5 h-3.5"/> {s.name}
              </button>
            ))}
            <button onClick={()=>setCreating(v=>!v)} data-testid="add-shop-btn" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-dashed border-brand-mitti text-sm text-brand-indigo/70 hover:bg-brand-mitti/40">
              <Plus className="w-3.5 h-3.5"/> Add shop
            </button>
          </div>

          {creating && (
            <div className="mt-4 border-t border-brand-mitti pt-4 space-y-3" data-testid="new-shop-form">
              <div><Label>Shop name *</Label><Input data-testid="ns-name" value={newForm.name} onChange={(e)=>setNewForm({...newForm, name:e.target.value})}/></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Owner</Label><Input value={newForm.owner_name} onChange={(e)=>setNewForm({...newForm, owner_name:e.target.value})}/></div>
                <div><Label>Phone</Label><Input value={newForm.phone} onChange={(e)=>setNewForm({...newForm, phone:e.target.value})}/></div>
              </div>
              <Button data-testid="ns-save" onClick={createShop} disabled={busy} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Create shop</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {currentShopId && (
        <Card className="border-brand-mitti shadow-card">
          <CardContent className="p-6 space-y-4" data-testid="shop-settings-form">
            <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">Edit shop</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Shop name</Label><Input data-testid="ss-name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/></div>
              <div><Label>Owner name</Label><Input value={form.owner_name} onChange={(e)=>setForm({...form, owner_name:e.target.value})}/></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/></div>
              <div><Label>UPI ID</Label><Input data-testid="ss-upi-id" value={form.upi_id} onChange={(e)=>setForm({...form, upi_id:e.target.value})} placeholder="you@upi"/></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})}/></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Shop logo</Label>
                <input type="file" accept="image/*" onChange={(e)=>uploadImage(e, "logo_data_url")} data-testid="ss-logo" className="block mt-1 text-sm"/>
                {form.logo_data_url && <img src={form.logo_data_url} alt="" className="mt-2 w-20 h-20 object-contain border border-brand-mitti rounded"/>}
              </div>
              <div>
                <Label>UPI QR image</Label>
                <input type="file" accept="image/*" onChange={(e)=>uploadImage(e, "upi_qr_data_url")} data-testid="ss-upi-qr" className="block mt-1 text-sm"/>
                {form.upi_qr_data_url && <img src={form.upi_qr_data_url} alt="" className="mt-2 w-32 h-32 object-contain border border-brand-mitti rounded"/>}
                <div className="mt-1 text-xs text-brand-indigo/60">Or leave blank — we'll auto-generate a QR from your UPI ID.</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Invoice footer</Label><Input value={form.invoice_footer} onChange={(e)=>setForm({...form, invoice_footer:e.target.value})}/></div>
              <div><Label>Default min stock</Label><Input type="number" value={form.min_stock_default} onChange={(e)=>setForm({...form, min_stock_default:e.target.value})}/></div>
            </div>
            <Button data-testid="ss-save" disabled={busy} onClick={save} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
              Save changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
