import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  soundEffects: true,
  setSoundEffects: () => {},
  highContrast: false,
  setHighContrast: () => {},
  playAudioChime: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("dukaan_theme") || "light";
    } catch {
      return "light";
    }
  });

  const [soundEffects, setSoundEffectsState] = useState(() => {
    try {
      return localStorage.getItem("dukaan_sound_fx") !== "false";
    } catch {
      return true;
    }
  });

  const [highContrast, setHighContrastState] = useState(() => {
    try {
      return localStorage.getItem("dukaan_high_contrast") === "true";
    } catch {
      return false;
    }
  });

  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("dukaan_theme", theme);
    } catch {}
  }, [theme, isDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    try {
      localStorage.setItem("dukaan_high_contrast", String(highContrast));
    } catch {}
  }, [highContrast]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setSoundEffects = (val) => {
    setSoundEffectsState(val);
    try {
      localStorage.setItem("dukaan_sound_fx", String(val));
    } catch {}
  };

  const setHighContrast = (val) => {
    setHighContrastState(val);
  };

  // Tactile audio feedback for POS clicks, scans, and checkout
  const playAudioChime = (type = "beep") => {
    if (!soundEffects || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "scan") {
        // Quick high-pitch barcode beep
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "success") {
        // Pleasant double cash register chord
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else if (type === "hold") {
        // Low tone for holding cart
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        // Standard soft tap
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark,
        soundEffects,
        setSoundEffects,
        highContrast,
        setHighContrast,
        playAudioChime,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
