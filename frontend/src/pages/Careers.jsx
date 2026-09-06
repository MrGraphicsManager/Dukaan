import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Camera, 
  MapPin, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Upload, 
  Phone, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  UserCheck, 
  Check, 
  ChevronRight, 
  ExternalLink,
  Search,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

const SALARY_PHONE = "7016430577";

const OPEN_ROLES = [
  {
    id: "social-media",
    title: "Social Media & Content",
    subtitle: "Create. Share. Grow.",
    icon: Camera,
    color: "blue",
    education: "12th Pass / Pursuing College",
    skills: "Basic Editing Skills (Canva etc.)",
    location: "Remote / Hybrid (Gujarat)",
    positions: "1 Position",
    badge: "Creative Role",
    desc: "Create engaging reels, Instagram posts, banners, and video tutorials showcasing Dukaan features for small retail shop owners."
  },
  {
    id: "field-sales",
    title: "Field Sales Intern",
    subtitle: "Meet. Onboard. Grow.",
    icon: MapPin,
    color: "indigo",
    education: "12th Pass / Pursuing College",
    skills: "Good Communication & Hindi/Gujarati speaking",
    location: "Only Navsari, Surat or Bardoli",
    positions: "1 Position",
    badge: "High Growth",
    desc: "Visit local Kirana stores, supermarkets, and shops in Navsari, Surat, and Bardoli. Onboard merchants and show them how Dukaan simplifies billing."
  }
];

