import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, Lock, ShieldAlert } from "lucide-react";

// Onboarding Steps
import Screen1Welcome from "./Screen1Welcome";
import Screen2Language from "./Screen2Language";
import Screen3CreateAccount from "./Screen3CreateAccount";
import Screen4BusinessDetails from "./Screen4BusinessDetails";
import Screen5AddLogo from "./Screen5AddLogo";
import Screen6SelectPlan from "./Screen6SelectPlan";
import Screen7Success from "./Screen7Success";

// Auth Screens (Figma Image 4)
import MobileLogin from "./MobileLogin";
import MobileForgotPassword from "./MobileForgotPassword";
import MobileVerifyOtp from "./MobileVerifyOtp";
import MobileResetPassword from "./MobileResetPassword";
import MobileResetSuccess from "./MobileResetSuccess";

// Dashboard & Core App Screens (Figma Image 1, 2, 3)
import MobileDashboard from "./MobileDashboard";
import MobileNewBill from "./MobileNewBill";
import MobileProducts from "./MobileProducts";
import MobileStock from "./MobileStock";
import MobileCustomers from "./MobileCustomers";
import MobileUdhaar from "./MobileUdhaar";
import MobileOrders from "./MobileOrders";
import MobileReports from "./MobileReports";
import MobileExpenses from "./MobileExpenses";
import MobileSettings from "./MobileSettings";
import MobileHelp from "./MobileHelp";
import MobileWhatsNew from "./MobileWhatsNew";
import MobileUpgrade from "./MobileUpgrade";
import MobileProfile from "./MobileProfile";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.16, ease: "easeIn" },
  }),
};

