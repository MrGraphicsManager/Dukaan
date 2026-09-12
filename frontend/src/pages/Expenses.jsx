import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  CreditCard, 
  Trash2, 
  ArrowDownRight, 
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const DEFAULT_EXPENSES = [
  { id: "exp-1", title: "Shop Electricity Bill", category: "Utilities", amount: 2850, date: "2026-09-04", mode: "UPI", notes: "August power bill" },
  { id: "exp-2", title: "Monthly Shop Rent", category: "Rent", amount: 8000, date: "2026-09-01", mode: "Bank Transfer", notes: "Landlord Sharma ji" },
  { id: "exp-3", title: "Store Boy Helper Salary", category: "Salary", amount: 4500, date: "2026-09-01", mode: "Cash", notes: "Advance deducted" },
  { id: "exp-4", title: "Plastic Bags and Carry Packs", category: "Inventory", amount: 650, date: "2026-08-29", mode: "Cash", notes: "500 carry bags" },
  { id: "exp-5", title: "High-Speed Internet WiFi", category: "Utilities", amount: 799, date: "2026-08-25", mode: "UPI", notes: "Airtel fiber" },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem("dukaan_expenses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_EXPENSES;
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [mode, setMode] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    localStorage.setItem("dukaan_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const categories = ["Utilities", "Rent", "Salary", "Inventory", "Tea / Snacks", "Maintenance", "Other"];

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      toast.error("Please enter expense title and amount");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const newEntry = {
      id: "exp-" + Date.now(),
      title: title.trim(),
      category,
      amount: num,
      date,
      mode,
      notes: notes.trim(),
    };

    setExpenses([newEntry, ...expenses]);
    toast.success("Recorded expense entry");
    setTitle("");
    setAmount("");
    setNotes("");
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success("Expense deleted");
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = (e.title || "").toLowerCase().includes(search.toLowerCase()) || 
                          (e.category || "").toLowerCase().includes(search.toLowerCase()) ||
                          (e.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, search, categoryFilter]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  }, [expenses]);

  const thisMonthExpense = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return expenses
      .filter(it => (it.date || "").startsWith(currentMonth))
      .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expenses & Outflow
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily store expenses, rent, utilities, staff salaries, and supplier cash outflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2 text-sm shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>THIS MONTH EXPENSES</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹ {thisMonthExpense.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-rose-500 font-medium mt-1">
            Total outflow for {new Date().toLocaleDateString("en-IN", { month: "long" })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>ALL-TIME RECORDED</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹ {totalExpense.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Across {expenses.length} recorded entries
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>TOP CATEGORY</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            Rent & Utilities
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            Largest monthly fixed overhead
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter("all")}
            className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 " + (
              categoryFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            )}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 " + (
                categoryFilter === c
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400">Date</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400">Expense Title</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400">Category</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400">Payment Mode</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400">Amount</th>
                <th className="py-3.5 px-5 text-xs font-semibold text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium text-sm">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-medium">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {exp.mode}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-rose-600 dark:text-rose-400 text-sm">
                      - ₹ {Number(exp.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete expense entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Store Expense
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Expense Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shop Electricity Bill, Staff Lunch, Packaging Bags"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="₹ 0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid by Rohit, Receipt No #44"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
              >
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
