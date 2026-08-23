import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_COLOR = {
  paid: "bg-brand-leaf/10 text-brand-leaf",
  udhaar: "bg-brand-terracotta/10 text-brand-terracotta",
  pending: "bg-brand-mitti text-brand-indigo/70",
};

export default function Orders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [q, setQ] = useState("");

  const load = () => api.get("/orders", { params: { status, payment_method: payment, q: q||undefined } }).then(r=>setOrders(r.data));
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [status, payment, q]);

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-heading text-2xl font-bold">Orders</h1>
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search #order or customer…" value={q} onChange={(e)=>setQ(e.target.value)} data-testid="orders-search" className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40" data-testid="orders-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="udhaar">Udhaar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-40" data-testid="orders-payment"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="udhaar">Udhaar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-mitti bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-brand-mitti/50 text-left text-xs uppercase tracking-widest text-brand-indigo/70">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-mitti" data-testid="orders-table">
            {orders.length===0 && <tr><td colSpan={7} className="text-center py-8 text-brand-indigo/60">No orders.</td></tr>}
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-brand-mitti/20 cursor-pointer" onClick={()=>nav(`/app/orders/${o.id}`)} data-testid={`order-row-${o.id}`}>
                <td className="px-4 py-3 font-semibold">#{o.order_no}</td>
                <td className="px-4 py-3 text-brand-indigo/70">{(o.created_at||"").slice(0,16).replace("T"," ")}</td>
                <td className="px-4 py-3">{o.customer_name || "Walk-in"}</td>
                <td className="px-4 py-3">{o.items?.length || 0}</td>
                <td className="px-4 py-3 text-right font-semibold">{money(o.total)}</td>
                <td className="px-4 py-3 uppercase text-xs">{o.payment_method}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[o.status] || ""}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
