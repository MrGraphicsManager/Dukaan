import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

function Kpi({ label, value }) {
  return (
    <div className="rounded-xl border border-brand-mitti bg-white p-4">
      <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">{label}</div>
      <div className="mt-1 font-heading text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState("week");
  const [r, setR] = useState(null);

  useEffect(() => { api.get("/reports", { params: { period } }).then(res => setR(res.data)); }, [period]);
  if (!r) return <div className="text-brand-indigo/60">Loading…</div>;

  return (
    <div className="space-y-6 animate-fade-up" data-testid="reports">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList data-testid="reports-period">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Kpi label="Sales" value={money(r.totals.sales)} />
        <Kpi label="Orders" value={r.totals.orders} />
        <Kpi label="Cash" value={money(r.totals.cash)} />
        <Kpi label="UPI" value={money(r.totals.upi)} />
        <Kpi label="Udhaar" value={money(r.totals.udhaar)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-brand-mitti bg-white p-5 shadow-card">
          <div className="font-heading font-bold">Sales trend</div>
          <div className="h-64 mt-3" data-testid="reports-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={r.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" />
                <XAxis dataKey="date" tick={{ fill: "#1F1A5D", fontSize: 11 }} />
                <YAxis tick={{ fill: "#1F1A5D", fontSize: 11 }} />
                <Tooltip formatter={(v)=>money(v)} />
                <Line type="monotone" dataKey="total" stroke="#C36A4A" strokeWidth={2.5} dot={{ fill: "#1F1A5D", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-brand-mitti bg-white p-5 shadow-card">
          <div className="font-heading font-bold">Top products</div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.top_products}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D5" />
                <XAxis dataKey="name" tick={{ fill: "#1F1A5D", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#1F1A5D", fontSize: 11 }} />
                <Tooltip formatter={(v)=>money(v)} />
                <Bar dataKey="revenue" fill="#1F1A5D" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
