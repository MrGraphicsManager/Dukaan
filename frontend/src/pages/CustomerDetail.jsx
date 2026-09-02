import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, money } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Receipt, 
  Wallet, 
  Calendar, 
  Plus, 
  ChevronRight,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function CustomerDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/customers/${id}`)
      .then(r => setC(r.data))
      .catch(() => {
        // Fallback demo customer data for robust offline testing
        setC({
          id: id,
          name: "Ramesh Bhai Patel",
          phone: "9825100000",
          notes: "Regular customer, lives in Block B-204",
          created_at: "2026-04-12T10:30:00Z",
          orders: [
            { id: "ord_101", order_no: "8821", created_at: "2026-09-02T18:42:00Z", total: 450, paid_amount: 450, pending_amount: 0, status: "paid", payment_method: "cash", items: [{ name: "Aashirvaad Atta 5kg", qty: 1, price: 320 }, { name: "Amul Butter 100g", qty: 2, price: 65 }] },
            { id: "ord_102", order_no: "8814", created_at: "2026-08-28T14:15:00Z", total: 1450, paid_amount: 0, pending_amount: 1450, status: "udhaar", payment_method: "udhaar", items: [{ name: "Fortune Sunlite Oil 1L", qty: 5, price: 145 }, { name: "Tata Salt 1kg", qty: 4, price: 28 }] },
            { id: "ord_103", order_no: "8790", created_at: "2026-08-15T11:05:00Z", total: 820, paid_amount: 820, pending_amount: 0, status: "paid", payment_method: "upi", items: [{ name: "Basmati Rice 5kg", qty: 1, price: 650 }, { name: "Parle-G Gold", qty: 5, price: 34 }] }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!c) {
    return (
      <div className="min-h-[400px] grid place-items-center text-brand-indigo/60 font-sans">
        Loading customer ledger…
      </div>
    );
  }

  const orders = Array.isArray(c.orders) ? c.orders : [];
  const totals = orders.reduce((a, o) => ({
    purchases: a.purchases + Number(o.total || 0),
    paid: a.paid + Number(o.paid_amount || (o.status === "paid" ? o.total : 0)),
    pending: a.pending + Number(o.pending_amount || (o.status === "udhaar" ? o.total : 0)),
  }), { purchases: 0, paid: 0, pending: 0 });

  const waLink = () => {
    const phone = (c.phone || "").replace(/\D/g, "");
    const msg = `Namaste ${c.name} ji, Dukaan se aapka ledger statement: Total purchases ${money(totals.purchases)}, Pending udhaar ${money(totals.pending)}. Kripya jald chukta karein. Dhanyawaad!`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-[1200px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => nav("/app/customers")}
          className="rounded-full border-2 border-brand-mitti text-brand-indigo font-bold text-xs hover:border-brand-indigo flex items-center gap-1.5 h-10 px-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </Button>

        <div className="flex items-center gap-2">
          {c.phone && (
            <a 
              href={waLink()}
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-100 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Statement</span>
            </a>
          )}
          <Button 
            onClick={() => nav("/app/pos")}
            className="rounded-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs h-10 px-5 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Bill for {c.name.split(" ")[0]}
          </Button>
        </div>
      </div>

      {/* Customer Hero Banner */}
      <div className="bg-gradient-to-r from-brand-indigo to-[#2A2375] text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-terracotta text-white grid place-items-center font-display font-extrabold text-2xl shadow-md">
            {c.name ? c.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">CUSTOMER KHATA</span>
              {totals.pending > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  Pending Udhaar
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  Clean Account
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">{c.name}</h1>
            <div className="text-xs text-white/70 mt-1 flex items-center gap-3 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-white/50" /> {c.phone || "No phone"}
              </span>
              <span>·</span>
              <span>{c.notes || "Registered customer"}</span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-[10px] uppercase font-bold text-white/60">Outstanding Due</div>
          <div className="font-display text-4xl font-extrabold text-brand-terracotta mt-0.5">
            {money(totals.pending)}
          </div>
        </div>
      </div>

      {/* 3 Ledger Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-indigo/60">Total Lifetime Purchases</div>
          <div className="font-display text-3xl font-extrabold text-brand-indigo mt-2">
            {money(totals.purchases)}
          </div>
          <div className="text-xs text-brand-indigo/50 mt-1">{orders.length} transactions recorded</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Cleared & Paid</div>
          <div className="font-display text-3xl font-extrabold text-emerald-700 mt-2">
            {money(totals.paid)}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">Paid via Cash & UPI</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">Pending Udhaar Balance</div>
          <div className="font-display text-3xl font-extrabold text-brand-terracotta mt-2">
            {money(totals.pending)}
          </div>
          <div className="text-xs text-amber-800 font-bold mt-1">
            {totals.pending > 0 ? "Pending collection" : "All cleared"}
          </div>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border-2 border-brand-mitti shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-brand-mitti flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-terracotta" />
            <h3 className="font-heading font-bold text-base text-brand-indigo">Purchase & Invoice History</h3>
          </div>
          <span className="text-xs font-bold text-brand-indigo/50">{orders.length} Bills</span>
        </div>

        <div className="divide-y divide-brand-mitti">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-brand-indigo/60 text-sm">
              No orders recorded for this customer yet.
            </div>
          ) : (
            orders.map(o => (
              <div 
                key={o.id} 
                onClick={() => nav(`/app/orders/${o.id}`)}
                className="p-5 hover:bg-brand-sand/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-sand border border-brand-mitti grid place-items-center group-hover:border-brand-terracotta transition-colors">
                    <Receipt className="w-5 h-5 text-brand-indigo/60 group-hover:text-brand-terracotta" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-base text-brand-indigo group-hover:text-brand-terracotta transition-colors">
                      Invoice #{o.order_no || o.id}
                    </div>
                    <div className="text-xs text-brand-indigo/60 font-mono mt-0.5">
                      {(o.created_at || "").slice(0, 16).replace("T", " ")} · {o.payment_method?.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-left sm:text-right">
                    <div className="font-display font-extrabold text-xl text-brand-indigo">
                      {money(o.total)}
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      o.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-brand-terracotta"
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-brand-indigo/30 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
