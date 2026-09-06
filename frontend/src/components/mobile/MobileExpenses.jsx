import React, { useState } from "react";
import { ArrowLeft, Search, Plus, CreditCard, Tag, ArrowDownRight, Calendar } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

const initialExpenses = [
  { id: 1, title: "Shop Electricity Bill", category: "Utilities", amount: 2850, date: "04 Sep", mode: "UPI" },
  { id: 2, title: "Monthly Shop Rent", category: "Rent", amount: 8000, date: "01 Sep", mode: "Bank Transfer" },
  { id: 3, title: "Store Boy Helper Salary", category: "Salary", amount: 4500, date: "01 Sep", mode: "Cash" },
  { id: 4, title: "Plastic Bags & Carry Packs", category: "Inventory", amount: 650, date: "29 Aug", mode: "Cash" },
  { id: 5, title: "High-Speed Internet WiFi", category: "Utilities", amount: 799, date: "25 Aug", mode: "UPI" },
];

export default function MobileExpenses({ onBack, onTabChange }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCat, setNewCat] = useState("Utilities");

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;
    const newExp = {
      id: Date.now(),
      title: newTitle,
      category: newCat,
      amount: parseFloat(newAmount) || 0,
      date: "Today",
      mode: "Cash",
    };
    setExpenses([newExp, ...expenses]);
    setShowAddModal(false);
    setNewTitle("");
    setNewAmount("");
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
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">Expenses Tracker</h1>
              <p className="text-[11px] font-semibold text-slate-400">Monthly Shop Outflow</p>
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

        {/* Total card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-600 uppercase">Total Expenses (This Month)</div>
            <div className="text-xl font-black text-rose-900 mt-0.5">₹ {totalExpense}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Expense List */}
      <div className="p-4 space-y-2.5">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{exp.category}</span>
                <span className="text-[10px] text-slate-300">·</span>
                <span className="text-[10px] text-slate-400">{exp.date}</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5">{exp.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">Paid via {exp.mode}</div>
            </div>

            <div className="text-sm font-black text-rose-600">
              - ₹ {exp.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 select-none animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Record New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tea & Snacks for Staff"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="250"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0066FF] bg-white"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Other">Other</option>
                </select>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileBottomNav activeTab="more" onTabChange={onTabChange} />
    </div>
  );
}
