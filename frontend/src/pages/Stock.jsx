import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Infinity as InfinityIcon } from "lucide-react";

function statusBadge(p) {
  if (p.unlimited_stock) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-indigo/10 text-brand-indigo inline-flex items-center gap-1"><InfinityIcon className="w-3 h-3"/> Unlimited</span>;
  if (p.stock <= 0) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">🔴 Out of Stock</span>;
  if (p.stock <= p.min_stock) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-terracotta/10 text-brand-terracotta">⚠️ Low Stock</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-leaf/10 text-brand-leaf">In Stock</span>;
}

export default function Stock() {
  const [items, setItems] = useState([]);
  const [adjust, setAdjust] = useState({ open:false, product:null, qty:"" });
  const [q, setQ] = useState("");

  const load = () => api.get("/products", { params: { q: q||undefined } }).then(r => setItems(r.data));
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [q]);

  const submitAdjust = async () => {
    const n = Number(adjust.qty || 0);
    if (!n) return;
    await api.post(`/products/${adjust.product.id}/stock`, { qty: n, reason: "restock" });
    toast.success(`Stock updated for ${adjust.product.name}`);
    setAdjust({ open:false, product:null, qty:"" });
    load();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Stock</h1>
        <Input placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} data-testid="stock-search" className="max-w-xs" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-mitti bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-brand-mitti/50 text-left text-xs uppercase tracking-widest text-brand-indigo/70">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Current</th>
              <th className="px-4 py-3 text-right">Min</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-mitti" data-testid="stock-table">
            {items.length===0 && <tr><td colSpan={5} className="text-center py-8 text-brand-indigo/60">No products.</td></tr>}
            {items.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-brand-indigo/60">{p.category}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {p.unlimited_stock ? <span className="inline-flex items-center gap-1 text-brand-indigo/60"><InfinityIcon className="w-4 h-4"/></span> : p.stock}
                </td>
                <td className="px-4 py-3 text-right text-brand-indigo/60">{p.unlimited_stock ? "—" : p.min_stock}</td>
                <td className="px-4 py-3">{statusBadge(p)}</td>
                <td className="px-4 py-3 text-right">
                  {!p.unlimited_stock && (
                    <Button size="sm" data-testid={`add-stock-${p.id}`} onClick={()=>setAdjust({open:true, product:p, qty:""})} className="bg-brand-indigo hover:bg-brand-indigo/90 text-white">
                      <Plus className="w-4 h-4 mr-1"/> Add stock
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={adjust.open} onOpenChange={(o)=>setAdjust({...adjust, open:o})}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add stock: {adjust.product?.name}</DialogTitle></DialogHeader>
          <div>
            <Label>Quantity to add</Label>
            <Input data-testid="stock-adjust-qty" type="number" value={adjust.qty} onChange={(e)=>setAdjust({...adjust, qty:e.target.value})}/>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={()=>setAdjust({open:false, product:null, qty:""})}>Cancel</Button>
            <Button data-testid="stock-adjust-save" onClick={submitAdjust} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
