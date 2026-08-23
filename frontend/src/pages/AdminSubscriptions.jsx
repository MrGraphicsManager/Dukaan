import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ImageIcon, Users, Store, ClipboardCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

function Kpi({ label, value, Icon }) {
  return (
    <div className="rounded-xl border border-brand-mitti bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-brand-terracotta font-semibold">{label}</div>
        <Icon className="w-4 h-4 text-brand-indigo/50" />
      </div>
      <div className="mt-1 font-heading text-3xl font-bold">{value}</div>
    </div>
  );
}

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);

  const load = () => {
    api.get("/admin/subscriptions", { params: { status } }).then(r => setRows(r.data)).catch(()=>{});
    api.get("/admin/stats").then(r => setStats(r.data)).catch(()=>{});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  if (user === false) return <Navigate to="/login" replace />;
  if (user && !user.is_admin) return <Navigate to="/app" replace />;

  const activate = async (id) => {
    await api.post(`/admin/subscriptions/${id}/activate`);
    toast.success("Activated");
    load();
  };
  const reject = async (id) => {
    const note = prompt("Reject note (optional):") || "";
    await api.post(`/admin/subscriptions/${id}/reject`, null, { params: { note } });
    toast.success("Rejected");
    load();
  };

  return (
    <div className="space-y-6 animate-fade-up" data-testid="admin-page">
      <h1 className="font-heading text-2xl font-bold">Admin · Subscriptions</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Users" value={stats.users} Icon={Users}/>
          <Kpi label="Shops" value={stats.shops} Icon={Store}/>
          <Kpi label="Active subs" value={stats.active_subscriptions} Icon={CheckCircle2}/>
          <Kpi label="Pending subs" value={stats.pending_subscriptions} Icon={ClipboardCheck}/>
        </div>
      )}

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList data-testid="admin-status-tabs">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-xl border border-brand-mitti bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-brand-mitti/50 text-left text-xs uppercase tracking-widest text-brand-indigo/70">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">UPI Ref</th>
              <th className="px-4 py-3">Screenshot</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-mitti" data-testid="admin-subs-table">
            {rows.length===0 && <tr><td colSpan={8} className="text-center py-8 text-brand-indigo/60">No subscriptions.</td></tr>}
            {rows.map(s => (
              <tr key={s.id} className="hover:bg-brand-mitti/20">
                <td className="px-4 py-3">{(s.created_at||"").slice(0,16).replace("T"," ")}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{s.payer_name || "—"}</div>
                  <div className="text-xs text-brand-indigo/60">{s.user_email}</div>
                </td>
                <td className="px-4 py-3">{s.plan_name}</td>
                <td className="px-4 py-3 text-right font-semibold">{money(s.amount)}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.upi_ref}</td>
                <td className="px-4 py-3">
                  {s.screenshot_data_url ? (
                    <button onClick={()=>setPreview(s.screenshot_data_url)} className="text-brand-terracotta hover:underline inline-flex items-center gap-1 text-xs">
                      <ImageIcon className="w-3.5 h-3.5"/> View
                    </button>
                  ) : <span className="text-brand-indigo/40 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    s.status==="active" ? "bg-brand-leaf/10 text-brand-leaf" :
                    s.status==="pending" ? "bg-brand-terracotta/10 text-brand-terracotta" :
                    "bg-destructive/10 text-destructive"
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {s.status === "pending" && (
                    <>
                      <Button size="sm" data-testid={`activate-${s.id}`} onClick={()=>activate(s.id)} className="bg-brand-leaf hover:bg-brand-leaf/90 text-white mr-2">
                        <CheckCircle2 className="w-4 h-4 mr-1"/> Activate
                      </Button>
                      <Button size="sm" variant="outline" onClick={()=>reject(s.id)} className="border-destructive/40 text-destructive">
                        <XCircle className="w-4 h-4 mr-1"/> Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!preview} onOpenChange={(o)=>!o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Payment screenshot</DialogTitle></DialogHeader>
          {preview && <img src={preview} alt="" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
