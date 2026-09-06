import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

import Screen1Welcome from "./Screen1Welcome";
import Screen2Language from "./Screen2Language";
import Screen3CreateAccount from "./Screen3CreateAccount";
import Screen4BusinessDetails from "./Screen4BusinessDetails";
import Screen5AddLogo from "./Screen5AddLogo";
import Screen6SelectPlan from "./Screen6SelectPlan";
import Screen7Success from "./Screen7Success";
import Screen8Dashboard from "./Screen8Dashboard";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

export default function MobileFlow() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(initialStep >= 1 && initialStep <= 8 ? initialStep : 1);
  const [direction, setDirection] = useState(1);

  // Unified Form State across all 8 screens
  const [formData, setFormData] = useState({
    selectedLang: "en",
    fullName: "Priyen Naik",
    phone: "",
    email: "",
    password: "",
    businessName: "ABC General Store",
    businessType: "Grocery Store",
    category: "Retail",
    address: "Navsari, Gujarat",
    logoUrl: null,
    plan: "free",
  });

  const updateFormData = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const goToStep = (targetStep) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const next = () => goToStep(step + 1);
  const back = () => goToStep(Math.max(1, step - 1));

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {step === 1 && (
            <Screen1Welcome
              onNext={next}
              onSkip={() => goToStep(2)}
              onLogin={() => nav("/login")}
            />
          )}

          {step === 2 && (
            <Screen2Language
              selectedLang={formData.selectedLang}
              onSelectLang={(code) => updateFormData({ selectedLang: code })}
              onNext={next}
              onBack={back}
            />
          )}

          {step === 3 && (
            <Screen3CreateAccount
              formData={formData}
              updateFormData={updateFormData}
              onNext={next}
              onBack={back}
              onLogin={() => nav("/login")}
            />
          )}

          {step === 4 && (
            <Screen4BusinessDetails
              formData={formData}
              updateFormData={updateFormData}
              onNext={next}
              onBack={back}
            />
          )}

          {step === 5 && (
            <Screen5AddLogo
              formData={formData}
              updateFormData={updateFormData}
              onNext={next}
              onBack={back}
              onSkip={next}
            />
          )}

          {step === 6 && (
            <Screen6SelectPlan
              selectedPlan={formData.plan}
              onSelectPlan={(p) => updateFormData({ plan: p })}
              onNext={next}
              onBack={back}
              onSkip={next}
            />
          )}

          {step === 7 && (
            <Screen7Success
              onNext={next}
            />
          )}

          {step === 8 && (
            <Screen8Dashboard
              merchantData={formData}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