export default function MobileFlow() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, shops } = useAuth();

  // Initial params
  const paramView = searchParams.get("view");
  const paramStep = parseInt(searchParams.get("step") || "1", 10);

  // View state with Session Persistence:
  // If user is already logged in (or has stored session), ALWAYS resume to dashboard on reload!
  const [currentView, setCurrentView] = useState(() => {
    if (paramView) return paramView;

    try {
      const storedUser = localStorage.getItem("dukaan_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && (parsed.email || parsed.phone)) {
          return "dashboard";
        }
      }
    } catch {}

    if (paramStep === 8) return "dashboard";
    return "onboarding";
  });

  const [onboardingStep, setOnboardingStep] = useState(
    paramStep >= 1 && paramStep <= 7 ? paramStep : 1
  );

  const [direction, setDirection] = useState(1);
  const [registeredPhone, setRegisteredPhone] = useState("");

  // Merchant state initialized from active user and shop
  const [merchantData, setMerchantData] = useState(() => {
    let name = "";
    let phone = "";
    let email = "";
    let businessName = "";
    let businessType = "Kirana & General Store";
    let address = "";
    let plan = "starter";

    try {
      const storedUser = JSON.parse(localStorage.getItem("dukaan_user") || "{}");
      if (storedUser.name) name = storedUser.name;
      if (storedUser.phone) phone = storedUser.phone;
      if (storedUser.email) email = storedUser.email;
      if (storedUser.subscription?.plan) plan = storedUser.subscription.plan;
    } catch {}

    try {
      const storedShops = JSON.parse(localStorage.getItem("dukaan_shops") || "[]");
      if (storedShops && storedShops.length > 0) {
        if (storedShops[0].name) businessName = storedShops[0].name;
        if (storedShops[0].store_category) businessType = storedShops[0].store_category;
        if (storedShops[0].address) address = storedShops[0].address;
      }
    } catch {}

    return {
      selectedLang: "en",
      fullName: name,
      phone: phone,
      email: email,
      password: "",
      businessName: businessName,
      businessType: businessType,
      category: "Retail",
      address: address,
      logoUrl: null,
      plan: plan,
    };
  });

  // Sync state if AuthContext user logs in or updates
  useEffect(() => {
    if (user) {
      setMerchantData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        plan: user.subscription?.plan || prev.plan,
        businessName: (shops && shops[0]?.name) || prev.businessName,
        businessType: (shops && shops[0]?.store_category) || prev.businessType,
        address: (shops && shops[0]?.address) || prev.address,
      }));

      // If user is logged in and on onboarding/login, promote to dashboard
      if (currentView === "onboarding" || currentView === "login") {
        setCurrentView("dashboard");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, shops]);

  // Sync state if URL query params change
  useEffect(() => {
    if (paramView) {
      setCurrentView(paramView);
    } else if (paramStep) {
      if (paramStep === 8) {
        setCurrentView("dashboard");
      } else if (!user) {
        setCurrentView("onboarding");
        setOnboardingStep(paramStep);
      }
    }
  }, [paramView, paramStep, user]);

  const updateFormData = (patch) => {
    setMerchantData((prev) => ({ ...prev, ...patch }));
  };

  const goToView = (viewName, dir = 1) => {
    setDirection(dir);
    setCurrentView(viewName);
  };

  const goToOnboardingStep = (stepNumber) => {
    setDirection(stepNumber > onboardingStep ? 1 : -1);
    setOnboardingStep(stepNumber);
    setCurrentView("onboarding");
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
    } catch {}
    localStorage.removeItem("dukaan_user");
    localStorage.removeItem("dukaan_access_token");
    goToView("login", -1);
  };

  // Bottom dock tab router
  const handleTabChange = (tabId) => {
    if (tabId === "home") goToView("dashboard");
    else if (tabId === "billing") goToView("new-bill");
    else if (tabId === "products") goToView("products");
    else if (tabId === "customers") goToView("customers");
    else if (tabId === "more") goToView("settings");
  };

  // Check Admin Lockout Control
  let mobileControl = { enabled: true, broadcast_message: "" };
  try {
    const rawCtrl = localStorage.getItem("dukaan_mobile_control");
    if (rawCtrl) mobileControl = JSON.parse(rawCtrl);
  } catch {}

  if (mobileControl.enabled === false && !user?.is_admin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Mobile Access Paused</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          {mobileControl.lock_reason || "Store Administrator has temporarily paused mobile companion access for maintenance."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg cursor-pointer"
        >
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-shell min-h-screen bg-white overflow-x-hidden relative select-none">
      
      {/* Admin Broadcast Banner if active */}
      {mobileControl.broadcast_message && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="truncate">{mobileControl.broadcast_message}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currentView}-${onboardingStep}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {/* =========================================================
              1. ONBOARDING STEPS 1 - 7
          ========================================================= */}
          {currentView === "onboarding" && onboardingStep === 1 && (
            <Screen1Welcome
              onNext={() => goToOnboardingStep(2)}
              onSkip={() => goToOnboardingStep(2)}
              onLogin={() => goToView("login")}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 2 && (
            <Screen2Language
              selectedLang={merchantData.selectedLang}
              onSelectLang={(code) => updateFormData({ selectedLang: code })}
              onNext={() => goToOnboardingStep(3)}
              onBack={() => goToOnboardingStep(1)}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 3 && (
            <Screen3CreateAccount
              formData={merchantData}
              updateFormData={updateFormData}
              onNext={() => goToOnboardingStep(4)}
              onBack={() => goToOnboardingStep(2)}
              onLogin={() => goToView("login")}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 4 && (
            <Screen4BusinessDetails
              formData={merchantData}
              updateFormData={updateFormData}
              onNext={() => goToOnboardingStep(5)}
              onBack={() => goToOnboardingStep(3)}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 5 && (
            <Screen5AddLogo
              formData={merchantData}
              updateFormData={updateFormData}
              onNext={() => goToOnboardingStep(6)}
              onBack={() => goToOnboardingStep(4)}
              onSkip={() => goToOnboardingStep(6)}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 6 && (
            <Screen6SelectPlan
              selectedPlan={merchantData.plan}
              onSelectPlan={(p) => updateFormData({ plan: p })}
              onNext={() => goToOnboardingStep(7)}
              onBack={() => goToOnboardingStep(5)}
              onSkip={() => goToOnboardingStep(7)}
            />
          )}

          {currentView === "onboarding" && onboardingStep === 7 && (
            <Screen7Success
              onNext={() => goToView("dashboard")}
            />
          )}

          {/* =========================================================
              2. AUTH & PASSWORD RESET FLOW (Figma Image 4)
          ========================================================= */}
          {currentView === "login" && (
            <MobileLogin
              onBack={() => goToOnboardingStep(1)}
              onLoginSuccess={(userData) => {
                if (userData) updateFormData(userData);
                goToView("dashboard");
              }}
              onForgotPassword={() => goToView("forgot-password")}
              onCreateAccount={() => goToOnboardingStep(3)}
            />
          )}

          {currentView === "forgot-password" && (
            <MobileForgotPassword
              onBack={() => goToView("login", -1)}
              onSendOtp={(phone) => {
                setRegisteredPhone(phone);
                goToView("otp");
              }}
              onBackToLogin={() => goToView("login", -1)}
            />
          )}

          {currentView === "otp" && (
            <MobileVerifyOtp
              phone={registeredPhone}
              onBack={() => goToView("forgot-password", -1)}
              onVerifySuccess={() => goToView("reset-password")}
            />
          )}

          {currentView === "reset-password" && (
            <MobileResetPassword
              onBack={() => goToView("otp", -1)}
              onResetSuccess={() => goToView("reset-success")}
            />
          )}

          {currentView === "reset-success" && (
            <MobileResetSuccess
              onGoToLogin={() => goToView("login")}
            />
          )}

          {/* =========================================================
              3. DASHBOARD (Figma Image 1 & 2)
          ========================================================= */}
          {currentView === "dashboard" && (
            <MobileDashboard
              merchantData={merchantData}
              onNavigate={(viewId) => goToView(viewId)}
            />
          )}

          {/* =========================================================
              4. CORE APP SCREENS (Figma Image 3)
          ========================================================= */}
          {currentView === "new-bill" && (
            <MobileNewBill
              merchantData={merchantData}
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "products" && (
            <MobileProducts
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "stock" && (
            <MobileStock
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "customers" && (
            <MobileCustomers
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "udhaar" && (
            <MobileUdhaar
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "orders" && (
            <MobileOrders
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "reports" && (
            <MobileReports
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "expenses" && (
            <MobileExpenses
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "settings" && (
            <MobileSettings
              merchantData={merchantData}
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
              onLogout={handleLogout}
            />
          )}

          {currentView === "help" && (
            <MobileHelp
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "whats-new" && (
            <MobileWhatsNew
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
            />
          )}

          {currentView === "upgrade" && (
            <MobileUpgrade
              onBack={() => goToView("dashboard", -1)}
            />
          )}

          {currentView === "profile" && (
            <MobileProfile
              merchantData={merchantData}
              onBack={() => goToView("dashboard", -1)}
              onTabChange={handleTabChange}
              onLogout={handleLogout}
              onUpgrade={() => goToView("upgrade")}
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
