import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Mail
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

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

export default function Settings() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const activeTab = params.get("tab") || "account";
  const setTab = (t) => setParams({ tab: t });

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

  return (
    <div className="space-y-8 animate-fade-up max-w-[1200px] mx-auto pb-16 font-sans selection:bg-brand-terracotta/20">
      
      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <div className="bg-gradient-to-r from-brand-indigo via-[#261E7A] to-brand-indigo text-white p-7 md:p-8 rounded-3xl shadow-lg border-2 border-brand-indigo/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-terracotta flex items-center justify-center shrink-0 shadow-md">
            {activeTab === "account" ? <User className="w-7 h-7 text-white" /> : <Store className="w-7 h-7 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-white/60 font-semibold font-mono">
                {activeTab === "account" ? "MERCHANT ACCOUNT" : "STORE MANAGEMENT"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white">
                {user?.is_admin ? "Admin Account" : "Verified Account"}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              {activeTab === "account" ? "My Account & Profile" : "Shop & Business Settings"}
            </h1>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center gap-3">
          {activeTab === "shop" ? (
            <Button
              disabled={busyShop}
              onClick={saveShop}
              className="h-12 px-7 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{busyShop ? "Saving…" : "Save Shop Changes"}</span>
            </Button>
          ) : (
            <Button
              disabled={savingProfile}
              onClick={handleSaveProfile}
              className="h-12 px-7 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
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
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-brand-mitti shadow-xs max-w-md">
        <button
          onClick={() => setTab("account")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "account"
              ? "bg-brand-indigo text-white shadow-xs"
              : "text-brand-indigo/60 hover:text-brand-indigo hover:bg-brand-sand/50"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Account & Profile</span>
        </button>
        <button
          onClick={() => setTab("shop")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "shop"
              ? "bg-brand-indigo text-white shadow-xs"
              : "text-brand-indigo/60 hover:text-brand-indigo hover:bg-brand-sand/50"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop & Business</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: MY ACCOUNT & PROFILE
      ========================================================= */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: User Profile */}
            <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
                <User className="w-4 h-4 text-brand-terracotta" />
                <h3 className="font-heading font-bold text-base text-brand-indigo">Personal Profile Details</h3>
              </div>

              {/* Avatar section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-brand-sand border-2 border-brand-mitti overflow-hidden grid place-items-center font-heading font-bold text-2xl text-brand-indigo shadow-xs">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (profileName || user?.email || "U")[0]?.toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-brand-terracotta text-white grid place-items-center shadow-md hover:bg-brand-terracotta/90 transition-all cursor-pointer"
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
                  <div className="font-heading font-bold text-sm text-brand-indigo">Profile Photo</div>
                  <div className="text-xs text-brand-indigo/50 mt-0.5">Click the camera icon to upload a picture</div>
                  {profileAvatar && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatar("")}
                      className="text-[11px] text-red-600 font-semibold hover:underline mt-1 block"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Full Name *</Label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Registered Email</Label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="mt-1 h-11 rounded-xl border-brand-mitti bg-slate-50 font-mono text-xs text-slate-600 cursor-not-allowed"
                />
                <span className="text-[11px] text-brand-indigo/50 mt-1 block">
                  Email is your unique login credential and cannot be changed directly.
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Phone Number</Label>
                <Input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 9825100000"
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                />
              </div>

              <div className="pt-2">
                <Button
                  disabled={savingProfile}
                  onClick={handleSaveProfile}
                  className="w-full h-11 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold text-xs shadow-xs"
                >
                  {savingProfile ? "Saving Profile…" : "Save Profile Details"}
                </Button>
              </div>
            </div>

            {/* Card 2: Security & Password */}
            <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
                <KeyRound className="w-4 h-4 text-brand-terracotta" />
                <h3 className="font-heading font-bold text-base text-brand-indigo">Account Security & Password</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Current Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter your current password"
                    className="h-11 rounded-xl border-brand-mitti pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-indigo/40 hover:text-brand-indigo"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">New Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimum 8 characters with symbol & number"
                    className="h-11 rounded-xl border-brand-mitti pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-indigo/40 hover:text-brand-indigo"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Confirm New Password *</Label>
                <Input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                />
              </div>

              {/* Password strength checklist */}
              <div className="p-3.5 rounded-2xl bg-brand-sand/50 border border-brand-mitti/60 text-xs space-y-1 text-brand-indigo/80 font-medium">
                <div className="font-bold text-[11px] uppercase tracking-wider text-brand-indigo/60 mb-1">
                  Password Requirements:
                </div>
                <div className={`flex items-center gap-1.5 ${newPw.length >= 8 ? "text-emerald-600 font-bold" : "text-brand-indigo/50"}`}>
                  <CheckCircle2 className="w-3 h-3" /> Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPw) ? "text-emerald-600 font-bold" : "text-brand-indigo/50"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPw) ? "text-emerald-600 font-bold" : "text-brand-indigo/50"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/.test(newPw) ? "text-emerald-600 font-bold" : "text-brand-indigo/50"}`}>
                  <CheckCircle2 className="w-3 h-3" /> At least 1 special symbol (!@#$...)
                </div>
              </div>

              <div className="pt-2">
                <Button
                  disabled={savingPw}
                  onClick={handleChangePassword}
                  className="w-full h-11 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-xs"
                >
                  {savingPw ? "Updating Password…" : "Update Password"}
                </Button>
              </div>
            </div>

          </div>

          {/* Card 3: Membership & Subscription Overview */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 rounded-3xl p-6 md:p-8 border-2 border-amber-300/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-800" /> Active Membership
              </div>
              <h3 className="font-display text-2xl font-bold text-brand-indigo">
                {sub?.plan ? `${sub.plan.toUpperCase()} PLAN` : "STARTER PLAN"} {sub?.is_trial ? "(Free Trial)" : ""}
              </h3>
              <p className="text-xs text-brand-indigo/70 max-w-xl leading-relaxed">
                {isSubActive ? (
                  <span>
                    Your subscription is currently <b>active</b>. 
                    {remainingDays !== null && ` You have ${remainingDays} days remaining.`}
                    {sub?.expires_at && ` Renews / expires on ${new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`}
                  </span>
                ) : (
                  <span>You are currently on the trial or free tier. Upgrade to unlock full multi-shop, khata, and WhatsApp soundbox features.</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => nav("/app/billing")}
                className="rounded-xl border-brand-mitti text-brand-indigo font-bold text-xs h-11 px-5 hover:bg-white"
              >
                View Invoices & Billing
              </Button>
              <Button
                onClick={() => nav("/subscribe")}
                className="rounded-xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs h-11 px-6 shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade / Change Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Logout / Session Box */}
          <div className="bg-white rounded-3xl p-6 border-2 border-red-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-heading font-bold text-sm text-red-900">Sign Out of Account</div>
              <div className="text-xs text-red-700/70 mt-0.5">End your current session on this device safely.</div>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                nav("/");
              }}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-bold text-xs rounded-xl h-10 px-5 flex items-center gap-1.5"
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
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-brand-indigo/50">Branches</span>
                <h3 className="font-display text-xl font-bold text-brand-indigo mt-0.5">Your Dukaan Locations</h3>
              </div>
              <Button
                variant="outline"
                onClick={() => setCreating(prev => !prev)}
                className="rounded-full border-brand-mitti hover:border-brand-indigo text-brand-indigo text-xs font-bold h-9"
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
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isActive 
                        ? "bg-brand-sand border-brand-terracotta shadow-xs" 
                        : "bg-white border-brand-mitti hover:border-brand-indigo/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl grid place-items-center font-bold text-xs ${
                        isActive ? "bg-brand-terracotta text-white" : "bg-brand-sand text-brand-indigo"
                      }`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-brand-indigo">{s.name}</div>
                        <div className="text-[11px] text-brand-indigo/50">{s.phone || "No phone"}</div>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-terracotta text-white">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create new shop branch inline */}
            {creating && (
              <div className="mt-5 p-5 rounded-2xl bg-brand-sand border border-brand-mitti space-y-3">
                <h4 className="font-heading font-bold text-sm text-brand-indigo">Create New Shop Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="New Shop Name (e.g. Dukaan Branch 2)"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="bg-white border-brand-mitti rounded-xl"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="bg-white border-brand-mitti rounded-xl"
                  />
                </div>
                <Button 
                  disabled={busyShop}
                  onClick={createShop} 
                  className="rounded-xl bg-brand-terracotta text-white text-xs font-bold"
                >
                  {busyShop ? "Saving…" : "Save New Branch"}
                </Button>
              </div>
            )}
          </div>

          {/* Shop Details Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Identity & Contact */}
            <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
                <Building2 className="w-4 h-4 text-brand-terracotta" />
                <h3 className="font-heading font-bold text-base text-brand-indigo">Shop Profile</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Store Category & Industry</Label>
                <Select
                  value={form.store_category || "General Departmental Store"}
                  onValueChange={(val) => setForm({ ...form, store_category: val })}
                >
                  <SelectTrigger className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold bg-white">
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {((form.store_category || "").toLowerCase().includes("medical") || (form.store_category || "").toLowerCase().includes("pharmacy")) && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <b>Medical Store & Pharmacy detected:</b> With Dukaan Premium, Batch Number & Expiry Date Alert Guard (Feature #45) is activated for your inventory & POS.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Owner Name</Label>
                <Input
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Contact Phone Number</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop Address & City</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  placeholder="e.g. Shop #12, Market Yard, Ahmedabad"
                  className="mt-1 rounded-xl border-brand-mitti resize-none text-sm"
                />
              </div>
            </div>

            {/* Card 2: UPI QR & Invoicing */}
            <div className="bg-white rounded-3xl p-6 border-2 border-brand-mitti shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-brand-mitti">
                <QrCode className="w-4 h-4 text-brand-terracotta" />
                <h3 className="font-heading font-bold text-base text-brand-indigo">UPI & Billing Settings</h3>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Shop UPI ID (for QR Generation)</Label>
                <Input
                  value={form.upi_id}
                  onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                  placeholder="e.g. 9825100000@okaxis"
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-mono font-bold"
                />
                <span className="text-[11px] text-brand-indigo/50 mt-1 block">
                  This UPI ID will appear on counter QR stands for instant customer payments.
                </span>
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Invoice Footer Note</Label>
                <Input
                  value={form.invoice_footer}
                  onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })}
                  placeholder="Thank you for shopping with us!"
                  className="mt-1 h-11 rounded-xl border-brand-mitti"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-brand-indigo/70 uppercase">Default Low Stock Alert Threshold</Label>
                <Input
                  type="number"
                  value={form.min_stock_default}
                  onChange={(e) => setForm({ ...form, min_stock_default: e.target.value })}
                  className="mt-1 h-11 rounded-xl border-brand-mitti font-mono"
                />
                <span className="text-[11px] text-brand-indigo/50 mt-1 block">
                  Items will trigger low stock warning when remaining count reaches this number.
                </span>
              </div>

              <div className="pt-2">
                <Button
                  disabled={busyShop}
                  onClick={saveShop}
                  className="w-full h-12 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{busyShop ? "Saving…" : "Save All Changes"}</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
