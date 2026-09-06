import React, { useState } from "react";
import { ArrowLeft, Search, Plus, Phone, Users, Wallet, ArrowUpRight, MessageSquare } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const initialCustomers = [
  { id: 1, name: "Ramesh Sharma", phone: "9825123456", bills: 14, totalSpent: 8450, udhaar: 450 },
  { id: 2, name: "Amit Kumar Patel", phone: "9898011223", bills: 8, totalSpent: 4120, udhaar: 0 },
  { id: 3, name: "Manish Bhai Cloth", phone: "9712398451", bills: 22, totalSpent: 16200, udhaar: 1200 },
  { id: 4, name: "Pooja Ben Joshi", phone: "9426788912", bills: 5, totalSpent: 2190, udhaar: 0 },
  { id: 5, name: "Kishore Bhai Dairy", phone: "9909988112", bills: 19, totalSpent: 11400, udhaar: 650 },
  { id: 6, name: "Suresh Chauhan", phone: "9879055443", bills: 3, totalSpent: 980, udhaar: 220 },
];

export default function MobileCustomers({ onBack, onTabChange }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    const newCust = {
      id: Date.now(),
      name: newName,
      phone: newPhone,
      bills: 0,
      totalSpent: 0,
      udhaar: 0,
    };
    setCustomers([newCust, ...customers]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24 select-none relative">
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
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">Customer Directory</h1>
              <p className="text-[11px] font-semibold text-slate-400">{customers.length} Registered Customers</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#0066FF] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] focus:bg-white transition-all"
          />
        </div>
      </header>

      {/* Customer Rows */}
      <div className="p-4 space-y-2.5">
        {filtered.map((c) => {
          const initials = c.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={c.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center font-extrabold text-xs shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{c.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>+91 {c.phone}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="font-semibold text-slate-600">{c.bills} Bills</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-bold text-slate-800">₹ {c.totalSpent}</span>
                </div>
              </div>

              <div className="text-right">
                {c.udhaar > 0 ? (
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md block mb-1">
                      Udhaar: ₹ {c.udhaar}
                    </span>
                    <button
                      onClick={() => alert(`Sending WhatsApp Khata reminder to ${c.name}`)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center justify-end gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Remind
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    No Dues
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 select-none animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Add New Customer</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#0066FF] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileBottomNav activeTab="customers" onTabChange={onTabChange} />
    </div>
  );
}
