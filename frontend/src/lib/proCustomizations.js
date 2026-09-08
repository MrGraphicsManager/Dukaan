/**
 * Dukaan Pro Flagship Customization Engine
 * Manages:
 * 1. Custom Billing (templates, terms, QR position, watermark)
 * 2. Custom Dashboard (widget toggles & order)
 * 3. Customize Everything (color themes & POS layout)
 * 4. Early Access Labs (AI restock predictor, multi-lingual soundbox, turbo shortcuts)
 * 5. 24/7 Dedicated Priority Support
 */

export const PRO_INVOICE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard Retail Slip",
    description: "Clean modern receipt format with GST breakdown and QR code at bottom.",
    previewWidth: "80mm"
  },
  {
    id: "thermal_compact",
    name: "Thermal Paper Saver",
    description: "Compact 58mm / 80mm high-density thermal layout designed for thermal POS rolls.",
    previewWidth: "58mm"
  },
  {
    id: "gst_tax",
    name: "Full GST Tax Invoice",
    description: "Comprehensive B2B/B2C format with HSN/SAC table, CGST/SGST/IGST split & buyer GSTIN.",
    previewWidth: "A4"
  },
  {
    id: "modern_a4",
    name: "Modern Enterprise A4",
    description: "Elegant full-page billing format with shop seal, watermark, and itemized ledger.",
    previewWidth: "A4"
  }
];

export const PRO_THEMES = [
  {
    id: "terracotta",
    name: "Mitti Terracotta",
    description: "Classic warm Indian clay aesthetic (Default)",
    primary: "#D4623B",
    secondary: "#1B1464",
    bgClass: "bg-[#FAF6F0]",
    borderClass: "border-[#EBE3D5]",
    accentBadge: "bg-[#D4623B] text-white"
  },
  {
    id: "purple",
    name: "Dukaan Pro Purple",
    description: "Signature royal purple and slate theme",
    primary: "#7C3AED",
    secondary: "#1E1B4B",
    bgClass: "bg-purple-50/40",
    borderClass: "border-purple-200",
    accentBadge: "bg-purple-700 text-white"
  },
  {
    id: "indigo",
    name: "Royal Indigo",
    description: "Professional deep corporate blue",
    primary: "#1B1464",
    secondary: "#312E81",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
    accentBadge: "bg-[#1B1464] text-white"
  },
  {
    id: "emerald",
    name: "Fresh Emerald",
    description: "Organic & fresh kirana store green",
    primary: "#059669",
    secondary: "#064E3B",
    bgClass: "bg-emerald-50/30",
    borderClass: "border-emerald-200",
    accentBadge: "bg-emerald-700 text-white"
  },
  {
    id: "midnight",
    name: "Midnight Counter",
    description: "High-contrast dark mode for low-light billing counters",
    primary: "#F59E0B",
    secondary: "#0F172A",
    bgClass: "bg-slate-900 text-slate-100",
    borderClass: "border-slate-800",
    accentBadge: "bg-amber-500 text-slate-950"
  }
];

export const DEFAULT_PRO_BILLING = {
  template: "standard",
  header_title: "",
  tagline: "Apki Apni Dukaan",
  terms_and_conditions: "1. Goods once sold cannot be returned without original cash receipt.\n2. Brand warranty handled directly by official authorized service centers.",
  show_upi_qr: true,
  qr_position: "bottom", // "top" or "bottom"
  show_customer_balance: true,
  show_barcode: true,
  watermark_text: "",
  custom_footer_note: "Thank you for shopping with us! Visit again soon."
};

export const DEFAULT_PRO_DASHBOARD = {
  sales_kpi: true,
  profit_estimate: true,
  udhaar_summary: true,
  low_stock_alerts: true,
  hourly_sales_chart: true,
  quick_actions: true
};

export const DEFAULT_PRO_THEME = {
  theme_id: "terracotta",
  pos_view: "grid", // "grid" | "table" | "compact"
  soundbox_chime_accent: "hindi", // "hindi" | "gujarati" | "marathi" | "tamil" | "english"
  counter_font_size: "normal" // "normal" | "large"
};

export const DEFAULT_PRO_LABS = {
  ai_restock_predictor: true,
  multilingual_soundbox: true,
  turbo_shortcuts: true
};

