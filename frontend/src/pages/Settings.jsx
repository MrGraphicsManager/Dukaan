import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, 
  Plus, 
  ShieldCheck, 
  QrCode, 
  Save, 
  Building2, 
  Phone, 
  CheckCircle2,
  User,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  LogOut,
  ArrowRight,
  Camera,
  AlertTriangle,
  Mail,
  MessageSquare,
  Star,
  Globe,
  Copy,
  Gift,
  Send,
  HelpCircle,
  Radio,
  FileText
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import DukaanProStudio from "@/components/DukaanProStudio";

export const STORE_CATEGORIES = [
  "Medical Store & Pharmacy",
  "Kirana & Grocery",
  "Clothing & Apparel",
  "Electronics & Mobile",
  "Stationery & Books",
  "Hardware & Electrical",
  "Cafe & Food Corner",
  "General Departmental Store"
];

const EMPTY_SHOP = {
  name: "", 
  owner_name: "", 
  phone: "", 
  address: "", 
  store_category: "General Departmental Store",
  upi_id: "", 
  upi_qr_data_url: "",
  invoice_footer: "Thank you for shopping with us!", 
  min_stock_default: 5
};

export default function Settings({ initialTab }) {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const loc = useLocation();
  const isStudioPath = Boolean(loc?.pathname?.includes("/studio") || loc?.pathname?.includes("/pro"));
  const activeTab = params.get("tab") || initialTab || (isStudioPath ? "pro" : "account");
  const setTab = (t) => {
    if (isStudioPath) {
      nav(`/app/settings?tab=${t}`);
    } else {
      setParams({ tab: t });
    }
  };

  const { 
    user, 
    shops, 
    currentShopId, 
    loadShops, 
    setActiveShop, 
    updateShop, 
    updateProfile, 
    changePassword, 
    logout 
  } = useAuth();

  // Account Profile state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Security / Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Shop state
  const [form, setForm] = useState(EMPTY_SHOP);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ ...EMPTY_SHOP });
  const [busyShop, setBusyShop] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
      setProfileAvatar(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    const s = shops.find(x => x.id === currentShopId);
    if (s) setForm({ ...EMPTY_SHOP, ...s });
  }, [currentShopId, shops]);

  // Profile Avatar upload handler (converts to base64 image data URL)
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setProfileAvatar(dataUrl);
      toast.info("Avatar image loaded. Click 'Save Profile' to apply.");
    };
    reader.readAsDataURL(file);
  };

  // Save Account Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
        avatar: profileAvatar
      });
      toast.success("Account profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    if (!currentPw) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(newPw)) {
      toast.error("New password must contain at least one capital letter (A-Z)");
      return;
    }
    if (!/[0-9]/.test(newPw)) {
      toast.error("New password must contain at least one number (0-9)");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(newPw)) {
      toast.error("New password must contain at least one special symbol");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSavingPw(true);
    try {
      const res = await changePassword(currentPw, newPw);
      if (res.ok) {
        toast.success(res.message || "Password updated successfully!");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        toast.error(res.error || "Failed to update password");
      }
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  // Save Shop Settings
  const saveShop = async () => {
    if (!currentShopId) return;
    setBusyShop(true);
    const payload = { 
      ...form, 
      id: currentShopId,
      min_stock_default: Number(form.min_stock_default || 5) 
    };

    // 1. Immediately save locally via updateShop so changes are never lost
    updateShop(payload);

    // 2. Sync to backend API if available
    try {
      await api.put(`/shops/${currentShopId}`, payload);
      await loadShops(currentShopId);
    } catch (e) {
      console.warn("Backend shop update fallback:", e);
    } finally {
      setBusyShop(false);
      toast.success("Shop settings saved successfully!");
    }
  };

  // Create New Shop Location
  const createShop = async () => {
    if (!newForm.name.trim()) return toast.error("Shop name is required");
    setBusyShop(true);
    const newId = `shop_${Date.now()}`;
    const payload = { 
      ...newForm, 
      id: newId,
      min_stock_default: Number(newForm.min_stock_default || 5) 
    };

    updateShop(payload);
    setActiveShop(newId);
    setCreating(false);
    setNewForm({ ...EMPTY_SHOP });

    try {
      const { data } = await api.post("/shops", payload);
      if (data?.id) {
        await loadShops(data.id);
        setActiveShop(data.id);
      }
    } catch (e) {
      console.warn("Backend create shop fallback:", e);
    } finally {
      setBusyShop(false);
      toast.success(`Shop "${payload.name}" created!`);
    }
  };

  const sub = user?.subscription;
  const isSubActive = Boolean(
    sub && (sub.status === "active" || sub.status === "trial" || sub.is_trial) &&
    (!sub.expires_at || new Date(sub.expires_at).getTime() > Date.now())
  );
  const remainingDays = sub?.expires_at 
    ? Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isPro = Boolean(user?.is_pro || user?.subscription?.plan === "pro" || sub?.plan === "pro" || user?.is_admin);

  // Feature 8: Customer Support Ticket Desk
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = localStorage.getItem(`dukaan_support_tickets_${user?.email}`);
      return stored ? JSON.parse(stored) : [
        { id: "TCK_9912", subject: "Printer 58mm Margin Setup", priority: "medium", status: "open", message: "Need help aligning margins.", created_at: new Date().toISOString() }
      ];
    } catch {
      return [];
    }
  });
  const [ticketForm, setTicketForm] = useState({ subject: "", priority: "medium", message: "" });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const handleCreateTicket = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error("Please enter a subject and message description.");
      return;
    }
    setSubmittingTicket(true);
    const newT = {
      id: `TCK_${Math.floor(1000 + Math.random() * 9000)}`,
      merchant_name: user?.name || "Merchant",
      merchant_email: user?.email,
      phone: user?.phone || "",
      subject: ticketForm.subject.trim(),
      priority: ticketForm.priority,
      status: "open",
      message: ticketForm.message.trim(),
      created_at: new Date().toISOString()
    };
    try {
      await api.post("/support/tickets", newT);
    } catch (_) {}
    const updated = [newT, ...tickets];
    setTickets(updated);
    try { localStorage.setItem(`dukaan_support_tickets_${user?.email}`, JSON.stringify(updated)); } catch {}
    setTicketForm({ subject: "", priority: "medium", message: "" });
    setSubmittingTicket(false);
    toast.success("Support ticket submitted! Ticket ID: #" + newT.id);
  };

  // Feature 29: Merchant Feedback & NPS Rating Wall
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSendFeedback = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!feedbackComment.trim()) {
      toast.error("Please provide your comments or suggestions.");
      return;
    }
    setSubmittingFeedback(true);
    try {
      await api.post("/merchant/feedback", {
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        shop_name: form.name || "Apni Dukaan"
      });
    } catch (_) {}
    setSubmittingFeedback(false);
    setFeedbackSubmitted(true);
    toast.success("Thank you for your feedback! Your review helps Dukaan improve for all Indian merchants.");
  };

  // Feature 33: Custom Domain & White-Label DNS Manager
  const [customDomain, setCustomDomain] = useState(() => {
    return localStorage.getItem(`dukaan_custom_domain_${currentShopId}`) || "";
  });
  const [domainStatus, setDomainStatus] = useState(() => {
    return localStorage.getItem(`dukaan_custom_domain_status_${currentShopId}`) || "not_configured";
  });
  const [savingDomain, setSavingDomain] = useState(false);

  const handleSaveDomain = async () => {
    if (!customDomain.trim()) return toast.error("Please enter a valid domain name (e.g. shop.mybrand.in)");
    setSavingDomain(true);
    try {
      await api.post("/admin/custom-domains", {
        shop_name: form.name || "My Store",
        domain: customDomain.trim().toLowerCase()
      });
    } catch (_) {}
    localStorage.setItem(`dukaan_custom_domain_${currentShopId}`, customDomain.trim().toLowerCase());
    localStorage.setItem(`dukaan_custom_domain_status_${currentShopId}`, "pending_dns");
    setDomainStatus("pending_dns");
    setSavingDomain(false);
    toast.success("Custom domain registered! Please configure your DNS CNAME record.");
  };

  // GST & Tax Compliance State
  const [gstin, setGstin] = useState(() => localStorage.getItem(`dukaan_gstin_${currentShopId}`) || "");
  const [gstLegalName, setGstLegalName] = useState(() => localStorage.getItem(`dukaan_gst_name_${currentShopId}`) || "");
  const [gstStatus, setGstStatus] = useState(() => localStorage.getItem(`dukaan_gst_status_${currentShopId}`) || "not_registered");
  const [submittingGst, setSubmittingGst] = useState(false);
  const [pairedSoundbox, setPairedSoundbox] = useState(null);

  const handleSubmitGst = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!gstin.trim() || gstin.trim().length < 15) {
      toast.error("Please enter a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5).");
      return;
    }
    setSubmittingGst(true);
    try {
      await api.post("/admin/gst-requests", {
        shop_id: currentShopId,
        shop_name: form.name || "Apni Dukaan",
        email: user?.email,
        gstin: gstin.trim().toUpperCase(),
        legal_name: gstLegalName.trim() || form.name || "Registered Entity"
      });
      localStorage.setItem(`dukaan_gstin_${currentShopId}`, gstin.trim().toUpperCase());
      localStorage.setItem(`dukaan_gst_name_${currentShopId}`, gstLegalName.trim());
      localStorage.setItem(`dukaan_gst_status_${currentShopId}`, "pending");
      setGstStatus("pending");
      toast.success("GST verification request submitted! Admin review in progress.");
    } catch (_) {
      toast.error("Failed to submit GST verification request.");
    } finally {
      setSubmittingGst(false);
    }
  };

  useEffect(() => {
    // Cloud fetch for paired soundbox
    api.get("/admin/soundbox").then(res => {
      if (Array.isArray(res.data)) {
        const myDev = res.data.find(d => 
          (d.assigned_email && user?.email && d.assigned_email.toLowerCase() === user.email.toLowerCase()) ||
          (d.shop_name && form.name && d.shop_name.toLowerCase() === form.name.toLowerCase())
        );
        if (myDev) setPairedSoundbox(myDev);
      }
    }).catch(() => {});

    // Cloud fetch for GST requests
    api.get("/admin/gst-requests").then(res => {
      if (Array.isArray(res.data)) {
        const myGst = res.data.find(g => 
          (g.user_email && user?.email && g.user_email.toLowerCase() === user.email.toLowerCase()) ||
          (g.shop_id && g.shop_id === currentShopId)
        );
        if (myGst) {
          setGstStatus(myGst.status);
          if (myGst.gstin) setGstin(myGst.gstin);
          if (myGst.legal_name) setGstLegalName(myGst.legal_name);
          localStorage.setItem(`dukaan_gst_status_${currentShopId}`, myGst.status);
        }
      }
    }).catch(() => {});

    // Cloud fetch for Support Tickets
    if (user?.email) {
      api.get("/support/tickets").then(res => {
        if (Array.isArray(res.data)) {
          const myTickets = res.data.filter(t => (t.merchant_email || "").toLowerCase() === user.email.toLowerCase());
          if (myTickets.length > 0) setTickets(myTickets);
        }
      }).catch(() => {});
    }
  }, [user?.email, form.name, currentShopId]);

  // Feature 20: Merchant Referral Code
  const referralCode = `DUK-${(user?.name || "SHOP").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "DUK"}${String(user?.id || "99").slice(-3)}`;

  return (
    <div className="space-y-8 animate-fade-up max-w-[1200px] mx-auto pb-16 font-sans">
      
      {/* =========================================================
          HERO BANNER (DUKAAN 3.0 MODERN DARK GRADIENT)
      ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
            {activeTab === "account" ? (
              <User className="w-7 h-7" />
            ) : activeTab === "pro" ? (
              <Sparkles className="w-7 h-7 text-amber-300" />
            ) : (
              <Store className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                {activeTab === "account" ? "MERCHANT ACCOUNT" : activeTab === "pro" ? "DUKAAN PRO STUDIO" : "STORE MANAGEMENT"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                {user?.is_admin ? "Admin Account" : isPro ? "Dukaan Pro Merchant" : "Verified Account"}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              {activeTab === "account" ? "My Account & Profile" : activeTab === "pro" ? "Dukaan Pro Flagship Studio" : "Shop & Business Settings"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === "account" 
                ? "Manage personal profile, login security, referral rewards, and membership."
                : activeTab === "pro"
                ? "Customize your brand logo, invoice templates, and store aesthetics."
                : "Manage branch locations, UPI QR stand, custom domain, and GST compliance."}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3">
          {activeTab === "shop" ? (
            <Button
              disabled={busyShop}
              onClick={saveShop}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{busyShop ? "Saving…" : "Save Shop Changes"}</span>
            </Button>
          ) : activeTab === "pro" ? (
            <Button
              onClick={() => nav("/subscribe?plan=pro")}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>{isPro ? "Manage Pro Plan" : "14-Day Free Pro Upgrade"}</span>
            </Button>
          ) : (
            <Button
              disabled={savingProfile}
              onClick={handleSaveProfile}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? "Saving…" : "Save Profile"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* =========================================================
          TAB NAVIGATION SWITCHER
      ========================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs max-w-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab("account")}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "account"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Referrals</span>
        </button>
        <button
          onClick={() => setTab("shop")}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "shop"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop & Domain</span>
        </button>
        <button
          onClick={() => setTab("pro")}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "pro"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
              : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dukaan Pro Studio</span>
        </button>
        <button
          onClick={() => setTab("support")}
          className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === "support"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & NPS</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: MY ACCOUNT & PROFILE
      ========================================================= */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Card 1: User Profile */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Personal Profile Details</h3>
              </div>

              {/* Avatar section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden grid place-items-center font-heading font-bold text-2xl text-slate-900 dark:text-white shadow-xs">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (profileName || user?.email || "U")[0]?.toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-blue-600 text-white grid place-items-center shadow-md hover:bg-blue-500 transition-all cursor-pointer"
                    title="Upload Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">Profile Photo</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click camera icon to change avatar</div>
                  {profileAvatar && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatar("")}
                      className="text-[11px] text-rose-600 font-semibold hover:underline mt-1 block cursor-pointer"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Full Name *</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Registered Email</Label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 font-mono text-xs text-slate-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email is your unique login credential and cannot be changed directly.
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Phone Number</Label>
                <Input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 9825100000"
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <Button
                  disabled={savingProfile}
                  onClick={handleSaveProfile}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {savingProfile ? "Saving Profile…" : "Save Profile Details"}
                </Button>
              </div>
            </div>

            {/* Card 2: Security & Password */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Account Security & Password</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Current Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter your current password"
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">New Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimum 8 characters with symbol & number"
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Confirm New Password *</Label>
                <Input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Password strength checklist */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-medium">
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Password Requirements:
                </div>
                <div className={`flex items-center gap-1.5 ${newPw.length >= 8 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3 h-3" /> Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPw) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPw) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(newPw) ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 special symbol (!@#$...)
                </div>
              </div>

              <div className="pt-2">
                <Button
                  disabled={savingPw}
                  onClick={handleChangePassword}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {savingPw ? "Updating Password…" : "Update Password"}
                </Button>
              </div>
            </div>

          </div>

          {/* Card 3: Membership & Subscription Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Active Membership
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {sub?.plan ? `${sub.plan.toUpperCase()} PLAN` : "STARTER PLAN"} {sub?.is_trial ? "(Free Trial)" : ""}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                {isSubActive ? (
                  <span>
                    Your subscription is currently <b>active</b>. 
                    {remainingDays !== null && ` You have ${remainingDays} days remaining.`}
                    {sub?.expires_at && ` Renews / expires on ${new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`}
                  </span>
                ) : (
                  <span>You are currently on the trial or free tier. Upgrade to unlock full multi-shop, khata, and soundbox features.</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => nav("/app/billing")}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                View Invoices & Billing
              </Button>
              <Button
                onClick={() => nav("/subscribe")}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 px-5 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade / Change Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Card 4: Merchant Partner & Referral Program */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-300/60 dark:border-amber-700/40 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white grid place-items-center shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Merchant Referral Program</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Earn 30 days of free subscription for every retail store you refer to Dukaan!</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-amber-200/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                30 Days Free / Referral
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Your Exclusive Merchant Referral Code</div>
                <div className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white">{referralCode}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast.success("Referral code copied to clipboard!");
                  }}
                  className="rounded-xl border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs h-9 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </Button>
                <a
                  href={`https://wa.me/?text=Namaste!%20I%20use%20Dukaan%20for%20my%20store%20billing%20and%20inventory.%20Sign%20up%20with%20my%20code%20*${referralCode}*%20at%20https://officialdukaan.in%20to%20get%2030%20days%20free!`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    size="sm"
                    className="rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Share on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Logout / Session Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-500/20 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">Sign Out of Account</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">End your current session on this device safely.</div>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                nav("/");
              }}
              className="border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: SHOP & BUSINESS SETTINGS
      ========================================================= */}
      {activeTab === "shop" && (
        <div className="space-y-6">
          
          {/* Multi-shop branch switcher */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Branches</span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">Your Dukaan Locations</h3>
              </div>
              <Button
                variant="outline"
                onClick={() => setCreating(prev => !prev)}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold h-9 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> {creating ? "Close" : "Add Branch"}
              </Button>
            </div>

            {/* List of branches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {shops.map((s) => {
                const isActive = s.id === currentShopId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveShop(s.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive 
                        ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/60 shadow-xs" 
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl grid place-items-center font-bold text-xs ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.phone || "No phone"}</div>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create new shop branch inline */}
            {creating && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Create New Shop Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="New Shop Name (e.g. Dukaan Branch 2)"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <Button 
                  disabled={busyShop}
                  onClick={createShop} 
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 cursor-pointer"
                >
                  {busyShop ? "Saving…" : "Save New Branch"}
                </Button>
              </div>
            )}
          </div>

          {/* Shop Details Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Card 1: Identity & Contact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Shop Profile</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Shop Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Store Category & Industry</Label>
                <Select
                  value={form.store_category || "General Departmental Store"}
                  onValueChange={(val) => setForm({ ...form, store_category: val })}
                >
                  <SelectTrigger className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-700 font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    {STORE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {((form.store_category || "").toLowerCase().includes("medical") || (form.store_category || "").toLowerCase().includes("pharmacy")) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <b>Medical Store & Pharmacy detected:</b> Batch Number & Expiry Date Alert Guard is activated for your inventory & POS.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Owner Name</Label>
                <Input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Contact Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Shop Address & City</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  placeholder="e.g. Shop #12, Market Yard, Ahmedabad"
                  className="mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none text-sm"
                />
              </div>
            </div>

            {/* Card 2: UPI QR & Invoicing */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">UPI & Billing Settings</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Shop UPI ID (for QR Generation)</Label>
                <Input
                  value={form.upi_id}
                  onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                  placeholder="e.g. 9825100000@okaxis"
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This UPI ID will appear on counter QR stands for instant customer payments.
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Invoice Footer Note</Label>
                <Input
                  value={form.invoice_footer}
                  onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })}
                  placeholder="Thank you for shopping with us!"
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Default Low Stock Alert Threshold</Label>
                <Input
                  type="number"
                  value={form.min_stock_default}
                  onChange={(e) => setForm({ ...form, min_stock_default: e.target.value })}
                  className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Items will trigger low stock warning when remaining count reaches this number.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  disabled={busyShop}
                  onClick={saveShop}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{busyShop ? "Saving…" : "Save All Changes"}</span>
                </Button>
              </div>
            </div>

          </div>

          {/* Card: Custom Domain & White-Label DNS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Custom Domain & White-Label DNS</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                domainStatus === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                domainStatus === "pending_dns" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {domainStatus === "active" ? "Active (SSL Live)" :
                 domainStatus === "pending_dns" ? "Pending DNS" : "Not Connected"}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect your brand's custom domain (e.g. <span className="font-mono font-bold text-slate-900 dark:text-white">shop.yourbrand.in</span>) so customers order directly under your private store domain with zero marketplace branding.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Your Store Domain</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. shop.sharmagrocery.in"
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                  <Button
                    disabled={savingDomain}
                    onClick={handleSaveDomain}
                    className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {savingDomain ? "Saving…" : "Connect Domain"}
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                <div className="font-bold text-slate-900 dark:text-white">Required DNS Settings (GoDaddy / Cloudflare / Hostinger):</div>
                <div>Type: <span className="font-bold">CNAME</span></div>
                <div>Host / Subdomain: <span className="font-bold">shop</span> (or @)</div>
                <div>Points to / Target: <span className="font-bold text-blue-600 dark:text-blue-400">custom.officialdukaan.in</span></div>
              </div>
            </div>
          </div>

          {/* Card: GSTIN Compliance & Tax Invoicing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">GST Compliance & Tax Invoicing</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                gstStatus === "approved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                gstStatus === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {gstStatus === "approved" ? "Verified GSTIN 🟢" :
                 gstStatus === "pending" ? "Pending Admin Verification 🟡" : "Not Registered"}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide your 15-digit GSTIN to enable B2B tax invoicing, HSN summaries, and verified GST badge on customer bills.
            </p>

            <form onSubmit={handleSubmitGst} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Legal Entity Name</Label>
                  <Input
                    value={gstLegalName}
                    onChange={(e) => setGstLegalName(e.target.value)}
                    placeholder="e.g. Ramesh Retail Traders Private Limited"
                    className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">15-Digit GSTIN *</Label>
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 24ABCDE1234F1Z5"
                    maxLength={15}
                    className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submittingGst || gstStatus === "approved"}
                className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
              >
                {submittingGst ? "Submitting Request…" : gstStatus === "approved" ? "GSTIN Verified & Locked" : "Submit for Official Verification"}
              </Button>
            </form>
          </div>

          {/* Card: Hardware Soundbox Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Assigned Hardware Soundbox</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                pairedSoundbox ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {pairedSoundbox ? "Paired & Active 🟢" : "No Hardware Paired"}
              </span>
            </div>

            {pairedSoundbox ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <span>{pairedSoundbox.model || "4G 3W Audio Soundbox"}</span>
                    <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-md font-mono">{pairedSoundbox.sim || "Jio IoT 4G"}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 font-mono mt-0.5">
                    Serial: {pairedSoundbox.serial} · Battery: {pairedSoundbox.battery || "100%"} · Status: {pairedSoundbox.status || "Online"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                    Instant Voice Chime Ready
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>No physical 4G soundbox registered yet. Contact admin support or order via Dukaan Hardware Desk.</span>
                <a
                  href="mailto:contact@officialdukaan.in?subject=Order%20Dukaan%204G%20Soundbox"
                  className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-[11px] hover:bg-blue-500 shrink-0 ml-3"
                >
                  Order Soundbox
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: SUPPORT DESK & NPS FEEDBACK
      ========================================================= */}
      {activeTab === "support" && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Card 1: Submit New Support Ticket */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Customer Support Desk</h3>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase border border-blue-500/20">
                  Priority Desk
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct priority ticket channel to our master admin engineering desk. Response guaranteed within 2 hours.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Ticket Subject *</Label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. Printer margin adjustment in 58mm..."
                    className="mt-1 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Urgency / Priority</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(p) => setTicketForm({ ...ticketForm, priority: p })}
                  >
                    <SelectTrigger className="mt-1 h-10 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectItem value="low">Low (General Query)</SelectItem>
                      <SelectItem value="medium">Medium (Standard Issue)</SelectItem>
                      <SelectItem value="high">High (Counter / POS Blocked)</SelectItem>
                      <SelectItem value="critical">Critical (Hardware / Payment Issue)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Issue Description *</Label>
                  <Textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Describe what happened or what help you need..."
                    rows={4}
                    className="mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {submittingTicket ? "Submitting Ticket…" : "Submit Support Ticket"}
                </Button>
              </form>
            </div>

            {/* Card 2: Merchant Feedback & NPS Rating Wall */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Merchant NPS Feedback Wall</h3>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase border border-amber-500/20">
                  Reviews
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rate your daily billing experience on Dukaan. Your feedback shapes our next software releases!
              </p>

              {feedbackSubmitted ? (
                <div className="p-8 text-center bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <div className="font-bold text-slate-900 dark:text-white text-sm">Feedback Received!</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thank you for rating Official Dukaan. We read every review.</p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">How satisfied are you with Dukaan?</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= feedbackRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-900 dark:text-white ml-2">
                        {feedbackRating === 5 ? "⭐️ 5 - Exceptional" :
                         feedbackRating === 4 ? "⭐️ 4 - Very Good" :
                         feedbackRating === 3 ? "⭐️ 3 - Good" :
                         feedbackRating === 2 ? "⭐️ 2 - Needs Work" : "⭐️ 1 - Poor"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Your Comments or Feature Request</Label>
                    <Textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="What do you love? What features would make your daily store operations even smoother?..."
                      rows={4}
                      className="mt-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {submittingFeedback ? "Submitting Review…" : "Publish Feedback Review"}
                  </Button>
                </form>
              )}
            </div>

          </div>

          {/* Submitted Tickets History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">My Support Tickets History</h3>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No support tickets submitted yet.</div>
            ) : (
              <div className="space-y-2.5">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{t.id}</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{t.subject}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{t.message}</p>
                      <div className="text-[10px] text-slate-400">Submitted: {new Date(t.created_at).toLocaleString("en-IN")}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                      t.status === "resolved" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                      t.status === "in_progress" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: DUKAAN PRO STUDIO
      ========================================================= */}
      {activeTab === "pro" && (
        <DukaanProStudio
          user={user}
          currentShop={shops.find(x => x.id === currentShopId) || shops[0]}
          isPro={isPro}
        />
      )}

    </div>
  );
}
