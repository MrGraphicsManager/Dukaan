import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Store, 
  Plus, 
  ShieldCheck, 
  QrCode, 
  Receipt, 
  Save, 
  Building2, 
  Phone, 
  MapPin, 
  Percent, 
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const EMPTY_SHOP = {
  name: "", 
  owner_name: "", 
  phone: "", 
  address: "", 
  upi_id: "", 
  upi_qr_data_url: "",
  invoice_footer: "Thank you for shopping with us!", 
  min_stock_default: 5
};

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
      const payload = { 
        ...form, 
        min_stock_default: Number(form.min_stock_default || 5) 
      };
      await api.put(`/shops/${currentShopId}`, payload);
      toast.success("Shop settings saved successfully!");
      await loadShops(currentShopId);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save shop settings");
    } finally {
      setBusy(false);
    }
  };

  const createShop = async () => {
    if (!newForm.name.trim()) return toast.error("Shop name is required");
    setBusy(true);
    try {
      const { data } = await api.post("/shops", { 
        ...newForm, 
        min_stock_default: Number(newForm.min_stock_default || 5) 
      });
      await loadShops(data.id);
      setActiveShop(data.id);
      setCreating(false);
      setNewForm({ ...EMPTY_SHOP });
      toast.success(`Shop "${data.name}" created!`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create shop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-[1200px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <Store className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">PREFERENCES</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white">
                Multi-Shop Enabled
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Shop & Business Settings
            </h1>
          </div>
        </div>

        <div className="relative z-10">
          <Button
            disabled={busy}
            onClick={save}
            className="h-12 px-7 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{busy ? "Saving…" : "Save All Changes"}</span>
          </Button>
        </div>
      </div>

      {/* =========================================================
          MULTI-SHOP BRANCH SWITCHER
      ========================================================= */}
      <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-indigo/50">Branches</span>
            <h3 className="font-display text-xl font-bold text-brand-indigo mt-0.5">Your Dukaan Locations</h3>
          </div>
          <Button
            variant="outline"
            onClick={() => setCreating(prev => !prev)}
            className="rounded-full border-brand-mitti hover:border-brand-indigo text-brand-indigo text-xs font-bold h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> {creating ? "Close" : "Add Branch"}
          </Button>
        </div>

        {/* List of branches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {shops.map((s) => {
            const isActive = s.id === currentShopId;
            return (
              <div
                key={s.id}
                onClick={() => setActiveShop(s.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isActive 
                    ? "bg-brand-sand border-brand-terracotta shadow-xs" 
                    : "bg-white border-brand-mitti hover:border-brand-indigo/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl grid place-items-center font-bold text-xs ${
                    isActive ? "bg-brand-terracotta text-white" : "bg-brand-sand text-brand-indigo"
                  }`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-brand-indigo">{s.name}</div>
                    <div className="text-[11px] text-brand-indigo/50">{s.phone || "No phone"}</div>
                  </div>
                </div>

                {isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-terracotta text-white">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Create new shop branch inline */}
        {creating && (
          <div className="mt-5 p-5 rounded-2xl bg-brand-sand border border-brand-mitti space-y-3">
            <h4 className="font-heading font-bold text-sm text-brand-indigo">Create New Shop Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="New Shop Name (e.g. Dukaan Branch 2)"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="bg-white border-brand-mitti rounded-xl"
              />
              <Input
                placeholder="Phone Number"
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                className="bg-white border-brand-mitti rounded-xl"
              />
            </div>
            <Button onClick={createShop} className="rounded-xl bg-brand-terracotta text-white text-xs font-bold">
              Save New Branch
            </Button>
          </div>
        )}
      </div>

      {/* =========================================================
          SHOP DETAILS FORM
      ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Identity & Contact */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
            <Building2 className="w-4 h-4 text-brand-terracotta" />
            <h3 className="font-heading font-bold text-base text-brand-indigo">Shop Profile</h3>
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Owner Name</Label>
            <Input
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Contact Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop Address & City</Label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              placeholder="e.g. Shop #12, Market Yard, Ahmedabad"
              className="mt-1 rounded-xl border-brand-mitti resize-none text-sm"
            />
          </div>
        </div>

        {/* Card 2: UPI QR & Invoicing */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
            <QrCode className="w-4 h-4 text-brand-terracotta" />
            <h3 className="font-heading font-bold text-base text-brand-indigo">UPI & Billing Settings</h3>
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop UPI ID (for QR Generation)</Label>
            <Input
              value={form.upi_id}
              onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              placeholder="e.g. 9825100000@okaxis"
              className="mt-1 h-11 rounded-xl border-brand-mitti font-mono font-bold"
            />
            <span className="text-[11px] text-brand-indigo/50 mt-1 block">
              This UPI ID will appear on counter QR stands for instant customer payments.
            </span>
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Invoice Footer Note</Label>
            <Input
              value={form.invoice_footer}
              onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })}
              placeholder="Thank you for shopping with us!"
              className="mt-1 h-11 rounded-xl border-brand-mitti"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Default Low Stock Alert Threshold</Label>
            <Input
              type="number"
              value={form.min_stock_default}
              onChange={(e) => setForm({ ...form, min_stock_default: e.target.value })}
              className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
            />
            <span className="text-[11px] text-brand-indigo/50 mt-1 block">
              Items will trigger low stock warning when remaining count reaches this number.
            </span>
          </div>

          <div className="pt-2">
            <Button
              disabled={busy}
              onClick={save}
              className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{busy ? "Saving…" : "Save Settings"}</span>
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}
