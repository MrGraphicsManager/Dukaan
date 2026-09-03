import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";

import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AppLayout from "@/components/AppLayout";
import SubGate from "@/components/SubGate";

import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Stock from "@/pages/Stock";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Udhaar from "@/pages/Udhaar";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Billing from "@/pages/Billing";
import AdminSubscriptions from "@/pages/AdminSubscriptions";
import CounterMode from "@/pages/CounterMode";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Info from "./pages/Info.jsx";

/* =========================================================
   PROTECTED ROUTES
========================================================= */

function Protected({ children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }

  return children;
}


/* =========================================================
   LAUNCH ROUTE CONTROLLER
========================================================= */

export const isStandaloneApp = () => {
  if (typeof window === "undefined") return false;
  // Electron desktop app
  if (window.navigator?.userAgent?.includes("DukaanDesktop") || window.isElectron) return true;
  // Capacitor / Cordova / Native Android
  if (window.Capacitor?.isNativePlatform() || window.AndroidBridge) return true;
  // PWA Standalone Mode
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.navigator?.standalone) return true;
  // App mode flag in URL or localStorage
  if (window.location?.search?.includes("app_mode=1")) {
    try { localStorage.setItem("dukaan_app_mode", "1"); } catch {}
    return true;
  }
  try {
    if (localStorage.getItem("dukaan_app_mode") === "1") return true;
  } catch {}
  return false;
};

function LaunchController() {
  const location = useLocation();
  const isApp = isStandaloneApp();

  return (
    <Routes>

      {/* ===================================================
          PUBLIC PAGES / APP ROOT
      =================================================== */}

      <Route
        path="/"
        element={isApp ? <Navigate to="/app" replace /> : <Landing />}
      />

      <Route
        path="/landing"
        element={<Landing />}
      />

      <Route
        path="/info"
        element={<Info />}
      />

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      <Route
        path="/refund-policy"
        element={<RefundPolicy />}
      />


      {/* ===================================================
          AUTH (Temporarily bypassed - redirect to /app)
      =================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/subscribe"
        element={<Subscribe />}
      />


      {/* ===================================================
          PROTECTED APP
      =================================================== */}

      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >

        {/* Dashboard */}

        <Route
          path="/app"
          element={
            <SubGate>
              <Dashboard />
            </SubGate>
          }
        />


        {/* POS */}

        <Route
          path="/app/pos"
          element={
            <SubGate>
              <POS />
            </SubGate>
          }
        />


        {/* Products */}

        <Route
          path="/app/products"
          element={
            <SubGate>
              <Products />
            </SubGate>
          }
        />


        {/* Stock */}

        <Route
          path="/app/stock"
          element={
            <SubGate>
              <Stock />
            </SubGate>
          }
        />


        {/* Customers */}

        <Route
          path="/app/customers"
          element={
            <SubGate>
              <Customers />
            </SubGate>
          }
        />


        {/* Customer Detail */}

        <Route
          path="/app/customers/:id"
          element={
            <SubGate>
              <CustomerDetail />
            </SubGate>
          }
        />


        {/* Udhaar */}

        <Route
          path="/app/udhaar"
          element={
            <SubGate>
              <Udhaar />
            </SubGate>
          }
        />


        {/* Orders */}

        <Route
          path="/app/orders"
          element={
            <SubGate>
              <Orders />
            </SubGate>
          }
        />


        {/* Order Detail */}

        <Route
          path="/app/orders/:id"
          element={
            <SubGate>
              <OrderDetail />
            </SubGate>
          }
        />


        {/* Reports */}

        <Route
          path="/app/reports"
          element={
            <SubGate>
              <Reports />
            </SubGate>
          }
        />


        {/* Settings */}

        <Route
          path="/app/settings"
          element={
            <Settings />
          }
        />


        {/* Billing */}

        <Route
          path="/app/billing"
          element={
            <Billing />
          }
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/app/admin"
          element={
            <AdminSubscriptions />
          }
        />


        {/* =================================================
            COUNTER MODE
        ================================================= */}

        <Route
          path="/app/counter"
          element={
            <CounterMode />
          }
        />

      </Route>


      {/* ===================================================
          UNKNOWN ROUTE
      =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {
  return (
    <AuthProvider>

      <BrowserRouter>

        <Toaster
          position="top-center"
          richColors
        />

        <LaunchController />

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;