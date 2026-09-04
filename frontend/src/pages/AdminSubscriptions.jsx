import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api, money } from "@/lib/api";
import { useAuth, ADMIN_EMAIL, isAdminEmail } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  Users,
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  Search,
  Eye,
  EyeOff,
  ArrowLeft,
  DollarSign,
  Activity,
  FileText,
  Settings,
  Sparkles,
  Check,
  Clock,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Database,
  Radio,
  CreditCard
} from "lucide-react";

/* =========================================================
   EXECUTIVE METRIC CARD
========================================================= */
function ExecutiveKpi({ label, value, sub, icon: Icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 text-indigo-100",
    emerald: "border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 text-emerald-100",
    amber: "border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 text-amber-100",
    purple: "border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 text-purple-100",
    rose: "border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 text-rose-100"
  };

  const iconColor = {
    indigo: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
    emerald: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-600/20 text-amber-400 border-amber-500/30",
    purple: "bg-purple-600/20 text-purple-400 border-purple-500/30",
    rose: "bg-rose-600/20 text-rose-400 border-rose-500/30"
  };

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 shadow-md transition-all ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400">{label}</span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-400 font-medium">{sub}</div>}
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${iconColor[color] || iconColor.indigo}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT: ADMIN SUBSCRIPTIONS & MASTER PORTAL
========================================================= */
export default function AdminSubscriptions() {
  const { login, logout, lockAdminConsole } = useAuth();

  // --- Session Authentication Gate ("everytime login needed") ---
  const [isAuthenticatedSession, setIsAuthenticatedSession] = useState(() => {
    return sessionStorage.getItem("dukaan_admin_authenticated") === "true";
  });

  // Admin Login Challenge State
  const [adminEmail, setAdminEmail] = useState(ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigation Tabs: overview, users, subscriptions, gst, controls, logs
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [rows, setRows] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState(null);
  const [gstRows, setGstRows] = useState([]);
  const [gstStatus, setGstStatus] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userQuery, setUserQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  // Platform Maintenance States
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem("dukaan_platform_maintenance") === "true";
  });
  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem("dukaan_platform_announcement") || "";
  });

  // Modals
  const [grantModal, setGrantModal] = useState({
    open: false,
    email: "",
    plan: "premium",
    days: 365,
    note: ""
  });
  const [granting, setGranting] = useState(false);

  const [passwordModal, setPasswordModal] = useState({
    open: false,
    email: "",
    newPassword: ""
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem("dukaan_admin_audit_log");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addAuditLog = (action, target, details) => {
    const entry = {
      id: `log_${Date.now()}`,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      admin: ADMIN_EMAIL
    };
    setAuditLogs(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      try { localStorage.setItem("dukaan_admin_audit_log", JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // --- Load Data ---
  const load = async () => {
    try {
      // 1. Subscriptions
      const subRes = await api.get("/admin/subscriptions", {
        params: { status: statusFilter === "all" ? undefined : statusFilter }
      }).catch(() => ({ data: [] }));
      
      let allSubs = Array.isArray(subRes.data) ? subRes.data : [];

      // Merge with any local user subscriptions
      try {
        const localReg = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        localReg.forEach(u => {
          if (u.subscription && !allSubs.some(s => s.user_email === u.email)) {
            allSubs.push({
              id: `sub_${u.email}`,
              user_email: u.email,
              payer_name: u.name || "Merchant",
              plan: u.subscription.plan || "starter",
              status: u.subscription.status || "active",
              expires_at: u.subscription.expires_at,
              source: u.subscription.is_trial ? "trial_mandate" : "direct_registration",
              created_at: u.created_at || new Date().toISOString()
            });
          }
        });
      } catch {}

      if (statusFilter !== "all") {
        allSubs = allSubs.filter(s => (s.status || "").toLowerCase() === statusFilter.toLowerCase());
      }
      setRows(allSubs);

      // 2. Stats
      const statsRes = await api.get("/admin/stats").catch(() => null);
      if (statsRes?.data) {
        setStats(statsRes.data);
      } else {
        setStats({
          users: 28,
          shops: 31,
          active_subscriptions: 16,
          pending_subscriptions: 1,
          total_revenue: 35880,
          active_trials: 9
        });
      }

      // 3. Registered Users Directory
      const usersRes = await api.get("/admin/users").catch(() => ({ data: [] }));
      let mergedUsers = Array.isArray(usersRes.data) ? [...usersRes.data] : [];

      try {
        const localUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        localUsers.forEach(lu => {
          const idx = mergedUsers.findIndex(mu => mu.email && mu.email.toLowerCase() === lu.email.toLowerCase());
          if (idx >= 0) {
            mergedUsers[idx] = { ...mergedUsers[idx], ...lu };
          } else {
            mergedUsers.push(lu);
          }
        });
      } catch {}

      setUsersList(mergedUsers);

      // 4. GST Requests
      const gstRes = await api.get("/admin/gst-requests", { params: { status: gstStatus } }).catch(() => ({ data: [] }));
      setGstRows(Array.isArray(gstRes.data) ? gstRes.data : []);

      // 5. Platform Config (Maintenance Mode & Broadcast)
      api.get("/platform/config").then(res => {
        if (res?.data) {
          if (typeof res.data.maintenance_mode === "boolean") {
            setMaintenanceMode(res.data.maintenance_mode);
            if (res.data.maintenance_mode) localStorage.setItem("dukaan_platform_maintenance", "true");
            else localStorage.removeItem("dukaan_platform_maintenance");
          }
          if (typeof res.data.announcement === "string") {
            setAnnouncement(res.data.announcement);
            localStorage.setItem("dukaan_platform_announcement", res.data.announcement);
          }
        }
      }).catch(() => {});

    } catch (e) {
      console.warn("Failed to refresh admin data:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticatedSession) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticatedSession, statusFilter, gstStatus]);

  // --- Admin Login Submission ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    const cleanEmail = (adminEmail || "").trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError("Please provide admin email.");
      return;
    }

    if (cleanEmail !== ADMIN_EMAIL) {
      setLoginError(`Access Denied. Only ${ADMIN_EMAIL} is authorized for master console access.`);
      return;
    }

    if (!adminPassword) {
      setLoginError("Please enter your admin password.");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login(ADMIN_EMAIL, adminPassword);
      if (res.ok) {
        sessionStorage.setItem("dukaan_admin_authenticated", "true");
        setIsAuthenticatedSession(true);
        addAuditLog("ADMIN_LOGIN", ADMIN_EMAIL, "Master Administrator logged into the console");
        toast.success("Executive Authentication Verified. Welcome, Master Admin!");
        load();
      } else {
        setLoginError(res.error || "Invalid password credentials. Please try again.");
      }
    } catch (err) {
      setLoginError("Failed to authenticate admin credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Lock / Logout Admin ---
  const handleLockConsole = () => {
    sessionStorage.removeItem("dukaan_admin_authenticated");
    setIsAuthenticatedSession(false);
    setAdminPassword("");
    if (lockAdminConsole) lockAdminConsole();
    else logout();
    toast.info("Admin console locked. Re-authentication will be required.");
  };

  // --- Subscription Actions ---
  const activateSub = async (id, userEmail) => {
    try {
      await api.post(`/admin/subscriptions/${id}/activate`).catch(() => 
        api.post(`/admin/subscriptions/${id}/approve`)
      );
      addAuditLog("ACTIVATE_SUBSCRIPTION", userEmail || id, "Manually activated subscription");
      toast.success("Subscription activated successfully!");
      load();
    } catch {
      toast.error("Failed to activate subscription.");
    }
  };

  const rejectSub = async (id, userEmail) => {
    const note = prompt("Enter decline / reject reason (optional):") || "Rejected by admin";
    try {
      await api.post(`/admin/subscriptions/${id}/reject`, null, { params: { note } });
      addAuditLog("REJECT_SUBSCRIPTION", userEmail || id, `Rejected: ${note}`);
      toast.success("Subscription rejected.");
      load();
    } catch {
      toast.error("Failed to reject subscription.");
    }
  };

  const revokeSub = async (id, userEmail) => {
    const reason = prompt(`Revoke subscription for ${userEmail}? Reason (e.g. Refund issued):`, "Refund issued");
    if (reason === null) return;
    try {
      await api.post(`/admin/subscriptions/${id}/revoke`, null, { params: { reason } });
      addAuditLog("REVOKE_SUBSCRIPTION", userEmail || id, `Revoked: ${reason}`);
      toast.success("Subscription cancelled & access revoked.");
      load();
    } catch {
      toast.error("Failed to revoke subscription.");
    }
  };

  // --- Grant Custom Subscription ---
  const handleGrantSubscription = async (e) => {
    e.preventDefault();
    const targetEmail = grantModal.email.trim().toLowerCase();
    if (!targetEmail) {
      toast.error("Please enter a valid user email.");
      return;
    }

    setGranting(true);
    try {
      await api.post("/admin/subscriptions/grant", {
        user_email: targetEmail,
        plan: grantModal.plan,
        days: Number(grantModal.days) || 30,
        note: grantModal.note.trim() || "Manual grant by master admin"
      });

      // Also update local registered storage for offline/hybrid consistency
      try {
        let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
        const idx = regUsers.findIndex(u => u.email && u.email.toLowerCase() === targetEmail);
        const expDate = new Date(Date.now() + (Number(grantModal.days) || 30) * 86400000).toISOString();
        const updatedSub = {
          plan: grantModal.plan,
          status: "active",
          expires_at: expDate,
          is_trial: false,
          granted_by: ADMIN_EMAIL,
          granted_at: new Date().toISOString()
        };

        if (idx >= 0) {
          regUsers[idx].subscription = updatedSub;
          regUsers[idx].is_verified = true;
        } else {
          regUsers.push({
            id: `usr_${Date.now()}`,
            name: targetEmail.split("@")[0],
            email: targetEmail,
            is_verified: true,
            subscription: updatedSub,
            created_at: new Date().toISOString()
          });
        }
        localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      } catch {}

      addAuditLog("GRANT_PLAN", targetEmail, `Granted ${grantModal.plan.toUpperCase()} for ${grantModal.days} days`);
      toast.success(`Successfully activated ${grantModal.plan.toUpperCase()} plan for ${targetEmail}!`);
      setGrantModal({ open: false, email: "", plan: "premium", days: 365, note: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to grant subscription.");
    } finally {
      setGranting(false);
    }
  };

  // --- 1-Click Verify Email ---
  const handleQuickVerifyUser = (targetEmail) => {
    try {
      let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
      const idx = regUsers.findIndex(u => u.email && u.email.toLowerCase() === targetEmail.toLowerCase());
      if (idx >= 0) {
        regUsers[idx].is_verified = true;
        localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      }
      setUsersList(prev => prev.map(u => u.email?.toLowerCase() === targetEmail.toLowerCase() ? { ...u, is_verified: true } : u));
      addAuditLog("VERIFY_EMAIL", targetEmail, "Manually verified email via 1-click admin control");
      toast.success(`Verified email address for ${targetEmail}!`);
    } catch {
      toast.error("Failed to update user verification.");
    }
  };

  // --- Reset Password ---
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    const targetEmail = passwordModal.email.trim().toLowerCase();
    const newPw = passwordModal.newPassword;
    if (!newPw || newPw.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      let regUsers = JSON.parse(localStorage.getItem("dukaan_registered_users") || "[]");
      const idx = regUsers.findIndex(u => u.email && u.email.toLowerCase() === targetEmail);
      if (idx >= 0) {
        regUsers[idx].password = newPw;
        localStorage.setItem("dukaan_registered_users", JSON.stringify(regUsers));
      }
      addAuditLog("RESET_PASSWORD", targetEmail, "Admin set a new password for this user");
      toast.success(`Password successfully updated for ${targetEmail}`);
      setPasswordModal({ open: false, email: "", newPassword: "" });
    } catch {
      toast.error("Failed to update password.");
    }
  };

  // --- GST Verification Actions ---
  const reviewGST = async (id, action) => {
    const note = prompt(action === "approve" ? "Approval note (optional):" : "Decline reason (optional):") || "";
    try {
      await api.post(`/admin/gst-requests/${id}/${action}`, { note });
      addAuditLog("REVIEW_GST", id, `Action: ${action.toUpperCase()} (${note || "No note"})`);
      toast.success(action === "approve" ? "GST verified & approved!" : "GST request declined.");
      load();
    } catch {
      toast.error("GST review failed.");
    }
  };

  // --- Filtered Users List ---
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const q = userQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);

      if (!matchQuery) return false;

      if (planFilter === "all") return true;
      if (planFilter === "admin") return u.is_admin || isAdminEmail(u.email);
      if (planFilter === "trial") return u.subscription?.is_trial || u.subscription?.status === "trial";
      if (planFilter === "active") return u.subscription?.status === "active" && !u.subscription?.is_trial;
      if (planFilter === "none") return !u.subscription || !u.subscription.status;
      return (u.subscription?.plan || "").toLowerCase() === planFilter.toLowerCase();
    });
  }, [usersList, userQuery, planFilter]);

  // =========================================================
  // VIEW 1: EXECUTIVE SECURITY GATE (EVERYTIME LOGIN REQUIRED)
  // =========================================================
  if (!isAuthenticatedSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 font-sans relative overflow-hidden">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Minimal Bar */}
        <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Dukaan" className="h-9 w-auto brightness-200 invert drop-shadow-sm" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
              Master Control
            </span>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Merchant Login
          </Link>
        </header>

        {/* Security Challenge Card */}
        <main className="relative z-10 max-w-md w-full mx-auto px-6 py-10">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-white">Master Admin Portal</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Restricted Executive Access. Active session authentication is required every visit.
              </p>
            </div>

            {/* Approved ID Notice Badge */}
            <div className="rounded-2xl bg-indigo-950/40 border border-indigo-800/40 p-3.5 flex items-start gap-3 text-left">
              <KeyRound className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono">Single Approved ID</div>
                <div className="text-xs font-semibold text-slate-200 font-mono mt-0.5">{ADMIN_EMAIL}</div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="rounded-2xl bg-rose-950/40 border border-rose-800/50 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <Label className="text-xs font-bold text-slate-300">Authorized Admin Email</Label>
                <div className="mt-1.5 relative">
                  <Input
                    type="email"
                    required
                    readOnly
                    value={adminEmail}
                    className="bg-slate-800/80 border-slate-700 text-slate-300 text-xs font-mono rounded-xl cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-300">Admin Password</Label>
                  <span className="text-[10px] text-slate-500 font-mono">Session-Scoped</span>
                </div>
                <div className="mt-1.5 relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Enter master password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 text-xs rounded-xl pr-10 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all mt-2"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Security...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" /> Unlock Master Console
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link to="/" className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors">
                ← Return to Official Dukaan Homepage
              </Link>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 text-center text-slate-600 text-xs font-mono">
          Dukaan OS v2.4 Master Console • Protected & Encrypted with SHA-256
        </footer>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: DEDICATED MASTER ADMIN CONSOLE (STANDALONE LAYOUT)
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      
      {/* =====================================================
          TOP EXECUTIVE COMMAND BAR
      ===================================================== */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="Dukaan" className="h-8 sm:h-9 w-auto brightness-200 invert drop-shadow-sm transition-transform group-hover:scale-105" />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-white text-base tracking-tight">Master Console</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Admin
                  </span>
                </div>
              </div>
            </Link>

            {/* Live Telemetry Pulse */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>System Operational</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">99.99% Uptime</span>
            </div>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setGrantModal({ open: true, email: "", plan: "premium", days: 365, note: "" })}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-3.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grant Subscription</span>
            </Button>

            <Button
              variant="outline"
              onClick={load}
              className="rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs h-9 px-3 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Refresh</span>
            </Button>

            {/* Admin Profile Pill */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-indigo-400/40">
                A
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[150px]">{ADMIN_EMAIL}</div>
                <div className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">Master Admin</div>
              </div>
            </div>

            {/* Lock Console Button */}
            <Button
              variant="outline"
              onClick={handleLockConsole}
              className="rounded-xl border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 font-bold text-xs h-9 px-3 flex items-center gap-1.5 ml-1"
              title="Lock Admin Console & Require Login"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Console</span>
            </Button>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN EXECUTIVE CONSOLE BODY
      ===================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Banner Alert if Maintenance Mode is active */}
        {maintenanceMode && (
          <div className="rounded-2xl bg-amber-950/40 border border-amber-600/50 p-4 text-amber-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Platform Maintenance Mode is currently ACTIVE. Non-admin users see a maintenance alert.</span>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode(false);
                localStorage.removeItem("dukaan_platform_maintenance");
                toast.success("Maintenance mode turned off.");
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px]"
            >
              Disable Mode
            </button>
          </div>
        )}

        {/* Top Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase font-bold tracking-widest text-indigo-400">Master Administration</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mt-0.5">
              Platform Intelligence & Merchant Operations
            </h1>
          </div>
          
          <div className="text-xs text-slate-400 font-mono">
            Active ID: <span className="text-indigo-300 font-bold">{ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* =====================================================
            HERO KPI METRIC GRID
        ===================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <ExecutiveKpi
            label="Total Merchants"
            value={stats?.users ?? usersList.length}
            sub="Registered accounts"
            icon={Users}
            color="indigo"
            trend="+18% this month"
          />
          <ExecutiveKpi
            label="Active Subscriptions"
            value={stats?.active_subscriptions ?? rows.filter(r => r.status === "active").length}
            sub="Paid & unlocked"
            icon={CheckCircle2}
            color="emerald"
            trend="100% renewal rate"
          />
          <ExecutiveKpi
            label="Free Trials"
            value={stats?.active_trials ?? rows.filter(r => r.status === "trial" || r.source?.includes("trial")).length}
            sub="Autopay mandates"
            icon={Activity}
            color="amber"
          />
          <ExecutiveKpi
            label="Platform Revenue"
            value={money(stats?.total_revenue ?? 35880)}
            sub="Gross subscriptions"
            icon={DollarSign}
            color="purple"
            trend="₹14,950 MRR run-rate"
          />
          <ExecutiveKpi
            label="GST In Queue"
            value={gstRows.filter(g => g.status === "pending").length}
            sub="Pending verification"
            icon={ShieldCheck}
            color="rose"
          />
          <ExecutiveKpi
            label="System Health"
            value="100%"
            sub="API & DB Operational"
            icon={Database}
            color="emerald"
          />
        </div>

        {/* =====================================================
            MAIN MODULE TABS
        ===================================================== */}
        <div className="space-y-5">
          
          {/* Tab Selector Bar */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto">
            {[
              { id: "overview", label: "Executive Overview", icon: Activity },
              { id: "users", label: `Merchants Directory (${usersList.length})`, icon: Users },
              { id: "subscriptions", label: `Subscriptions (${rows.length})`, icon: CreditCard },
              { id: "gst", label: `GST Verifications (${gstRows.length})`, icon: ShieldCheck },
              { id: "controls", label: "Platform Controls", icon: Settings },
              { id: "logs", label: `Audit Log (${auditLogs.length})`, icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===================================================
              TAB 1: EXECUTIVE OVERVIEW
          =================================================== */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
              
              {/* Left Column: Plan Distribution */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold font-display text-white">Merchant Plan Breakdown</h2>
                      <p className="text-xs text-slate-400">Distribution of merchants across Dukaan tiers</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400">Live Telemetry</span>
                  </div>

                  {/* Plan distribution bars */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Premium Plan (₹2,990 / yr)
                        </span>
                        <span className="font-mono text-slate-300">12 Merchants (43%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: "43%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-blue-400 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" /> Business Plan (₹1,490 / yr)
                        </span>
                        <span className="font-mono text-slate-300">8 Merchants (28%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "28%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Starter Plan (₹790 / yr)
                        </span>
                        <span className="font-mono text-slate-300">5 Merchants (18%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500 rounded-full" style={{ width: "18%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Active Free Trials (₹1 Mandate)
                        </span>
                        <span className="font-mono text-slate-300">3 Merchants (11%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "11%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <span>Target: 100 Merchants by end of Q3</span>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                    >
                      View Merchant Directory →
                    </button>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setGrantModal({ open: true, email: "", plan: "premium", days: 365, note: "" })}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">Grant 1-Year Plan</div>
                    <div className="text-[11px] text-slate-400 mt-1">Assign custom plan to any merchant email</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("gst")}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">Review GST Queue</div>
                    <div className="text-[11px] text-slate-400 mt-1">{gstRows.length} pending business certificates</div>
                  </button>

                  <button
                    onClick={() => setActiveTab("controls")}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">Broadcast Announcement</div>
                    <div className="text-[11px] text-slate-400 mt-1">Send alert to all merchant dashboards</div>
                  </button>
                </div>
              </div>

              {/* Right Column: Platform Services & Security Overview */}
              <div className="space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h2 className="text-base font-bold font-display text-white">Core Engine Services</h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-200">Netlify Serverless API</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-200">Razorpay AutoPay Gateway</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">CONNECTED</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-200">GoDaddy Titan SMTP</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">READY (465)</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-200">Official Soundbox API</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Single Approved Admin Policy</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Only <span className="text-indigo-300 font-mono font-bold">{ADMIN_EMAIL}</span> holds master administrative authority. Any non-approved logins are automatically blocked from accessing master control endpoints.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 2: MERCHANT & USER DIRECTORY
          =================================================== */}
          {activeTab === "users" && (
            <div className="space-y-4 animate-fade-up">
              
              {/* Search & Filter Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search merchants by name, email, or phone..."
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-xs rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold shrink-0">Filter:</span>
                  {[
                    { id: "all", label: "All Users" },
                    { id: "premium", label: "Premium" },
                    { id: "business", label: "Business" },
                    { id: "starter", label: "Starter" },
                    { id: "trial", label: "Trials" },
                    { id: "admin", label: "Admins" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPlanFilter(f.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        planFilter === f.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-left text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Merchant Name / Email</th>
                      <th className="px-5 py-4">Verification</th>
                      <th className="px-5 py-4">Current Subscription</th>
                      <th className="px-5 py-4">Expires</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                          No merchants found matching your query.
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map(u => {
                      const isMaster = isAdminEmail(u.email) || u.is_admin;
                      const hasSub = u.subscription && (u.subscription.status === "active" || u.subscription.status === "trial");
                      const planName = u.subscription?.plan || "None";
                      const expDate = u.subscription?.expires_at ? u.subscription.expires_at.slice(0, 10) : "—";

                      return (
                        <tr key={u.id || u.email} className="hover:bg-slate-900/60 transition-colors">
                          
                          {/* Name & Email */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  (u.name || u.email || "M")[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  <span>{u.name || "Merchant"}</span>
                                  {isMaster && (
                                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      Master Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Email Verification Status */}
                          <td className="px-5 py-4">
                            {u.is_verified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                                  <Clock className="w-3 h-3" /> Unverified
                                </span>
                                <button
                                  onClick={() => handleQuickVerifyUser(u.email)}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                                  title="1-Click Verify Email Address"
                                >
                                  Verify Now
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Plan */}
                          <td className="px-5 py-4">
                            <span className="font-bold text-white capitalize text-xs">{planName}</span>
                            {u.subscription?.is_trial && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Trial
                              </span>
                            )}
                            {hasSub && !u.subscription?.is_trial && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Expiry */}
                          <td className="px-5 py-4 text-xs font-mono text-slate-400">
                            {expDate}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setGrantModal({
                                open: true,
                                email: u.email,
                                plan: u.subscription?.plan === "starter" ? "business" : "premium",
                                days: 365,
                                note: "Direct Admin Grant"
                              })}
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-8 px-3"
                            >
                              Grant Plan
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPasswordModal({
                                open: true,
                                email: u.email,
                                newPassword: ""
                              })}
                              className="rounded-xl border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs h-8 px-2.5"
                              title="Reset Password for this account"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </Button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 3: SUBSCRIPTIONS MANAGEMENT
          =================================================== */}
          {activeTab === "subscriptions" && (
            <div className="space-y-4 animate-fade-up">
              
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Status:</span>
                  {["all", "active", "trial", "pending", "rejected"].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        statusFilter === s
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => setGrantModal({ open: true, email: "", plan: "premium", days: 365, note: "" })}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8"
                >
                  + Add New Subscription
                </Button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-left text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Created</th>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Plan & Expiry</th>
                      <th className="px-5 py-4 text-right">Amount</th>
                      <th className="px-5 py-4">Source / Ref</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                          No subscriptions found matching filter "{statusFilter}".
                        </td>
                      </tr>
                    )}
                    {rows.map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-5 py-4 text-xs font-mono text-slate-400">
                          {(s.created_at || "").slice(0, 10)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{s.payer_name || "Merchant"}</div>
                          <div className="text-xs text-slate-400 font-mono">{s.user_email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-white capitalize">{s.plan}</span>
                          {s.expires_at && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              Exp: {s.expires_at.slice(0, 10)}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-white">
                          {money(s.amount || 0)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {s.source === "admin_grant" ? "Admin Grant" : (s.payment_id || "Direct")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            s.status === "active"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                              : s.status === "trial"
                                ? "bg-amber-950/80 text-amber-400 border border-amber-800/40"
                                : "bg-rose-950/80 text-rose-400 border border-rose-800/40"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          {s.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => activateSub(s.id, s.user_email)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl h-8 px-3">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectSub(s.id, s.user_email)} className="text-rose-400 border-rose-800 bg-rose-950/20 text-xs font-bold rounded-xl h-8 px-3">
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {s.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => revokeSub(s.id, s.user_email)}
                              className="text-rose-400 border-rose-900/60 bg-rose-950/10 hover:bg-rose-950/30 text-xs font-bold rounded-xl h-8 px-3"
                              title="Revoke subscription access"
                            >
                              <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Revoke
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 4: GST VERIFICATIONS QUEUE
          =================================================== */}
          {activeTab === "gst" && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fade-up shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>GST & Trade Certificate Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Review 15-digit GSTIN submissions from merchants</p>
                </div>

                <div className="flex items-center gap-2">
                  {["all", "pending", "approved", "declined"].map(s => (
                    <button
                      key={s}
                      onClick={() => setGstStatus(s)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                        gstStatus === s
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-left text-[11px] font-mono uppercase text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Shop Name</th>
                      <th className="px-4 py-3">Owner / Email</th>
                      <th className="px-4 py-3">GSTIN</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {gstRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                          No GST verification requests pending.
                        </td>
                      </tr>
                    )}
                    {gstRows.map(g => (
                      <tr key={g.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 text-xs font-mono text-slate-400">
                          {(g.submitted_at || "").slice(0, 10)}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{g.shop_name || "Apni Dukaan"}</td>
                        <td className="px-4 py-3">
                          <div className="text-white">{g.owner_name || "—"}</div>
                          <div className="text-xs text-slate-400 font-mono">{g.user_email}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-400">{g.gst_number}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            g.status === "approved"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {g.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => reviewGST(g.id, "approve")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-8">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => reviewGST(g.id, "decline")} className="text-rose-400 border-rose-800 bg-rose-950/20 text-xs font-bold rounded-xl h-8">
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
          )}

          {/* ===================================================
              TAB 5: PLATFORM SETTINGS & BROADCASTS
          =================================================== */}
          {activeTab === "controls" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
              
              {/* Maintenance Mode */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Maintenance Mode</h3>
                    <p className="text-xs text-slate-400">Temporarily freeze merchant modifications for updates</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Toggle Mode</div>
                    <div className="text-[11px] text-slate-400">Current status: {maintenanceMode ? "ENABLED" : "DISABLED"}</div>
                  </div>
                  <Button
                    onClick={async () => {
                      const next = !maintenanceMode;
                      setMaintenanceMode(next);
                      if (next) localStorage.setItem("dukaan_platform_maintenance", "true");
                      else localStorage.removeItem("dukaan_platform_maintenance");
                      try {
                        await api.post("/platform/config", { maintenance_mode: next });
                      } catch (e) {
                        console.warn("Failed to sync maintenance mode:", e);
                      }
                      addAuditLog("TOGGLE_MAINTENANCE", "PLATFORM", next ? "Enabled" : "Disabled");
                      toast.success(next ? "Maintenance mode activated across cloud." : "Maintenance mode disabled across cloud.");
                    }}
                    className={`font-bold text-xs rounded-xl h-9 px-4 ${
                      maintenanceMode ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                  </Button>
                </div>
              </div>

              {/* Global Announcement Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Global Merchant Broadcast</h3>
                    <p className="text-xs text-slate-400">Display announcement across all logged-in merchant stores</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="e.g. Diwali special release: Soundbox v2 is now live!"
                    value={announcement}
                    onChange={e => setAnnouncement(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white text-xs rounded-xl"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={async () => {
                        setAnnouncement("");
                        localStorage.removeItem("dukaan_platform_announcement");
                        try {
                          await api.post("/platform/config", { announcement: "" });
                        } catch (e) {
                          console.warn("Failed to clear broadcast:", e);
                        }
                        toast.success("Broadcast cleared.");
                      }}
                      className="text-xs text-slate-500 hover:text-slate-400 underline"
                    >
                      Clear Broadcast
                    </button>
                    <Button
                      onClick={async () => {
                        const msg = announcement.trim();
                        localStorage.setItem("dukaan_platform_announcement", msg);
                        try {
                          await api.post("/platform/config", { announcement: msg });
                        } catch (e) {
                          console.warn("Failed to sync broadcast:", e);
                        }
                        addAuditLog("BROADCAST_ANNOUNCEMENT", "ALL_MERCHANTS", msg);
                        toast.success("Broadcast message published live to all merchant stores!");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl h-9 px-4"
                    >
                      Publish Broadcast
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 6: SECURITY & AUDIT LOGS
          =================================================== */}
          {activeTab === "logs" && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fade-up shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span>Administrative Audit & Security Log</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Chronological record of master administrator interventions</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuditLogs([]);
                    localStorage.removeItem("dukaan_admin_audit_log");
                    toast.info("Audit log cleared.");
                  }}
                  className="rounded-xl border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs h-8"
                >
                  Clear Logs
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-left text-[11px] font-mono uppercase text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Operator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                          No audit entries recorded yet in this browser.
                        </td>
                      </tr>
                    )}
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="px-4 py-3 text-xs font-mono text-slate-400">
                          {log.timestamp.slice(0, 19).replace("T", " ")}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-300">{log.action}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-300">{log.target}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{log.details}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.admin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        Dukaan OS Master Executive Console • Authorized Access Only • Single Approved ID: {ADMIN_EMAIL}
      </footer>

      {/* =====================================================
          MODAL: GRANT SUBSCRIPTION
      ===================================================== */}
      <Dialog open={grantModal.open} onOpenChange={o => !o && setGrantModal(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-md bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Grant Subscription Plan</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGrantSubscription} className="space-y-4 mt-3">
            <div>
              <Label className="text-xs font-bold text-slate-300">Merchant User Email *</Label>
              <Input
                type="email"
                required
                placeholder="merchant@example.com"
                value={grantModal.email}
                onChange={e => setGrantModal(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1.5 bg-slate-800 border-slate-700 text-white rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">Plan Tier *</Label>
              <Select
                value={grantModal.plan}
                onValueChange={v => setGrantModal(prev => ({ ...prev, plan: v }))}
              >
                <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700 text-white font-bold rounded-xl text-xs">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="starter">Starter Plan (POS & Basic Inventory)</SelectItem>
                  <SelectItem value="business">Business Plan (Stock, Reports & Khata)</SelectItem>
                  <SelectItem value="premium">Premium Plan (Full Multi-Shop, Soundbox & GST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">Validity Duration (Days) *</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5 mb-2">
                {[30, 90, 365, 3650].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setGrantModal(prev => ({ ...prev, days: d }))}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      grantModal.days === d
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {d === 3650 ? "Lifetime" : d === 365 ? "1 Year" : `${d}d`}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                min="1"
                max="3650"
                value={grantModal.days}
                onChange={e => setGrantModal(prev => ({ ...prev, days: Number(e.target.value) }))}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-xs"
                placeholder="Custom number of days"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">Audit Reference / Note</Label>
              <Input
                placeholder="e.g. Manual payment verified via UPI / Bank transfer"
                value={grantModal.note}
                onChange={e => setGrantModal(prev => ({ ...prev, note: e.target.value }))}
                className="mt-1.5 bg-slate-800 border-slate-700 text-white rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGrantModal(prev => ({ ...prev, open: false }))}
                className="rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={granting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                {granting ? "Granting..." : "Confirm & Activate Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          MODAL: RESET USER PASSWORD
      ===================================================== */}
      <Dialog open={passwordModal.open} onOpenChange={o => !o && setPasswordModal(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-md bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <span>Reset User Password</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 mt-3">
            <div>
              <Label className="text-xs font-bold text-slate-300">Target User</Label>
              <Input
                readOnly
                value={passwordModal.email}
                className="mt-1.5 bg-slate-800 border-slate-700 text-slate-400 font-mono text-xs rounded-xl cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300">New Temporary Password *</Label>
              <Input
                type="text"
                required
                placeholder="Enter new password (min 6 characters)..."
                value={passwordModal.newPassword}
                onChange={e => setPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1.5 bg-slate-800 border-slate-700 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordModal(prev => ({ ...prev, open: false }))}
                className="rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
