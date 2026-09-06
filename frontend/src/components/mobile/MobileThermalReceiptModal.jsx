import React from "react";
import { X, Printer, Share2, Check, Store, QrCode } from "lucide-react";

export default function MobileThermalReceiptModal({ isOpen, onClose, billData, merchantData }) {
  if (!isOpen || !billData) return null;

  const storeName = merchantData?.businessName || "ABC General Store";
  const address = merchantData?.address || "Station Road, Navsari, Gujarat";
  const phone = merchantData?.phone || "+91 98765 43210";
  const gstin = merchantData?.gstin || "24AAAAA0000A1Z5";

  const billId = billData.id || "#B1029";
  const date = billData.date || "06 Sep 2026, 04:30 PM";
  const customerName = billData.customer || "Walk-in Guest";
  const customerPhone = billData.customerPhone || "";
  const paymentMode = billData.payment || "Cash";
  const items = billData.itemsList || [
    { name: "Aashirvaad Atta 5kg", qty: 1, rate: 245, total: 245 },
    { name: "Amul Butter 100g", qty: 1, rate: 56, total: 56 },
  ];

  const subtotal = items.reduce((sum, it) => sum + (it.total || it.rate * it.qty), 0);
  const discount = billData.discount || 0;
  const gst = Math.round((subtotal - discount) * 0.05); // 5% GST
  const grandTotal = subtotal - discount + gst;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *TAX INVOICE - ${storeName}*\n` +
      `Bill: ${billId} | Date: ${date}\n` +
      `Customer: ${customerName}\n\n` +
      items.map(it => `• ${it.name} (x${it.qty}) - ₹${it.total || it.rate * it.qty}`).join("\n") +
      `\n\n*Grand Total: ₹${grandTotal}*\n` +
      `Paid via: ${paymentMode}\n` +
      `Thank you for shopping with us!`
    );
    const targetPhone = customerPhone.replace(/\D/g, "") || "";
    if (targetPhone) {
      window.open(`https://wa.me/91${targetPhone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider">Thermal Receipt Preview</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Paper Container */}
        <div className="p-4 overflow-y-auto bg-slate-100/60 flex-1">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed relative">
            
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">{storeName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{address}</div>
              <div className="text-[10px] text-slate-500">Ph: {phone}</div>
              <div className="text-[10px] text-slate-500">GSTIN: {gstin}</div>
            </div>

            {/* Bill Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>INVOICE: <strong className="text-slate-900">{billId}</strong></span>
                <span>{paymentMode}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>DATE: {date}</span>
              </div>
              {customerName && (
                <div className="text-slate-600">
                  CUST: <strong>{customerName}</strong> {customerPhone ? `(${customerPhone})` : ""}
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-slate-900 pb-1.5 text-[10px] border-b border-slate-100">
                <span>ITEM</span>
                <span>QTY x RATE</span>
                <span>AMT</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[10px]">
                    <span className="truncate max-w-[130px]">{it.name}</span>
                    <span className="text-slate-500">{it.qty} x {it.rate}</span>
                    <span className="font-bold text-slate-900">₹{it.total || it.rate * it.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-600">
                <span>Sub Total:</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (5%):</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>GRAND TOTAL:</span>
                <span className="text-[#0066FF]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Thermal Barcode & Footer */}
            <div className="pt-4 text-center">
              <div className="font-mono text-[9px] text-slate-400 tracking-widest">||| |||| || ||||| || |||||| |||</div>
              <div className="text-[10px] font-bold text-slate-700 mt-2">THANK YOU! VISIT AGAIN</div>
              <div className="text-[9px] text-slate-400">Powered by Dukaan POS Cloud</div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print 2"/3" Bill</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-600/25"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
