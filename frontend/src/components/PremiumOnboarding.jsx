import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck2, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  UserRound, 
  Crown,
  FileText,
  BadgeCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "Kirana & Grocery", icon: Store },
  { id: "Medical & Pharmacy", icon: ShieldCheck },
  { id: "Clothing & Apparel", icon: UserRound },
  { id: "Electronics & Mobile", icon: Sparkles },
  { id: "Stationery & Books", icon: FileText },
  { id: "Hardware & Electrical", icon: Building2 },
  { id: "Cafe & Food Corner", icon: Store },
  { id: "General Departmental", icon: Building2 }
];

export const EMPTY_PREMIUM_ONBOARDING = {
  owner_name: "",
  phone: "",
  contact_email: "",
  name: "",
  store_category: "Kirana & Grocery",
  address: "",
  gst_number: "",
  gst_enabled: false,
};

export default function PremiumOnboarding({ initialValues, user, onComplete, busy = false }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ 
    ...EMPTY_PREMIUM_ONBOARDING, 
    ...initialValues, 
    contact_email: initialValues?.contact_email || user?.email || "", 
    owner_name: initialValues?.owner_name || user?.name || "" 
  });
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  const next = () => {
    setError("");
    if (step === 0) {
      if (!form.name.trim() || !form.owner_name.trim() || !form.phone.trim()) {
        setError("Please fill in your Shop Name, Owner Name, and 10-digit Phone Number.");
        return;
      }
      if (form.phone.trim().replace(/\D/g, "").length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }
    if (step === 1 && !form.store_category) {
      setError("Please select a store category to continue.");
      return;
    }
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      onComplete(form);
    }
  };

  const stepsList = [
    { title: "Business Identity", subtitle: "Owner & contact details" },
    { title: "Store Profile", subtitle: "Category & location" },
    { title: "GST & Review", subtitle: "Tax compliance setup" },
  ];

  return (
    <div className="rounded-3xl border-2 border-brand-mitti bg-white p-6 md:p-10 shadow-xl max-w-3xl mx-auto font-sans text-brand-indigo relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-brand-mitti">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white grid place-items-center shadow-md shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Step {step + 1} of 3
              </span>
              <span className="text-xs font-bold text-brand-indigo/50">Multi-Shop & GST Setup</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-indigo mt-0.5">
              Premium Store Profile Setup
            </h2>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-brand-indigo/60 mb-2">
          {stepsList.map((s, idx) => (
            <span 
              key={idx} 
              className={`transition-colors ${idx === step ? "text-brand-terracotta font-extrabold" : idx < step ? "text-emerald-700" : "text-brand-indigo/40"}`}
            >
              {idx + 1}. {s.title}
            </span>
          ))}
        </div>
        <div className="w-full bg-brand-sand rounded-full h-2 overflow-hidden border border-brand-mitti">
          <motion.div 
            className="h-full bg-brand-terracotta rounded-full" 
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.35 }} 
          />
        </div>
      </div>

      {/* Steps Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* STEP 1: BUSINESS & OWNER IDENTITY */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="bg-brand-sand/60 p-4 rounded-2xl border border-brand-mitti flex items-center gap-3">
                <Building2 className="w-5 h-5 text-brand-terracotta shrink-0" />
                <p className="text-xs text-brand-indigo/80 leading-relaxed font-medium">
                  Enter your business details. These will be printed on invoices, thermal receipts, and GST bill headers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field 
                  icon={Store} 
                  label="Shop / Business Name *" 
                  value={form.name} 
                  onChange={(v) => set("name", v)} 
                  placeholder="e.g. Shri Krishna Supermarket" 
                />
                <Field 
                  icon={UserRound} 
                  label="Proprietor / Owner Name *" 
                  value={form.owner_name} 
                  onChange={(v) => set("owner_name", v)} 
                  placeholder="Your full name" 
                />
                <Field 
                  icon={Phone} 
                  label="10-Digit Mobile Number *" 
                  value={form.phone} 
                  onChange={(v) => set("phone", v)} 
                  placeholder="9825100000" 
                  inputMode="tel" 
                />
                <Field 
                  icon={Mail} 
                  label="Official Email Address" 
                  value={form.contact_email} 
                  onChange={(v) => set("contact_email", v)} 
                  placeholder="owner@dukaan.in" 
                  type="email" 
                />
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY & PREMISES */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs uppercase font-extrabold text-brand-indigo/70">
                  Select Primary Store Category *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.store_category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => set("store_category", cat.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-24 ${
                          isSelected
                            ? "bg-brand-indigo text-white border-brand-indigo shadow-md"
                            : "bg-white hover:bg-brand-sand border-brand-mitti text-brand-indigo"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-amber-300" : "text-brand-terracotta"}`} />
                        <span className="text-xs font-bold leading-tight">{cat.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase font-extrabold text-brand-indigo/70">
                  Physical Shop Address & Location
                </Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-indigo/40" />
                  <textarea
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    rows={3}
                    placeholder="e.g. Shop #14, Market Road, Near City Post Office, Ahmedabad"
                    className="w-full rounded-2xl border-2 border-brand-mitti bg-white pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-brand-indigo"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GST COMPLIANCE & SUMMARY REVIEW */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border-2 border-brand-mitti bg-brand-sand/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-brand-terracotta" />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-brand-indigo">GST Invoicing Enablement</h4>
                      <p className="text-[11px] text-brand-indigo/60">Generate GST compliant invoices with HSN summary</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => set("gst_enabled", !form.gst_enabled)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${form.gst_enabled ? "bg-emerald-600" : "bg-brand-mitti"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.gst_enabled ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {form.gst_enabled && (
                  <div>
                    <Label className="text-xs uppercase font-extrabold text-brand-indigo/70">
                      GST Identification Number (GSTIN)
                    </Label>
                    <Input
                      value={form.gst_number}
                      onChange={(e) => set("gst_number", e.target.value.toUpperCase())}
                      placeholder="e.g. 24AAAAA0000A1Z5"
                      className="mt-1.5 h-12 uppercase font-mono font-bold rounded-xl border-brand-mitti bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div>
                <div className="text-xs uppercase font-extrabold text-brand-indigo/60 mb-2">
                  Profile Review Summary:
                </div>
                <div className="bg-brand-indigo text-white p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Shop Name</div>
                    <div className="font-bold truncate mt-0.5">{form.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Proprietor</div>
                    <div className="font-bold truncate mt-0.5">{form.owner_name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">Category</div>
                    <div className="font-bold truncate mt-0.5">{form.store_category}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 uppercase font-bold">GST State</div>
                    <div className="font-bold text-amber-300 truncate mt-0.5">
                      {form.gst_enabled ? (form.gst_number || "Enabled") : "Non-GST"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="mt-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="mt-8 pt-6 border-t-2 border-brand-mitti flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-2xl border-2 border-brand-mitti text-brand-indigo font-bold text-xs hover:border-brand-indigo flex items-center gap-1.5 h-11 px-5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          disabled={busy}
          onClick={next}
          className="rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 h-11 px-7"
        >
          <span>{busy ? "Saving Profile…" : step === 2 ? "Complete Setup & Proceed to Checkout" : "Continue"}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <div>
      <Label className="text-xs uppercase font-extrabold text-brand-indigo/70">{label}</Label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-indigo/40" />
        <Input 
          type={type} 
          inputMode={inputMode} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          className="h-12 pl-10 rounded-2xl border-2 border-brand-mitti bg-white text-sm font-medium focus:border-brand-indigo" 
        />
      </div>
    </div>
  );
}
