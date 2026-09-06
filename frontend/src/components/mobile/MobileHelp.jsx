import React, { useState } from "react";
import { ArrowLeft, Search, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, FileText } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const faqs = [
  { q: "How do I create my first bill?", a: "Tap on '+ New Bill' from the home dashboard or bottom navigation. Search or tap items to add them to the cart, then tap 'Create Bill'." },
  { q: "How does Udhaar / Khata reminder work?", a: "Go to Udhaar screen, select any customer with pending dues, and tap the 'Remind' button to generate a ready-made WhatsApp message with payment details." },
  { q: "Can I connect a Bluetooth thermal printer?", a: "Yes, Dukaan Pro supports all 2-inch and 3-inch ESC/POS thermal printers via Bluetooth for instant receipt printing." },
  { q: "Is my store data automatically backed up?", a: "Yes, every transaction is synced in real-time to the Dukaan Cloud so you never lose your records even if you switch phones." },
];

export default function MobileHelp({ onBack, onTabChange }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Help & Support</h1>
            <p className="text-[11px] font-semibold text-slate-400">24/7 Merchant Assistance</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Contact Channels Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => alert("Opening WhatsApp Support (+91 90000 12345)")}
            className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left cursor-pointer hover:bg-emerald-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-xs font-extrabold text-emerald-900">WhatsApp Chat</div>
            <div className="text-[10px] text-emerald-700 font-medium">Instant reply (under 2m)</div>
          </button>

          <button
            onClick={() => alert("Calling Helpline 1800-123-4567")}
            className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-xs font-extrabold text-blue-900">Toll-Free Call</div>
            <div className="text-[10px] text-blue-700 font-medium">10 AM - 8 PM Daily</div>
          </button>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl border border-slate-150/80 shadow-2xs p-4">
          <div className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0066FF]" />
            <span>Frequently Asked Questions</span>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-3 text-left flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3 text-xs text-slate-500 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
