import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  CreditCard, 
  Trash2, 
  ArrowDownRight, 
  Wallet,
  Receipt,
  TrendingDown,
  Calendar,
  Layers,
  Filter
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

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case "Rent": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    case "Salary": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "Inventory": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
    case "Utilities": return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
    case "Tea / Snacks": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
    case "Maintenance": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
    default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  }
};

const getPaymentModeBadgeClass = (mode) => {
  switch (mode) {
    case "UPI": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20";
    case "Cash": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    case "Bank Transfer": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20";
    case "Card": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
    default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
  }
};

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

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return "None";
    const catCounts = {};
    expenses.forEach(e => {
      catCounts[e.category] = (catCounts[e.category] || 0) + (Number(e.amount) || 0);
    });
    let top = "Utilities";
    let max = 0;
    Object.entries(catCounts).forEach(([cat, sum]) => {
      if (sum > max) {
        max = sum;
        top = cat;
      }
    });
    return top;
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans">
      {/* =========================================================
          HERO BANNER (DUKAAN 3.0 MODERN DARK GRADIENT)
      ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono">STORE CASH OUTFLOW</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-[11px] font-bold text-rose-300 border border-rose-500/30">
                Live Expenses
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Expenses & Outflow
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track daily store expenses, rent, utilities, staff salaries, and cash outflow with category breakdowns.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3">
          <Button
            onClick={() => setModalOpen(true)}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </Button>
        </div>
      </div>

      {/* =========================================================
          KPI METRIC CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>This Month Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹ {thisMonthExpense.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-rose-500 font-semibold mt-0.5">
            Total outflow in {new Date().toLocaleDateString("en-IN", { month: "long" })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>All-Time Recorded</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            ₹ {totalExpense.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across {expenses.length} recorded entries
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Top Outflow Category</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {topCategory}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Highest expense category to date
          </div>
        </div>
      </div>

      {/* =========================================================
          SEARCH & CATEGORY FILTER BAR
      ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === c
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          EXPENSES TABLE
      ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expense Title</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Mode</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">No expense records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search or record a new expense.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryBadgeClass(exp.category)}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentModeBadgeClass(exp.mode)}`}>
                        {exp.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-black text-rose-600 dark:text-rose-400 text-sm">
                      - ₹{Number(exp.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
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

      {/* =========================================================
          RECORD EXPENSE MODAL
      ========================================================= */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Record Store Expense
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Title / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shop Electricity Bill, Staff Lunch, Packaging Bags"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid by Rohit, Receipt No #44"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border-slate-200 dark:border-slate-700 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold px-5"
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
