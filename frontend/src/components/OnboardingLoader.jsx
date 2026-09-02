import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, LayoutDashboard, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  { text: "Setting up your Dukaan...", icon: Store, duration: 1200 },
  { text: "Preparing your dashboard...", icon: LayoutDashboard, duration: 1200 },
  { text: "Loading your business...", icon: BarChart3, duration: 1200 },
  { text: "Almost ready...", icon: Sparkles, duration: 900 },
  { text: "Welcome to Dukaan!", icon: CheckCircle2, duration: 500 },
];

const TOTAL_DURATION = steps.reduce((acc, step) => acc + step.duration, 0);

const OnboardingLoader = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentDuration = 0;
    const stepTimeouts = [];

    steps.forEach((step, index) => {
      if (index === 0) return; // First step is immediate
      currentDuration += steps[index - 1].duration;
      const timeout = setTimeout(() => {
        setCurrentStep(index);
      }, currentDuration);
      stepTimeouts.push(timeout);
    });

    const finishTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, TOTAL_DURATION);

    return () => {
      stepTimeouts.forEach(clearTimeout);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame;

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / TOTAL_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsedTime < TOTAL_DURATION) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-sand noise min-h-screen">
      
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-12 flex items-center justify-center"
      >
        <span className="font-display text-4xl text-brand-indigo tracking-tight">दुकान</span>
      </motion.div>

      <div className="w-full max-w-sm px-6 flex flex-col items-center">
        {/* Step Indicator */}
        <div className="h-32 flex flex-col items-center justify-center relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center absolute"
            >
              <div className="bg-brand-mitti/30 p-4 rounded-2xl mb-4 text-brand-indigo">
                <CurrentIcon size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-heading text-brand-indigo">
                {steps[currentStep].text}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-10">
          <div className="h-[3px] w-full bg-brand-mitti rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-terracotta rounded-full"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLoader;
