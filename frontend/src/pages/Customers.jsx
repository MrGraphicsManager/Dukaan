import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ChevronRight } from "lucide-react";

export default function Customers() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ open:false, name:"", phone:"", notes:"" });

  const load = () => api.get("/customers", { params: { q: q||undefined } }).then(r => setItems(r.data));
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [q]);

  const save = async () => {
    if (!form.name) return toast.error("Name required");
    await api.post("/customers", { name: form.name, phone: form.phone, notes: form.notes });
    toast.success("Customer added");
    setForm({ open:false, name:"", phone:"", notes:"" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Customers</h1>
        <Button onClick={()=>setForm({...form, open:true})} data-testid="add-customer-btn" className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
          <Plus className="w-4 h-4 mr-1"/> Add customer
        </Button>
      </div>
      <Input data-testid="customer-search" placeholder="Search by name or phone…" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-md" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="customers-list">
        {items.length===0 && <div className="col-span-full text-center py-10 text-brand-indigo/60 border border-dashed border-brand-mitti rounded-xl">No customers yet.</div>}
        {items.map(c => (
          <button key={c.id} onClick={()=>nav(`/app/customers/${c.id}`)} data-testid={`customer-${c.id}`}
            className="text-left rounded-xl border border-brand-mitti bg-white p-4 shadow-card hover:shadow-lift transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-heading font-bold text-lg">{c.name}</div>
                <div className="text-xs text-brand-indigo/60">{c.phone || "No phone"}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-brand-indigo/40" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-brand-indigo/60">Purchases</div><div className="font-heading font-bold">{money(c.total_purchases)}</div></div>
              <div><div className="text-brand-indigo/60">Paid</div><div className="font-heading font-bold text-brand-leaf">{money(c.total_paid)}</div></div>
              <div><div className="text-brand-indigo/60">Pending</div><div className="font-heading font-bold text-brand-terracotta">{money(c.total_pending)}</div></div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={form.open} onOpenChange={(o)=>setForm({...form, open:o})}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input data-testid="cf-name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/></div>
            <div><Label>Phone</Label><Input data-testid="cf-phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/></div>
            <div><Label>Notes</Label><Input data-testid="cf-notes" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})}/></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=>setForm({open:false, name:"", phone:"", notes:""})}>Cancel</Button>
            <Button data-testid="cf-save" onClick={save} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
