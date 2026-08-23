import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, money, API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [o, setO] = useState(null);

  useEffect(() => { api.get(`/orders/${id}`).then(r=>setO(r.data)); }, [id]);
  if (!o) return <div className="text-brand-indigo/60">Loading…</div>;

  const shopId = localStorage.getItem("dukaan_shop_id");
  const pdfUrl = `${API_BASE}/orders/${id}/invoice.pdf?shop_id=${shopId}`;

  const share = async () => {
    const shareData = { title: `Invoice #${o.order_no}`, text: `Bill from your shop — Total ${money(o.total)}`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch {} }
    else { await navigator.clipboard.writeText(pdfUrl); toast.success("Invoice link copied!"); }
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>nav(-1)}>← Back</Button>
        <h1 className="font-heading text-2xl font-bold">Invoice #{o.order_no}</h1>
      </div>

      <div className="rounded-xl border border-brand-mitti bg-white shadow-card p-6 ledger-lines">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-brand-terracotta">Date</div>
            <div className="font-medium">{(o.created_at||"").slice(0,19).replace("T"," ")}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-brand-terracotta">Status</div>
            <div className={`font-heading font-bold ${o.status==="paid"?"text-brand-leaf":"text-brand-terracotta"}`}>{o.status?.toUpperCase()}</div>
          </div>
        </div>
        {o.customer_name && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-widest text-brand-indigo/60">Customer</div>
            <div className="font-medium">{o.customer_name} {o.customer_phone && `· ${o.customer_phone}`}</div>
          </div>
        )}
        <div className="mt-6">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs uppercase tracking-widest text-brand-indigo/60 border-b border-brand-mitti pb-2">
            <div>Item</div><div className="text-right">Qty</div><div className="text-right">Price</div><div className="text-right">Amount</div>
          </div>
          {o.items?.map((it,i)=>(
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 py-2 border-b border-brand-mitti/50 last:border-0 text-sm">
              <div>{it.name}</div>
              <div className="text-right">{it.qty}</div>
              <div className="text-right">{money(it.price)}</div>
              <div className="text-right font-semibold">{money(it.price*it.qty)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-{money(o.discount)}</span></div>
          <div className="flex justify-between font-heading font-bold text-xl text-brand-terracotta pt-2 border-t border-brand-mitti">
            <span>Total</span><span>{money(o.total)}</span>
          </div>
          <div className="flex justify-between pt-2 text-xs uppercase tracking-widest text-brand-indigo/60">
            <span>Payment</span><span>{o.payment_method}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button data-testid="invoice-download" onClick={()=>window.open(pdfUrl, "_blank")} className="bg-brand-indigo hover:bg-brand-indigo/90 text-white active:scale-95 transition-transform">
          <Download className="w-4 h-4 mr-1"/> Download PDF
        </Button>
        <Button data-testid="invoice-print" variant="outline" onClick={()=>window.open(pdfUrl, "_blank")?.print?.() || window.print()} className="border-brand-mitti">
          <Printer className="w-4 h-4 mr-1"/> Print
        </Button>
        <Button data-testid="invoice-share" variant="outline" onClick={share} className="border-brand-mitti">
          <Share2 className="w-4 h-4 mr-1"/> Share
        </Button>
      </div>
    </div>
  );
}
