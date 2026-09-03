import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  ChevronRight, 
  Search, 
  Users, 
  Wallet, 
  Phone, 
  ArrowUpRight, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Receipt,
  UserPlus,
  Edit2
} from "lucide-react";

export const getStoredCustomers = () => {
  try {
    const raw = localStorage.getItem("dukaan_customers");
    if (!raw) {
      const initial = [
        { id: "c_1", name: "Ramesh Patel", phone: "9825100000", notes: "Regular buyer, Block B-204", total_purchases: 450, total_paid: 450, total_pending: 0 },
        { id: "c_2", name: "Suresh Sharma", phone: "9876543210", notes: "Temple Road", total_purchases: 1450, total_paid: 0, total_pending: 1450 }
      ];
      localStorage.setItem("dukaan_customers", JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredCustomers = (custs) => {
  try {
    localStorage.setItem("dukaan_customers", JSON.stringify(custs));
  } catch {}
};

export default function Customers() {
  const nav = useNavigate();
  const [items, setItems] = useState(() => getStoredCustomers());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "udhaar", "paid"
  const [form, setForm] = useState({ open: false, id: null, name: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const load = () => {
    const local = getStoredCustomers();
    api.get("/customers", { params: { q: q || undefined } })
      .then(r => {
        const server = Array.isArray(r.data) ? r.data : [];
        const merged = [...server];
        local.forEach(lc => {
          if (!merged.some(m => (m.id && m.id === lc.id) || (m.phone && lc.phone && m.phone === lc.phone))) {
            merged.push(lc);
          }
        });
        saveStoredCustomers(merged);
        setItems(merged);
      })
      .catch(() => {
        setItems(local);
      });
  };

  useEffect(() => {
    load();
    /* eslint-disable-next-line */
  }, [q]);

  // Aggregate stats
  const totalUdhaarPending = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.total_pending || 0), 0);
  }, [items]);

  const customersWithUdhaar = useMemo(() => {
    return items.filter(c => (c.total_pending || 0) > 0);
  }, [items]);

  const totalPurchasesSum = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.total_purchases || 0), 0);
  }, [items]);

  // Filtered customer list
  const filtered = useMemo(() => {
    return items.filter(c => {
      if (filter === "udhaar") return (c.total_pending || 0) > 0;
      if (filter === "paid") return (c.total_pending || 0) <= 0;
      return true;
    });
  }, [items, filter]);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Customer name is required");
    setBusy(true);
    const newCustomer = {
      id: form.id || `c_${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      notes: form.notes.trim(),
      total_purchases: Number(form.total_purchases || 0),
      total_paid: Number(form.total_paid || 0),
      total_pending: Number(form.total_pending || 0),
      created_at: form.created_at || new Date().toISOString()
    };

    try {
      if (form.id && !form.id.startsWith("c_")) {
        await api.put(`/customers/${form.id}`, newCustomer);
      } else {
        const res = await api.post("/customers", newCustomer);
        if (res?.data?.id) newCustomer.id = res.data.id;
      }
    } catch (_) {}

    const current = getStoredCustomers();
    const idx = current.findIndex(x => x.id === newCustomer.id || (x.phone && x.phone === newCustomer.phone));
    let updated;
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...updated[idx], ...newCustomer };
    } else {
      updated = [newCustomer, ...current];
    }
    saveStoredCustomers(updated);
    setItems(updated);
    toast.success(form.id ? `Customer "${newCustomer.name}" updated!` : `Customer "${newCustomer.name}" added to directory!`);
    setForm({ open: false, id: null, name: "", phone: "", notes: "" });
    setBusy(false);
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER & KPI METRICS
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">CUSTOMER DIRECTORY</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white">
                Khata Ledger Active
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Customers & Khata
            </h1>
          </div>
        </div>

        {/* 3 Summary Badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-white/60">Total Customers</div>
            <div className="font-display text-xl font-bold text-white">{items.length}</div>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-amber-300">Pending Udhaar</div>
            <div className="font-display text-xl font-bold text-amber-300">{money(totalUdhaarPending)}</div>
          </div>
          <Button
            onClick={() => setForm({ open: true, name: "", phone: "", notes: "" })}
            data-testid="add-customer-btn"
            className="h-12 px-6 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-glow active:scale-95 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* =========================================================
          CONTROLS: SEARCH & FILTER TABS
      ========================================================= */}
      <div className="bg-white p-4 rounded-3xl border-2 border-brand-mitti shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search by Name or Phone */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo/40" />
          <Input 
            data-testid="customer-search" 
            placeholder="Search by customer name or phone number…" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-11 pr-4 h-11 rounded-2xl border-brand-mitti bg-brand-sand/50 text-sm font-medium text-brand-indigo" 
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-mitti">
          {[
            { id: "all", label: `All (${items.length})` },
            { id: "udhaar", label: `Has Udhaar (${customersWithUdhaar.length})` },
            { id: "paid", label: "Clean Ledger" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id 
                  ? "bg-white text-brand-indigo shadow-xs" 
                  : "text-brand-indigo/60 hover:text-brand-indigo"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* =========================================================
          CUSTOMER CARDS GRID
      ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="customers-list">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-brand-mitti p-8">
            <Users className="w-12 h-12 text-brand-indigo/30 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-brand-indigo">No customers found</h3>
            <p className="text-xs text-brand-indigo/60 mt-1">Add your first customer to track their purchase history and udhaar.</p>
            <Button
              onClick={() => setForm({ open: true, name: "", phone: "", notes: "" })}
              className="mt-4 rounded-full bg-brand-terracotta text-white text-xs font-bold"
            >
              + Add Customer
            </Button>
          </div>
        ) : (
          filtered.map(c => {
            const hasPending = (c.total_pending || 0) > 0;
            const initials = (c.name || "Customer").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div 
                key={c.id} 
                data-testid={`customer-${c.id}`}
                className="bg-white rounded-3xl border-2 border-brand-mitti p-6 shadow-xs hover:border-brand-indigo/30 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Avatar, Name & Phone */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-sand border-2 border-brand-mitti grid place-items-center font-display font-extrabold text-brand-indigo text-lg shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-brand-indigo leading-tight group-hover:text-brand-terracotta transition-colors">
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-brand-indigo/60 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-brand-indigo/40" />
                          <span>{c.phone || "No phone registered"}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      hasPending 
                        ? "bg-amber-100 text-amber-900 border border-amber-200" 
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}>
                      {hasPending ? "Udhaar Due" : "Settled"}
                    </span>
                  </div>

                  {/* Financial Ledger Mini Summary */}
                  <div className="mt-5 p-4 rounded-2xl bg-brand-sand/50 border border-brand-mitti/70 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-brand-indigo/50">Purchases</div>
                      <div className="font-heading font-extrabold text-sm text-brand-indigo mt-1">
                        {money(c.total_purchases || 0)}
                      </div>
                    </div>
                    <div className="border-x border-brand-mitti">
                      <div className="text-[10px] uppercase font-bold text-emerald-700">Paid</div>
                      <div className="font-heading font-extrabold text-sm text-emerald-700 mt-1">
                        {money(c.total_paid || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-brand-terracotta">Pending</div>
                      <div className="font-heading font-extrabold text-sm text-brand-terracotta mt-1">
                        {money(c.total_pending || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: WhatsApp Reminder + Edit + View Ledger */}
                <div className="mt-5 pt-3.5 border-t border-brand-mitti/60 flex items-center justify-between gap-2">
                  {hasPending && c.phone ? (
                    <a
                      href={`https://wa.me/91${c.phone}?text=${encodeURIComponent(
                        `Hello ${c.name}, this is a gentle reminder from Dukaan that your pending balance is ${money(c.total_pending)}. Please clear it at your convenience. Thank you!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span className="text-xs text-brand-indigo/50 font-medium">Khata Clean</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm({
                          open: true,
                          id: c.id,
                          name: c.name,
                          phone: c.phone || "",
                          notes: c.notes || "",
                          total_purchases: c.total_purchases,
                          total_paid: c.total_paid,
                          total_pending: c.total_pending,
                          created_at: c.created_at
                        });
                      }}
                      className="text-xs font-bold text-brand-indigo/70 hover:text-brand-indigo border border-brand-mitti px-2.5 py-1 rounded-lg hover:border-brand-indigo transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => nav(`/app/customers/${c.id}`)}
                      className="text-xs font-bold text-brand-indigo hover:text-brand-terracotta transition-colors flex items-center gap-1"
                    >
                      <span>Ledger</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* =========================================================
          ADD / EDIT CUSTOMER MODAL
      ========================================================= */}
      <Dialog open={form.open} onOpenChange={(o) => setForm({ ...form, open: o })}>
        <DialogContent className="max-w-md rounded-3xl p-7 border-2 border-brand-mitti bg-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-brand-indigo flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-terracotta" />
              <span>{form.id ? "Edit Customer Details" : "Add Customer to Directory"}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Customer Full Name *</Label>
              <Input
                data-testid="cf-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Bhai Patel"
                className="mt-1 h-11 rounded-xl border-brand-mitti text-base font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">10-Digit Mobile Number</Label>
              <Input
                data-testid="cf-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9825100000"
                maxLength={10}
                className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Address / Khata Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Regular buyer, Block B-204"
                className="mt-1 h-11 rounded-xl border-brand-mitti"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setForm({ open: false, id: null, name: "", phone: "", notes: "" })}
              className="rounded-xl border-brand-mitti font-bold text-xs"
            >
              Cancel
            </Button>
            <Button 
              onClick={save} 
              disabled={busy} 
              className="rounded-xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs"
            >
              {busy ? "Saving..." : form.id ? "Update Customer" : "Save to Directory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
