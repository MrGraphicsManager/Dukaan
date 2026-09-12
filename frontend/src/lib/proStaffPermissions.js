/**
 * Dukaan Pro Cashier & Staff Permissions Engine
 * Features:
 * 1. Owner Security PIN management (Default: "1234")
 * 2. Cashier Mode Session State & Switching
 * 3. Permission Flags (Hide purchase price, block deletion, lock reports)
 * 4. Shift Handover & Drawer Cash Reconciliation
 */

export { getProThemeSettings } from "./proCustomizations";

export const DEFAULT_STAFF_SETTINGS = {
  enabled: true,
  owner_pin: "1234",
  cashier_name: "Staff Cashier",
  cashier_phone: "",
  hide_purchase_price: true,
  block_bill_deletion: true,
  block_product_deletion: true,
  restrict_reports_export: true,
  pos_only_mode: false,
  max_discount_allowed: 15 // in percentage
};

/**
 * Get Pro Staff & Permission Settings with cloud shop fallback
 */
export function getProStaffSettings(shopId = "default", fallbackShop = null) {
  try {
    const raw = localStorage.getItem(`dukaan_pro_staff_${shopId}`);
    if (raw) {
      return { ...DEFAULT_STAFF_SETTINGS, ...JSON.parse(raw) };
    }
    if (fallbackShop?.pro_settings?.staff) {
      return { ...DEFAULT_STAFF_SETTINGS, ...fallbackShop.pro_settings.staff };
    }
    const rawShops = localStorage.getItem("dukaan_shops");
    if (rawShops) {
      const parsed = JSON.parse(rawShops);
      const found = parsed.find(s => s.id === shopId || s._id === shopId);
      if (found?.pro_settings?.staff) {
        return { ...DEFAULT_STAFF_SETTINGS, ...found.pro_settings.staff };
      }
    }
    return { ...DEFAULT_STAFF_SETTINGS };
  } catch {
    return { ...DEFAULT_STAFF_SETTINGS };
  }
}

/**
 * Save Pro Staff & Permission Settings
 */
export function saveProStaffSettings(shopId = "default", settings) {
  try {
    const merged = { ...DEFAULT_STAFF_SETTINGS, ...settings };
    localStorage.setItem(`dukaan_pro_staff_${shopId}`, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("dukaan_staff_settings_changed", { detail: merged }));
    return merged;
  } catch (e) {
    console.error("Failed to save pro staff settings", e);
    return settings;
  }
}

/**
 * Verify Owner PIN
 */
export function verifyOwnerPin(shopId = "default", enteredPin = "") {
  const settings = getProStaffSettings(shopId);
  const correctPin = String(settings.owner_pin || "1234").trim();
  return String(enteredPin).trim() === correctPin;
}

/**
 * Cashier Mode State Check
 */
export function isCashierModeActive() {
  try {
    return localStorage.getItem("dukaan_cashier_mode_active") === "true";
  } catch {
    return false;
  }
}

/**
 * Get Active Cashier Name
 */
export function getActiveCashierName(shopId = "default") {
  try {
    const stored = localStorage.getItem("dukaan_active_cashier_name");
    if (stored) return stored;
    const settings = getProStaffSettings(shopId);
    return settings.cashier_name || "Staff Cashier";
  } catch {
    return "Staff Cashier";
  }
}

/**
 * Toggle Cashier Mode
 */
export function setCashierModeActive(active = false, cashierName = "Staff Cashier", openingCash = 0) {
  try {
    if (active) {
      localStorage.setItem("dukaan_cashier_mode_active", "true");
      localStorage.setItem("dukaan_active_cashier_name", cashierName);
      
      // Initialize current shift if none active
      const currentShift = getCurrentShift();
      if (!currentShift) {
        startNewShift(cashierName, openingCash);
      }
    } else {
      localStorage.setItem("dukaan_cashier_mode_active", "false");
    }
    window.dispatchEvent(new CustomEvent("dukaan_cashier_mode_changed", { 
      detail: { active, cashierName } 
    }));
  } catch (e) {
    console.error("Failed to set cashier mode", e);
  }
}

/**
 * Current Shift Management
 */
export function getCurrentShift() {
  try {
    const raw = localStorage.getItem("dukaan_current_shift");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function startNewShift(cashierName = "Staff Cashier", openingCash = 0) {
  const newShift = {
    id: `shift_${Date.now()}`,
    cashier_name: cashierName,
    started_at: new Date().toISOString(),
    opening_cash: Number(openingCash) || 0,
    status: "active"
  };
  try {
    localStorage.setItem("dukaan_current_shift", JSON.stringify(newShift));
    window.dispatchEvent(new CustomEvent("dukaan_shift_updated", { detail: newShift }));
  } catch (_) {}
  return newShift;
}

export function endCurrentShift(shopId = "default", handoverData = {}) {
  try {
    const currentShift = getCurrentShift();
    const completedShift = {
      ...(currentShift || {}),
      id: currentShift?.id || `shift_${Date.now()}`,
      ended_at: new Date().toISOString(),
      status: "completed",
      ...handoverData
    };

    // Save to historical shift logs
    const history = getShiftRecords(shopId);
    const updatedHistory = [completedShift, ...history].slice(0, 50); // keep last 50
    localStorage.setItem(`dukaan_shift_history_${shopId}`, JSON.stringify(updatedHistory));

    // Clear active shift
    localStorage.removeItem("dukaan_current_shift");
    setCashierModeActive(false);

    window.dispatchEvent(new CustomEvent("dukaan_shift_ended", { detail: completedShift }));
    return completedShift;
  } catch (e) {
    console.error("Failed to end current shift", e);
    return null;
  }
}

export function getShiftRecords(shopId = "default") {
  try {
    const raw = localStorage.getItem(`dukaan_shift_history_${shopId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
