import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, Receipt, CheckCircle2, Clock, Printer, Share2 } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";
import MobileThermalReceiptModal from "./MobileThermalReceiptModal";
import { toast } from "sonner";

const DEFAULT_ORDERS = [];

function getStoredOrders() {
  try {
    const raw = localStorage.getItem("dukaan_orders");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((o) => ({
          ...o,
          id: String(o.id || o.order_no || "").startsWith("#") ? String(o.id || o.order_no) : `#${o.id || o.order_no}`,
          customer: o.customer || o.customer_name || "Customer",
          time: o.date || o.created_at || "Recent",
          items: o.items_count || (o.itemsList && o.itemsList.length) || (o.items && o.items.length) || 1,
          total: o.total || o.grand_total || 0,
          payment: o.payment || o.payment_mode || "Cash",
          status: o.status || "completed",
        }));
      }
    }
  } catch {}
  return [];
}

export default function MobileOrders({ onBack, onTabChange }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const filtered = orders.filter((o) => {
    if (tab === "completed") return o.status === "completed";
    if (tab === "pending") return o.status === "pending";
    return true;
  }).filter((o) =>
    (o.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customer || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleShareOrder = (order) => {
    const text = encodeURIComponent(
      `🧾 *Dukaan Bill ${order.id}*\n\n` +
      `Customer: ${order.customer}\n` +
      `Total Amount: *₹${order.total}* (${order.payment})\n` +
      `Status: ${order.status === "completed" ? "Paid ✅" : "Udhaar Pending ⚠️"}\n\n` +
      `Thank you for shopping with us!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      
      {/* Thermal Receipt Modal */}
      {selectedBillForPrint && (
        <MobileThermalReceiptModal
          isOpen={Boolean(selectedBillForPrint)}
          billData={selectedBillForPrint}
          onClose={() => setSelectedBillForPrint(null)}
        />
      )}

      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">Order History</h1>
              <p className="text-[11px] font-semibold text-slate-400">{orders.length} Total Bills in Dukaan Store</p>
            </div>
          </div>
          <div className="w-9" />
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2">
          {["all", "completed", "pending"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                tab === t ? "bg-[#0066FF] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? "All Bills" : t === "completed" ? "Paid" : "Udhaar"}
            </button>
          ))}
        </div>
      </header>

      {/* Orders List */}
      <div className="p-4 space-y-2.5">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0066FF]">{order.id}</span>
                {order.source === "mobile" && (
                  <span className="text-[9px] font-extrabold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-md">
                    Mobile
                  </span>
                )}
                <span className="text-[10px] text-slate-400 truncate">{order.time}</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5">{order.customer}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>{order.items} items</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{order.payment}</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <div className="text-sm font-black text-slate-900">₹ {order.total}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedBillForPrint(order)}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Thermal Print"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleShareOrder(order)}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="Share WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dock Nav */}
      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
