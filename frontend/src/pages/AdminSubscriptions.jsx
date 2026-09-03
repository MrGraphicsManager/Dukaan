import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  ImageIcon, 
  Users, 
  Store, 
  ClipboardCheck, 
  ShieldCheck, 
  Plus, 
  RotateCcw,
  Search,
  UserCheck,
  AlertOctagon
} from "lucide-react";
import { Navigate } from "react-router-dom";

function Kpi({ label, value, Icon }) {
  return (
    <div className="rounded-2xl border border-brand-mitti bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-brand-terracotta font-bold">{label}</div>
        <Icon className="w-5 h-5 text-brand-indigo/50" />
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-brand-indigo">{value}</div>
    </div>
  );
}

export default function AdminSubscriptions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gstStatus, setGstStatus] = useState("pending");
  const [gstRows, setGstRows] = useState([]);

  // Grant modal state
  const [grantModal, setGrantModal] = useState({
    open: false,
    email: "",
    plan: "business",
    days: 30,
    note: ""
  });
  const [granting, setGranting] = useState(false);

  const load = () => {
    api.get("/admin/subscriptions", { params: { status: status === "all" ? undefined : status } })
      .then(r => setRows(Array.isArray(r.data) ? r.data : []))
      .catch(() => setRows([]));

    api.get("/admin/stats")
      .then(r => setStats(r.data))
      .catch(() => {});

    api.get("/admin/users")
      .then(r => setUsersList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setUsersList([]));
  };

  const loadGST = () => {
    api.get("/admin/gst-requests", { params: { status: gstStatus } })
      .then(r => setGstRows(Array.isArray(r.data) ? r.data : []))
      .catch(() => setGstRows([]));
  };

  useEffect(() => { load(); }, [status]);
  useEffect(() => { loadGST(); }, [gstStatus]);

  if (user === false) return <Navigate to="/login" replace />;
  if (user && !user.is_admin) return <Navigate to="/app" replace />;

  const activate = async (id) => {
    try { 
      await api.post(`/admin/subscriptions/${id}/activate`); 
    } catch { 
      await api.post(`/admin/subscriptions/${id}/approve`); 
    }
    toast.success("Subscription activated!"); 
    load();
  };

  const reject = async (id) => {
    const note = prompt("Reject note (optional):") || "";
    await api.post(`/admin/subscriptions/${id}/reject`, null, { params: { note } });
    toast.success("Subscription rejected!"); 
    load();
  };

  const revokeSubscription = async (id, userEmail) => {
    const reason = prompt(`Revoke subscription for ${userEmail || "this user"}? Enter reason (e.g. Refund issued):`, "Refund issued");
    if (reason === null) return;
    try {
      await api.post(`/admin/subscriptions/${id}/revoke`, null, { params: { reason } });
      toast.success("Subscription cancelled and access revoked!");
      load();
    } catch (e) {
      toast.error("Failed to revoke subscription");
    }
  };

  const submitGrant = async (e) => {
    e.preventDefault();
    if (!grantModal.email.trim()) {
      toast.error("Please enter a valid user email");
      return;
    }
    setGranting(true);
    try {
      await api.post("/admin/subscriptions/grant", {
        user_email: grantModal.email.trim().toLowerCase(),
        plan: grantModal.plan,
        days: Number(grantModal.days) || 30,
        note: grantModal.note.trim() || "Manual grant by admin"
      });
      toast.success(`Successfully granted ${grantModal.plan.toUpperCase()} plan to ${grantModal.email}!`);
      setGrantModal({ open: false, email: "", plan: "business", days: 30, note: "" });
      load();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to grant subscription. User might not exist.";
      toast.error(msg);
    } finally {
      setGranting(false);
    }
  };

  const reviewGST = async (id, action) => {
    const note = prompt(action === "approve" ? "Approval note (optional):" : "Decline reason (optional):") || "";
    try {
      await api.post(`/admin/gst-requests/${id}/${action}`, { note });
      toast.success(action === "approve" ? "GST verified" : "GST request declined");
      loadGST();
    } catch (e) { 
      toast.error(e.response?.data?.detail || "GST review failed"); 
    }
  };

  const filteredUsers = usersList.filter(u => 
    !userQuery || 
    (u.email || "").toLowerCase().includes(userQuery.toLowerCase()) ||
    (u.name || "").toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="space-y-7 animate-fade-up max-w-[1400px] mx-auto pb-16 font-sans" data-testid="admin-page">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-terracotta mb-1">Dukaan Master Control</div>
          <h1 className="font-display text-3xl font-bold text-brand-indigo">Admin Dashboard & Subscriptions</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setGrantModal({ open: true, email: "", plan: "business", days: 30, note: "" })}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-5 shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Grant / Add Subscription</span>
          </Button>

          <Button
            variant="outline"
            onClick={load}
            className="rounded-full border-2 border-brand-mitti text-brand-indigo font-bold text-xs h-11 px-4 hover:border-brand-indigo flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="Total Users" value={stats.users} Icon={Users} />
          <Kpi label="Total Shops" value={stats.shops} Icon={Store} />
          <Kpi label="Active Subscriptions" value={stats.active_subscriptions} Icon={CheckCircle2} />
          <Kpi label="Pending Reviews" value={stats.pending_subscriptions} Icon={ClipboardCheck} />
        </div>
      )}

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-brand-mitti p-1 rounded-2xl">
          <TabsTrigger value="subscriptions" className="rounded-xl px-5 font-bold text-xs">
            Subscriptions ({rows.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-5 font-bold text-xs">
            User Accounts ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="gst" className="rounded-xl px-5 font-bold text-xs">
            GST Verifications ({gstRows.length})
          </TabsTrigger>
        </TabsList>

        {/* =========================================================
            TAB 1: SUBSCRIPTIONS MANAGEMENT
        ========================================================= */}
        <TabsContent value="subscriptions" className="space-y-4 mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-mitti">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-indigo/60">Filter Status:</span>
              {["all", "active", "pending", "rejected", "cancelled"].map(v => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                    status === v 
                      ? "bg-brand-indigo text-white shadow-xs" 
                      : "bg-brand-sand/60 text-brand-indigo/70 hover:bg-brand-sand border border-brand-mitti"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setGrantModal({ open: true, email: "", plan: "premium", days: 365, note: "" })}
              className="text-xs font-bold rounded-full text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              + Quick 1-Year Grant
            </Button>
          </div>

          <div className="overflow-x-auto rounded-3xl border-2 border-brand-mitti bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-brand-sand/50 text-left text-xs uppercase tracking-wider text-brand-indigo/70 font-bold border-b border-brand-mitti">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5">Source / Ref</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mitti">
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-brand-indigo/50">
                      No subscriptions found matching status "{status}".
                    </td>
                  </tr>
                )}
                {rows.map(s => (
                  <tr key={s.id} className="hover:bg-brand-sand/20 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-brand-indigo/60 font-mono">
                      {(s.created_at || "").slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-brand-indigo">{s.payer_name || "Shop Owner"}</div>
                      <div className="text-xs text-brand-indigo/60 font-mono">{s.user_email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-brand-indigo capitalize">{s.plan_name || s.plan}</span>
                      {s.expires_at && (
                        <div className="text-[11px] text-brand-indigo/50">
                          Expires: {s.expires_at.slice(0, 10)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-brand-indigo">
                      {money(s.amount || 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-sand border border-brand-mitti">
                        {s.source === "admin_grant" ? "Admin Grant" : (s.upi_ref || s.payment_id || "Direct / Webhook")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      {s.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => activate(s.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activate
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => reject(s.id)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-xl">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {s.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeSubscription(s.id, s.user_email)}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold rounded-xl flex-inline items-center gap-1"
                          title="Revoke subscription access if user took refund"
                        >
                          <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                          <span>Revoke (Refunded)</span>
                        </Button>
                      )}

                      {s.screenshot_data_url && (
                        <button
                          onClick={() => setPreview(s.screenshot_data_url)}
                          className="text-xs text-brand-terracotta hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Screenshot
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* =========================================================
            TAB 2: REGISTERED USER ACCOUNTS
        ========================================================= */}
        <TabsContent value="users" className="space-y-4 mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-mitti">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-brand-indigo/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search users by name or email..."
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                className="pl-9 rounded-xl border-brand-mitti text-xs"
              />
            </div>
            <div className="text-xs text-brand-indigo/60 font-semibold">
              Showing {filteredUsers.length} user accounts
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border-2 border-brand-mitti bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-brand-sand/50 text-left text-xs uppercase tracking-wider text-brand-indigo/70 font-bold border-b border-brand-mitti">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Current Plan</th>
                  <th className="px-5 py-3.5">Plan Expiry</th>
                  <th className="px-5 py-3.5 text-right">Quick Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-mitti">
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-brand-indigo/50">
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-brand-sand/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-brand-indigo">{u.name || "Shop Owner"}</div>
                      <div className="text-xs text-brand-indigo/60 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        u.is_admin ? "bg-purple-100 text-purple-800" : "bg-blue-50 text-blue-700"
                      }`}>
                        {u.is_admin ? "Admin" : "Merchant"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold capitalize text-brand-indigo">
                        {u.subscription?.plan || "starter"}
                      </span>
                      <span className={`ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        u.subscription?.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {u.subscription?.status || "trial"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-brand-indigo/70">
                      {u.subscription?.expires_at ? u.subscription.expires_at.slice(0, 10) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => setGrantModal({
                          open: true,
                          email: u.email,
                          plan: u.subscription?.plan === "starter" ? "business" : "premium",
                          days: 30,
                          note: "Admin update / grant"
                        })}
                        className="rounded-xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs"
                      >
                        Grant / Extend Plan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* =========================================================
            TAB 3: GST VERIFICATIONS
        ========================================================= */}
        <TabsContent value="gst" className="space-y-4 mt-5">
          <div className="rounded-3xl border-2 border-brand-mitti bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-brand-indigo">
              <ShieldCheck className="w-6 h-6 text-brand-terracotta"/> Manual GST Verification Queue
            </div>
            <p className="mt-1 text-xs text-brand-indigo/70">
              Premium merchants submit their 15-digit GSTIN here. Review and approve to activate verified GST invoices.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {["pending", "approved", "declined", "all"].map(v => (
                <button
                  key={v}
                  onClick={() => setGstStatus(v)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    gstStatus === v 
                      ? "bg-brand-indigo text-white border-brand-indigo" 
                      : "bg-white border-brand-mitti text-brand-indigo/70"
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-mitti">
              <table className="w-full text-sm">
                <thead className="bg-brand-sand/50 text-left text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Shop</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">GST Number</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-mitti">
                  {gstRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-brand-indigo/50">
                        No GST verification requests.
                      </td>
                    </tr>
                  )}
                  {gstRows.map(g => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 text-xs font-mono">{(g.submitted_at || "").slice(0, 16).replace("T", " ")}</td>
                      <td className="px-4 py-3 font-bold text-brand-indigo">{g.shop_name || "—"}</td>
                      <td className="px-4 py-3">
                        <div>{g.owner_name || "—"}</div>
                        <div className="text-xs text-brand-indigo/50 font-mono">{g.user_email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-xs text-brand-indigo">{g.gst_number}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-sand border border-brand-mitti">
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {g.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => reviewGST(g.id, "approve")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl mr-2">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => reviewGST(g.id, "decline")} className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* =========================================================
          MODAL: GRANT / ADD SUBSCRIPTION MANUALLY
      ========================================================= */}
      <Dialog open={grantModal.open} onOpenChange={o => !o && setGrantModal(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-brand-indigo flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>Grant Subscription</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitGrant} className="space-y-4 mt-3">
            <div>
              <Label className="text-xs font-bold text-brand-indigo">User Email *</Label>
              <Input
                type="email"
                required
                placeholder="merchant@example.com"
                value={grantModal.email}
                onChange={e => setGrantModal(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 rounded-xl border-brand-mitti"
              />
              <p className="text-[11px] text-brand-indigo/50 mt-1">
                Must be a registered account email.
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo">Subscription Plan *</Label>
              <Select
                value={grantModal.plan}
                onValueChange={v => setGrantModal(prev => ({ ...prev, plan: v }))}
              >
                <SelectTrigger className="mt-1 rounded-xl border-brand-mitti font-bold">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter Plan (POS & Basic Inventory)</SelectItem>
                  <SelectItem value="business">Business Plan (Stock & Khata Ledger)</SelectItem>
                  <SelectItem value="premium">Premium Plan (Full Multi-Shop & Soundbox)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo">Validity Duration (Days) *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1 mb-2">
                {[30, 90, 365].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGrantModal(prev => ({ ...prev, days: d }))}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      grantModal.days === d 
                        ? "bg-brand-indigo text-white border-brand-indigo" 
                        : "bg-brand-sand/50 border-brand-mitti text-brand-indigo/80 hover:bg-brand-sand"
                    }`}
                  >
                    {d === 365 ? "1 Year" : `${d} Days`}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min="1"
                max="3650"
                value={grantModal.days}
                onChange={e => setGrantModal(prev => ({ ...prev, days: Number(e.target.value) }))}
                className="rounded-xl border-brand-mitti"
                placeholder="Custom number of days"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-brand-indigo">Admin Note / Reason</Label>
              <Input
                placeholder="e.g. Payment verified manually via UPI / Razorpay sync"
                value={grantModal.note}
                onChange={e => setGrantModal(prev => ({ ...prev, note: e.target.value }))}
                className="mt-1 rounded-xl border-brand-mitti"
              />
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGrantModal(prev => ({ ...prev, open: false }))}
                className="rounded-xl border-brand-mitti font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={granting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {granting ? "Granting..." : "Confirm & Activate Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Screenshot Dialog */}
      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Payment Screenshot</DialogTitle>
          </DialogHeader>
          {preview && <img src={preview} alt="Payment verification" className="w-full rounded-2xl border border-brand-mitti" />}
        </DialogContent>
      </Dialog>

    </div>
  );
}
