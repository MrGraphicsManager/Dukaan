import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, Infinity as InfinityIcon } from "lucide-react";

const EMPTY = { name:"", category:"General", selling_price:"", purchase_price:"", stock:0, min_stock:5, unlimited_stock:false };

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [form, setForm] = useState({ open:false, mode:"create", data:EMPTY });
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/products", { params: { q: q || undefined, category } }).then(r => setItems(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, category]);

  const categories = ["all", ...Array.from(new Set(items.map(p => p.category).filter(Boolean)))];

  const submit = async () => {
    const data = { ...form.data,
      selling_price: Number(form.data.selling_price||0),
      purchase_price: Number(form.data.purchase_price||0),
      stock: form.data.unlimited_stock ? 0 : Number(form.data.stock||0),
      min_stock: form.data.unlimited_stock ? 0 : Number(form.data.min_stock||0),
      unlimited_stock: !!form.data.unlimited_stock };
    if (!data.name) return toast.error("Name required");
    setBusy(true);
    try {
      if (form.mode === "create") await api.post("/products", data);
      else await api.put(`/products/${form.data.id}`, data);
      toast.success("Saved");
      setForm({ open:false, mode:"create", data:EMPTY });
      load();
    } catch(e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setBusy(false); }
  };

  const del = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Button onClick={()=>setForm({open:true, mode:"create", data:EMPTY})} data-testid="add-product-btn" className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white active:scale-95 transition-transform">
          <Plus className="w-4 h-4 mr-1"/> Add product
        </Button>
      </div>

      <div className="flex gap-3">
        <Input data-testid="product-search" placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-xs" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c==="all"?"All categories":c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-mitti bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-brand-mitti/50 text-left text-xs uppercase tracking-widest text-brand-indigo/70">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Min</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-mitti" data-testid="products-table">
            {items.length===0 && <tr><td colSpan={6} className="text-center py-8 text-brand-indigo/60">No products yet.</td></tr>}
            {items.map(p => (
              <tr key={p.id} className="hover:bg-brand-mitti/20">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-brand-indigo/70">{p.category}</td>
                <td className="px-4 py-3 text-right">{money(p.selling_price)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${p.unlimited_stock ? "text-brand-indigo/50" : p.stock<=0?"text-destructive":p.stock<=p.min_stock?"text-brand-terracotta":""}`}>
                  {p.unlimited_stock ? <span className="inline-flex items-center gap-1"><InfinityIcon className="w-4 h-4"/> Unlimited</span> : p.stock}
                </td>
                <td className="px-4 py-3 text-right text-brand-indigo/60">{p.unlimited_stock ? "—" : p.min_stock}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="sm" data-testid={`edit-product-${p.id}`} onClick={()=>setForm({open:true, mode:"edit", data:{...p}})}><Pencil className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="sm" onClick={()=>del(p)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={form.open} onOpenChange={(o)=>setForm({...form, open:o})}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{form.mode==="create" ? "Add product" : "Edit product"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Name *</Label><Input data-testid="pf-name" value={form.data.name} onChange={(e)=>setForm({...form, data:{...form.data, name:e.target.value}})}/></div>
            <div><Label>Category</Label><Input data-testid="pf-category" value={form.data.category} onChange={(e)=>setForm({...form, data:{...form.data, category:e.target.value}})}/></div>
            <div><Label>Selling price *</Label><Input data-testid="pf-price" type="number" value={form.data.selling_price} onChange={(e)=>setForm({...form, data:{...form.data, selling_price:e.target.value}})}/></div>
            <div><Label>Purchase price</Label><Input data-testid="pf-purchase" type="number" value={form.data.purchase_price} onChange={(e)=>setForm({...form, data:{...form.data, purchase_price:e.target.value}})}/></div>
            <div className="col-span-2">
              <label className="flex items-start gap-3 p-3 rounded-md border border-brand-mitti bg-brand-mitti/20 cursor-pointer hover:bg-brand-mitti/40 transition-colors">
                <Checkbox
                  data-testid="pf-unlimited"
                  checked={form.data.unlimited_stock}
                  onCheckedChange={(v)=>setForm({...form, data:{...form.data, unlimited_stock:!!v}})}
                  className="mt-0.5 border-brand-terracotta data-[state=checked]:bg-brand-terracotta data-[state=checked]:border-brand-terracotta"
                />
                <div>
                  <div className="font-medium text-sm">Unlimited stock</div>
                  <div className="text-xs text-brand-indigo/60">For chai, paan, vada pav, samosa etc — items where you don't count stock.</div>
                </div>
              </label>
            </div>
            {!form.data.unlimited_stock && (
              <>
                <div><Label>Current stock</Label><Input data-testid="pf-stock" type="number" value={form.data.stock} onChange={(e)=>setForm({...form, data:{...form.data, stock:e.target.value}})}/></div>
                <div><Label>Min stock level</Label><Input data-testid="pf-minstock" type="number" value={form.data.min_stock} onChange={(e)=>setForm({...form, data:{...form.data, min_stock:e.target.value}})}/></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=>setForm({open:false, mode:"create", data:EMPTY})}>Cancel</Button>
            <Button disabled={busy} data-testid="pf-save" onClick={submit} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
