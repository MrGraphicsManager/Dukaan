import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial params
  const paramView = searchParams.get("view");
  const paramStep = parseInt(searchParams.get("step") || "1", 10);

  // View state: 'onboarding' | 'login' | 'forgot-password' | 'otp' | 'reset-password' | 'reset-success' | 'dashboard' | core screens
  const [currentView, setCurrentView] = useState(() => {
    if (paramView) return paramView;
    if (paramStep === 8) return "dashboard";
    return "onboarding";
  });

  const [onboardingStep, setOnboardingStep] = useState(
    paramStep >= 1 && paramStep <= 7 ? paramStep : 1
  );

  const [direction, setDirection] = useState(1);
  const [registeredPhone, setRegisteredPhone] = useState("9876543210");

  // Merchant state
  const [merchantData, setMerchantData] = useState({
    selectedLang: "en",
    fullName: "Priyen Naik",
    phone: "9876543210",
    email: "priyen@dukaan.app",
    password: "",
    businessName: "ABC General Store",
    businessType: "Grocery Store",
    category: "Retail",
    address: "Navsari, Gujarat",
    logoUrl: null,
    plan: "free",
  });

  const updateFormData = (patch) => {
    setMerchantData((prev) => ({ ...prev, ...patch }));
  };

  // Sync state if URL query params change
  useEffect(() => {
    if (paramView) {
      setCurrentView(paramView);
    } else if (paramStep) {
      if (paramStep === 8) {
        setCurrentView("dashboard");
      } else {
        setCurrentView("onboarding");
        setOnboardingStep(paramStep);
      }
    }
  }, [paramView, paramStep]);

  const goToView = (viewName, dir = 1) => {
    setDirection(dir);
    setCurrentView(viewName);
  };

  const goToOnboardingStep = (stepNumber) => {
    setDirection(stepNumber > onboardingStep ? 1 : -1);
    setOnboardingStep(stepNumber);
    setCurrentView("onboarding");
  };

  // Bottom dock tab router
  const handleTabChange = (tabId) => {
    if (tabId === "home") goToView("dashboard");
    else if (tabId === "billing") goToView("new-bill");
    else if (tabId === "products") goToView("products");
    else if (tabId === "customers") goToView("customers");
    else if (tabId === "more") goToView("settings");
  };

  return (
    <div className="mobile-shell min-h-screen bg-white overflow-x-hidden relative select-none">
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
              onLogout={() => goToView("login")}
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
              onLogout={() => goToView("login")}
              onUpgrade={() => goToView("upgrade")}
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