/* =========================================================
   GETTERS & SETTERS (LocalStorage + Shop Persistence)
========================================================= */

export function getProBillingSettings(shopId = "default", fallbackShop = null) {
  try {
    const raw = localStorage.getItem(`dukaan_pro_billing_${shopId}`);
    if (raw) {
      return { ...DEFAULT_PRO_BILLING, ...JSON.parse(raw) };
    }
    if (fallbackShop?.invoice_settings) {
      return { ...DEFAULT_PRO_BILLING, ...fallbackShop.invoice_settings };
    }
    const rawShops = localStorage.getItem("dukaan_shops");
    if (rawShops) {
      const parsed = JSON.parse(rawShops);
      const found = parsed.find(s => s.id === shopId || s._id === shopId);
      if (found?.invoice_settings) {
        return { ...DEFAULT_PRO_BILLING, ...found.invoice_settings };
      }
    }
    return { ...DEFAULT_PRO_BILLING };
  } catch {
    return { ...DEFAULT_PRO_BILLING };
  }
}

export function saveProBillingSettings(shopId = "default", settings) {
  try {
    const merged = { ...DEFAULT_PRO_BILLING, ...settings };
    localStorage.setItem(`dukaan_pro_billing_${shopId}`, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Failed to save pro billing settings", e);
    return settings;
  }
}

export function getProDashboardWidgets(userEmail = "default") {
  try {
    const raw = localStorage.getItem(`dukaan_pro_dashboard_${userEmail}`);
    return raw ? { ...DEFAULT_PRO_DASHBOARD, ...JSON.parse(raw) } : { ...DEFAULT_PRO_DASHBOARD };
  } catch {
    return { ...DEFAULT_PRO_DASHBOARD };
  }
}

export function saveProDashboardWidgets(userEmail = "default", widgets) {
  try {
    const merged = { ...DEFAULT_PRO_DASHBOARD, ...widgets };
    localStorage.setItem(`dukaan_pro_dashboard_${userEmail}`, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Failed to save pro dashboard widgets", e);
    return widgets;
  }
}

export function getProThemeSettings(userEmail = "default") {
  try {
    const raw = localStorage.getItem(`dukaan_pro_theme_${userEmail}`);
    return raw ? { ...DEFAULT_PRO_THEME, ...JSON.parse(raw) } : { ...DEFAULT_PRO_THEME };
  } catch {
    return { ...DEFAULT_PRO_THEME };
  }
}

export function saveProThemeSettings(userEmail = "default", themeSettings) {
  try {
    const merged = { ...DEFAULT_PRO_THEME, ...themeSettings };
    localStorage.setItem(`dukaan_pro_theme_${userEmail}`, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Failed to save pro theme settings", e);
    return themeSettings;
  }
}

export function getProLabsSettings(userEmail = "default") {
  try {
    const raw = localStorage.getItem(`dukaan_pro_labs_${userEmail}`);
    return raw ? { ...DEFAULT_PRO_LABS, ...JSON.parse(raw) } : { ...DEFAULT_PRO_LABS };
  } catch {
    return { ...DEFAULT_PRO_LABS };
  }
}

export function saveProLabsSettings(userEmail = "default", labsSettings) {
  try {
    const merged = { ...DEFAULT_PRO_LABS, ...labsSettings };
    localStorage.setItem(`dukaan_pro_labs_${userEmail}`, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Failed to save pro labs settings", e);
    return labsSettings;
  }
}

/**
 * 24/7 Dedicated Priority Support Link Generator
 */
export function getProWhatsAppSupportUrl(user, shop) {
  const shopName = shop?.name || "My Dukaan";
  const userEmail = user?.email || "merchant@dukaan.in";
  const phone = "919825100000"; // Official Dukaan Priority Hotline
  const text = encodeURIComponent(
    `Hello Dukaan Pro Support Team! 🌟\n\nI am reaching out from my Dukaan Pro account.\n- Shop Name: ${shopName}\n- Registered Email: ${userEmail}\n- Plan: Dukaan Pro\n\nI need priority assistance with: `
  );
  return `https://wa.me/${phone}?text=${text}`;
}