export default function Careers() {
  const navigate = useNavigate();

  // Verification step state: "gate" (enter email & phone) | "status" (view existing app) | "form" (fill details)
  const [step, setStep] = useState("gate");

  // Gate Inputs
  const [gateEmail, setGateEmail] = useState("");
  const [gatePhone, setGatePhone] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // Existing application if found
  const [existingApp, setExistingApp] = useState(null);

  // Selected Job Role for new application
  const [selectedRole, setSelectedRole] = useState(OPEN_ROLES[0].title);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    role: OPEN_ROLES[0].title,
    city: "Navsari",
    city_other: "",
    address: "",
    dob: "",
    gender: "Male",
    education: "12th Pass",
    institute: "",
    aadhar_number: "",
    portfolio_url: "",
    why_hire: "",
    declaration: false
  });

  // Document file base64 / metadata
  const [aadharDoc, setAadharDoc] = useState({ name: "", data: "", type: "" });
  const [marksheetDoc, setMarksheetDoc] = useState({ name: "", data: "", type: "" });
  const [resumeDoc, setResumeDoc] = useState({ name: "", data: "", type: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-sync offline applications and prefill credentials on load
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("dukaan_user");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.email) setGateEmail(u.email);
        if (u.phone) setGatePhone(u.phone);
      }
    } catch (_) {}

    try {
      const raw = localStorage.getItem("dukaan_job_applications");
      if (raw) {
        const apps = JSON.parse(raw);
        if (Array.isArray(apps) && apps.length > 0) {
          apps.forEach(app => {
            if (app && app.email && app.phone) {
              api.post("/careers/apply", app).catch(() => {});
            }
          });
        }
      }
    } catch (_) {}
  }, []);

  // Handle file upload to Base64 with instant canvas compression
  const handleFileUpload = (e, setDocState, label) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${label} file size must be less than 10MB.`);
      return;
    }

    if (file.type && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setDocState({
            name: file.name,
            data: compressed,
            type: "image/jpeg"
          });
          toast.success(`${label} uploaded and optimized!`);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocState({
          name: file.name,
          data: event.target.result,
          type: file.type
        });
        toast.success(`${label} uploaded successfully!`);
      };
      reader.onerror = () => {
        toast.error(`Could not read ${label} file.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check application status by email & phone
  const handleCheckOrProceed = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = gateEmail.trim().toLowerCase();
    const cleanPhone = gatePhone.trim().replace(/\D/g, "");

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsChecking(true);
    try {
      // 1. Check local storage first
      let localApps = [];
      try {
        const raw = localStorage.getItem("dukaan_job_applications");
        if (raw) localApps = JSON.parse(raw);
      } catch (_) {}

      const localFound = localApps.find(a => 
        (a.email && a.email.toLowerCase() === cleanEmail) || 
        (a.phone && a.phone.replace(/\D/g, "").endsWith(cleanPhone.slice(-10)))
      );

      // 2. Query backend API
      const res = await api.post("/careers/check", { email: cleanEmail, phone: cleanPhone }).catch(() => null);

      if (res?.data?.exists && res.data.application) {
        setExistingApp(res.data.application);
        setStep("status");
        toast.info("Existing application found!");
      } else if (localFound) {
        setExistingApp(localFound);
        setStep("status");
        toast.info("Existing application found!");
        // Auto-sync offline application to cloud server
        api.post("/careers/apply", localFound).catch(() => {});
      } else {
        // Unlock application form
        setFormData(prev => ({
          ...prev,
          email: cleanEmail,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          role: selectedRole
        }));
        setStep("form");
        toast.success("Details verified! Please fill in your application form.");
      }
    } catch (err) {
      toast.error("Error checking application status. Proceeding to form.");
      setFormData(prev => ({
        ...prev,
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: cleanPhone
      }));
      setStep("form");
    } finally {
      setIsChecking(false);
    }
  };

  // Submit complete application
  const handleSubmitApplication = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.aadhar_number.trim() || formData.aadhar_number.replace(/\D/g, "").length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhar Card number.");
      return;
    }
    if (!aadharDoc.data) {
      toast.error("Please upload a photo or scan of your Aadhar Card.");
      return;
    }
    if (!marksheetDoc.data) {
      toast.error("Please upload your 10th or 12th Marksheet.");
      return;
    }
    if (!formData.declaration) {
      toast.error("Please accept the declaration checkbox before submitting.");
      return;
    }

    setIsSubmitting(true);
    const finalCity = formData.city === "Other" ? formData.city_other : formData.city;

    const payload = {
      ...formData,
      city: finalCity,
      aadhar_doc: aadharDoc.data,
      marksheet_doc: marksheetDoc.data,
      resume_doc: resumeDoc.data,
      role: selectedRole
    };

    try {
      const res = await api.post("/careers/apply", payload).catch(() => null);
      const app = res?.data?.application || {
        id: "APP-" + Date.now().toString().slice(-6),
        ...payload,
        status: "under_review",
        created_at: new Date().toISOString()
      };

      // Store in localStorage for instant retrieval
      try {
        const raw = localStorage.getItem("dukaan_job_applications") || "[]";
        const list = JSON.parse(raw);
        const idx = list.findIndex(x => x.email.toLowerCase() === app.email.toLowerCase());
        if (idx >= 0) list[idx] = app;
        else list.unshift(app);
        localStorage.setItem("dukaan_job_applications", JSON.stringify(list));
      } catch (_) {}

      setExistingApp(app);
      setStep("status");
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error("Submission failed. Saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Dukaan" className="h-10 w-auto object-contain" />
            <div className="hidden sm:flex flex-col border-l border-slate-200 pl-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono leading-none">by</span>
              <span className="text-xs font-black tracking-tight text-slate-900 leading-tight">PEAN</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${SALARY_PHONE}`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>HR Helpline: {SALARY_PHONE}</span>
            </a>

            <Button
              onClick={() => {
                setStep("gate");
                setExistingApp(null);
              }}
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-bold border-slate-300"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              <span>Check Status</span>
            </Button>

            <Button 
              onClick={() => navigate("/")}
              size="sm"
              className="rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
            >
              Dukaan Home
            </Button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO & OFFICIAL HIRING FLYER BANNER
      ========================================================= */}
      <section className="relative pt-10 pb-12 overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Top National & Mission Tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FOR EVERY SHOP & KIRANA IN INDIA 🇮🇳</span>
            </div>

            <div className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Small Businesses · Big Tomorrow
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Flyer Typography */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-950 leading-[1.05]">
                We're <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Hiring.
                </span>
              </h1>

              <p className="text-lg sm:text-xl font-medium text-slate-600 max-w-xl leading-relaxed">
                Be a part of something meaningful. Help us empower local businesses and kirana stores across Bharat.
              </p>

              {/* SALARY HOTLINE NOTICE BANNER */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Salary & Compensation Inquiry
                    </div>
                    <div className="text-sm font-semibold text-slate-800">
                      Salary ka scene jaan na ho toh <strong className="text-amber-800">7016430577</strong> pe contact karo
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${SALARY_PHONE}`}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href={`https://wa.me/91${SALARY_PHONE}?text=Hello%20Dukaan%20Team%2C%20I%20want%20to%20know%20about%20the%20job%20salary%20and%20details.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Quick stats pills */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Direct PEAN Payroll
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 12th Pass & College Welcome
                </span>
                <span>·</span>
                <span className="font-mono text-slate-500">Built for Bharat 🇮🇳</span>
              </div>
            </div>

            {/* Right: Interactive Role Picker Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Select a Position to Apply</span>
                <span className="text-blue-600 font-mono">2 Open Roles</span>
              </div>

              {OPEN_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.title;
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.title);
                      setFormData(prev => ({ ...prev, role: role.title }));
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-white border-blue-600 shadow-xl ring-2 ring-blue-500/20"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          role.color === "blue" ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">{role.title}</h3>
                          <div className="text-xs font-medium text-slate-500">{role.subtitle}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {role.positions}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                      {role.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{role.education}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{role.location}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span>Role Selected</span>
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN APPLICATION WORKFLOW CONTAINER
      ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {/* =====================================================
            STAGE 1: GATE / PRE-APPLICATION VERIFICATION
        ===================================================== */}
        {step === "gate" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-xl max-w-xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black font-display text-slate-900">
                Candidate Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Form bharne se pehle ya apni application ka status dekhne ke liye apna Email aur Mobile Number enter karein.
              </p>
            </div>

            <form onSubmit={handleCheckOrProceed} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    required
                    placeholder="e.g. rahul.patel@gmail.com"
                    value={gateEmail}
                    onChange={(e) => setGateEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-300 text-sm focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  10-Digit Mobile Number
                </Label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                    +91
                  </span>
                  <Input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={gatePhone}
                    onChange={(e) => setGatePhone(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-300 text-sm focus:bg-white font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isChecking}
                className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {isChecking ? (
                  <span>Checking Application...</span>
                ) : (
                  <>
                    <span>Continue to Application / Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Applying for: <strong>{selectedRole}</strong></span>
              <a href={`tel:${SALARY_PHONE}`} className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Salary Help</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            STAGE 2: APPLICATION STATUS DISPLAY CARD
        ===================================================== */}
        {step === "status" && existingApp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-2xl max-w-2xl mx-auto space-y-6"
          >
            {/* Header with status badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Application Reference: {existingApp.id || "APP-829102"}
                </span>
                <h2 className="text-2xl font-black font-display text-slate-900 mt-1">
                  Application Status
                </h2>
                <div className="text-xs text-slate-500">
                  Submitted on {new Date(existingApp.created_at || Date.now()).toLocaleDateString("en-IN", { dateStyle: "long" })}
                </div>
              </div>

              {/* DYNAMIC STATUS BADGE */}
              {existingApp.status === "approved" ? (
                <div className="px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>APPLICATION APPROVED</span>
                </div>
              ) : existingApp.status === "denied" ? (
                <div className="px-4 py-2 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs flex items-center gap-2 shadow-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>NOT SHORTLISTED / DENIED</span>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center gap-2 shadow-xs">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>UNDER REVIEW</span>
                </div>
              )}
            </div>

            {/* DYNAMIC STATUS CALLOUT BANNER */}
            {existingApp.status === "approved" ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2">
                <div className="text-lg font-black flex items-center gap-2 text-emerald-800">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Badhai Ho! Your Application is Approved 🎉</span>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                  We are contacting you soon on your mobile number <strong>{existingApp.phone}</strong> or WhatsApp for onboarding & next steps!
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
                  <a
                    href={`tel:${SALARY_PHONE}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call HR Desk ({SALARY_PHONE})</span>
                  </a>
                  <a
                    href={`https://wa.me/91${SALARY_PHONE}?text=Hello%20Dukaan%2C%20My%20Application%20${existingApp.id}%20is%20Approved.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : existingApp.status === "denied" ? (
              <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                <div className="text-base font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>Application Not Shortlisted</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                  Thank you for your interest in Dukaan. Currently, this specific vacancy has been filled or we have shortlisted other candidates. We will keep your resume on file for future opportunities!
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
                <div className="text-base font-bold text-amber-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Your Application is Under Review</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  Humari hiring team aapki profile, marksheet aur aadhar card verify kar rahi hai. Jaise hi review complete hoga, aapka status yaha update ho jayega aur hum aapko call karenge.
                </p>
                <div className="text-xs text-amber-800 font-semibold pt-1">
                  💡 <strong>Salary query?</strong> Call HR helpline directly: <a href={`tel:${SALARY_PHONE}`} className="underline font-bold text-amber-950">7016430577</a>
                </div>
              </div>
            )}

            {/* Candidate Details Summary */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted Application Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Candidate Name:</span>
                  <div className="font-bold text-slate-800 text-sm">{existingApp.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">Applied Role:</span>
                  <div className="font-bold text-blue-600 text-sm">{existingApp.role}</div>
                </div>
                <div>
                  <span className="text-slate-400">Email Address:</span>
                  <div className="font-medium text-slate-700">{existingApp.email}</div>
                </div>
                <div>
                  <span className="text-slate-400">Mobile / WhatsApp:</span>
                  <div className="font-medium text-slate-700">{existingApp.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400">Location / City:</span>
                  <div className="font-medium text-slate-700">{existingApp.city}</div>
                </div>
                <div>
                  <span className="text-slate-400">Education:</span>
                  <div className="font-medium text-slate-700">{existingApp.education}</div>
                </div>
              </div>

              {/* Documents status */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-emerald-600">
                  <FileCheck className="w-3.5 h-3.5" /> Aadhar Card Attached
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <FileCheck className="w-3.5 h-3.5" /> Marksheet Attached
                </span>
                {existingApp.resume_doc && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <FileText className="w-3.5 h-3.5" /> Resume Attached
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setStep("gate");
                    setExistingApp(null);
                  }}
                  variant="outline"
                  className="rounded-xl text-xs font-bold"
                >
                  Check Another Number / Reset
                </Button>

                <Button
                  onClick={async () => {
                    if (!existingApp) return;
                    setIsChecking(true);
                    try {
                      const res = await api.post("/careers/check", { email: existingApp.email, phone: existingApp.phone });
                      if (res?.data?.application) {
                        setExistingApp(res.data.application);
                        toast.success("Application status refreshed!");
                      }
                    } catch (_) {
                      toast.error("Could not refresh status.");
                    } finally {
                      setIsChecking(false);
                    }
                  }}
                  disabled={isChecking}
                  variant="outline"
                  className="rounded-xl text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                  <span>Refresh Status</span>
                </Button>
              </div>

              <a
                href={`tel:${SALARY_PHONE}`}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Contact HR: 7016430577</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* =====================================================
            STAGE 3: FULL DETAILED APPLICATION FORM
        ===================================================== */}
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-xl space-y-8"
          >
            {/* Header */}
            <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Applying for: {selectedRole}</span>
                </div>
                <h2 className="text-3xl font-black font-display text-slate-900">
                  Candidate Application Form
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Kripya apni sahi jankari aur legal documents (Aadhar Card, Marksheet) attach karein.
                </p>
              </div>

              <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-600 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">Salary Inquiry</span>
                <a href={`tel:${SALARY_PHONE}`} className="font-bold text-blue-600 hover:underline">
                  📞 {SALARY_PHONE}
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  1. Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name (As per Aadhar) *</Label>
                    <Input
                      required
                      placeholder="e.g. Rahul Mukeshbhai Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 border-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Email Address (Verified)</Label>
                    <Input
                      disabled
                      value={formData.email}
                      className="h-11 rounded-xl bg-slate-100 border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Mobile Number (Verified)</Label>
                    <Input
                      disabled
                      value={formData.phone}
                      className="h-11 rounded-xl bg-slate-100 border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">WhatsApp Number *</Label>
                    <Input
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 border-slate-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">City / Location *</Label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 text-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Navsari">Navsari (Gujarat)</option>
                      <option value="Surat">Surat (Gujarat)</option>
                      <option value="Bardoli">Bardoli (Gujarat)</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  {formData.city === "Other" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Specify City *</Label>
                      <Input
                        required
                        placeholder="Enter your city name"
                        value={formData.city_other}
                        onChange={(e) => setFormData({ ...formData, city_other: e.target.value })}
                        className="h-11 rounded-xl bg-slate-50 border-slate-300"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Gender</Label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 text-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Current Residential Address *</Label>
                  <Input
                    required
                    placeholder="House / Flat No, Society, Area, Pincode"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-300"
                  />
                </div>
              </div>

              {/* SECTION 2: EDUCATION & QUALIFICATIONS */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  2. Education & Experience
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Highest Qualification *</Label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-300 text-sm px-3 text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="12th Pass">12th Pass</option>
                      <option value="Pursuing College">Pursuing College (1st / 2nd / 3rd Year)</option>
                      <option value="Graduate">Graduate (B.Com, BBA, BCA, etc.)</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="10th Pass">10th Pass</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">School / College Name *</Label>
                    <Input
                      required
                      placeholder="e.g. VNSGU / Navsari Commerce College"
                      value={formData.institute}
                      onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                      className="h-11 rounded-xl bg-slate-50 border-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Portfolio / Canva Links / Instagram (Optional)</Label>
                  <Input
                    placeholder="e.g. Instagram handle or Canva design drive link"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Why do you want to join Dukaan? *</Label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Apne baare me aur aap is role me kyu fit hain, 2-3 lines me likhein..."
                    value={formData.why_hire}
                    onChange={(e) => setFormData({ ...formData, why_hire: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 3: LEGAL DOCUMENTS UPLOAD */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    3. Legal Documents & Identity Proofs *
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    🔒 100% Encrypted & Secure
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">12-Digit Aadhar Card Number *</Label>
                  <Input
                    required
                    maxLength={12}
                    placeholder="1234 5678 9012"
                    value={formData.aadhar_number}
                    onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value.replace(/\D/g, "") })}
                    className="h-11 rounded-xl bg-slate-50 border-slate-300 font-mono tracking-widest text-sm"
                  />
                </div>

                {/* Upload Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Aadhar Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 transition-all text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Aadhar Card Photo *</div>
                    <p className="text-[10px] text-slate-500">Front or Back (Image / PDF max 5MB)</p>

                    {aadharDoc.data ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{aadharDoc.name}</span>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Aadhar</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, setAadharDoc, "Aadhar Card")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Marksheet Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 transition-all text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">10th / 12th Marksheet *</div>
                    <p className="text-[10px] text-slate-500">Official Marksheet (Image / PDF)</p>

                    {marksheetDoc.data ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{marksheetDoc.name}</span>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Marksheet</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, setMarksheetDoc, "Marksheet")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Resume / CV Upload */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 transition-all text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">Resume / CV (Optional)</div>
                    <p className="text-[10px] text-slate-500">PDF / Doc if available</p>

                    {resumeDoc.data ? (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{resumeDoc.name}</span>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>Upload Resume</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, setResumeDoc, "Resume")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION 4: DECLARATION & SUBMIT */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.declaration}
                    onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Main declare karta/karti hoon ki upar di gayi saari jankari aur documents (Aadhar Card, Marksheet) 100% genuine aur sahi hain. Dukaan & PEAN verification ke liye inka upyog kar sakte hain.
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep("gate")}
                    variant="ghost"
                    className="text-slate-500 text-xs font-semibold"
                  >
                    Back to Verification
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </motion.div>
        )}

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Dukaan · A Product by PEAN · Built for Bharat 🇮🇳
          </div>
          <div className="flex items-center gap-4 font-medium">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link>
            <a href={`tel:${SALARY_PHONE}`} className="text-blue-600 font-bold">HR: {SALARY_PHONE}</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
