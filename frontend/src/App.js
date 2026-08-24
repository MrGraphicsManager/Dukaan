import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Info from "./pages/Info.jsx";


/* ================================
   DUKAAN LAUNCH COUNTDOWN
   Launch: 27 August 2026
   Time: 1:00 PM IST
================================ */

function LaunchLock() {
  const launchTime = new Date(
    "2026-08-27T13:00:00+05:30"
  ).getTime();

  const calculateTimeLeft = () =>
    Math.max(0, launchTime - Date.now());

  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft <= 0) {
    return null;
  }

  const days = Math.floor(
    timeLeft / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (timeLeft / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (timeLeft / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (timeLeft / 1000) % 60
  );

  const format = (value) =>
    String(value).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#1E1B4B] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl text-center">

        {/* Brand */}
        <div className="text-2xl md:text-3xl font-bold mb-12">
          दुकान{" "}
          <span className="text-[#C9713F]">
            Dukaan
          </span>
        </div>

        {/* Lock */}
        <div className="text-4xl mb-6">
          🔒
        </div>

        {/* Label */}
        <div className="font-sans text-xs font-bold tracking-[0.2em] text-[#C9713F] mb-4">
          LAUNCH COUNTDOWN
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6">
          Dukaan is getting ready.
        </h1>

        {/* Description */}
        <p className="font-sans text-[#3A3660] text-sm md:text-base leading-7 mb-10">
          We're preparing everything for launch.
          <br />
          Dukaan officially launches on{" "}
          <strong>
            27 August 2026 at 1:00 PM IST.
          </strong>
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto mb-10">

          <div className="bg-white border border-[#E4DCC9] rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold">
              {format(days)}
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] tracking-widest text-[#5A5670] mt-2">
              DAYS
            </div>
          </div>

          <div className="bg-white border border-[#E4DCC9] rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold">
              {format(hours)}
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] tracking-widest text-[#5A5670] mt-2">
              HOURS
            </div>
          </div>

          <div className="bg-white border border-[#E4DCC9] rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold">
              {format(minutes)}
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] tracking-widest text-[#5A5670] mt-2">
              MINUTES
            </div>
          </div>

          <div className="bg-white border border-[#E4DCC9] rounded-xl p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold">
              {format(seconds)}
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] tracking-widest text-[#5A5670] mt-2">
              SECONDS
            </div>
          </div>

        </div>

        {/* Launch date */}
        <div className="font-sans text-xs tracking-widest text-[#C9713F]">
          27 · 08 · 2026&nbsp;&nbsp; | &nbsp;&nbsp;01:00 PM IST
        </div>

        <div className="mt-10 font-sans text-xs text-[#5A5670]">
          Made for Indian small businesses.
        </div>

      </div>
    </div>
  );
}


/* ================================
   PROTECTED ROUTES
================================ */

function Protected({ children }) {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-brand-indigo/60">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* ================================
   MAIN APP
================================ */

function App() {
  const launchTime = new Date(
    "2026-08-27T13:00:00+05:30"
  ).getTime();

  const [locked, setLocked] = useState(
    Date.now() < launchTime
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLocked(Date.now() < launchTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================================
     BEFORE LAUNCH
     EVERYTHING IS LOCKED
  ================================ */

  if (locked) {
    return <LaunchLock />;
  }

  /* ================================
     AFTER LAUNCH
     NORMAL WEBSITE
  ================================ */

  return (
    <AuthProvider>
      <BrowserRouter>

        <Toaster
          position="top-center"
          richColors
        />

        <Routes>

          {/* Public pages */}
          <Route
            path="/info"
            element={<Info />}
          />

          <Route
            path="/refund-policy"
            element={<RefundPolicy />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/"
            element={<Landing />}
          />

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

          {/* Protected application */}
          <Route
            element={
              <Protected>
                <AppLayout />
              </Protected>
            }
          >

            <Route
              path="/app"
              element={
                <SubGate>
                  <Dashboard />
                </SubGate>
              }
            />

            <Route
              path="/app/pos"
              element={
                <SubGate>
                  <POS />
                </SubGate>
              }
            />

            <Route
              path="/app/products"
              element={
                <SubGate>
                  <Products />
                </SubGate>
              }
            />

            <Route
              path="/app/stock"
              element={
                <SubGate>
                  <Stock />
                </SubGate>
              }
            />

            <Route
              path="/app/customers"
              element={
                <SubGate>
                  <Customers />
                </SubGate>
              }
            />

            <Route
              path="/app/customers/:id"
              element={
                <SubGate>
                  <CustomerDetail />
                </SubGate>
              }
            />

            <Route
              path="/app/udhaar"
              element={
                <SubGate>
                  <Udhaar />
                </SubGate>
              }
            />

            <Route
              path="/app/orders"
              element={
                <SubGate>
                  <Orders />
                </SubGate>
              }
            />

            <Route
              path="/app/orders/:id"
              element={
                <SubGate>
                  <OrderDetail />
                </SubGate>
              }
            />

            <Route
              path="/app/reports"
              element={
                <SubGate>
                  <Reports />
                </SubGate>
              }
            />

            <Route
              path="/app/settings"
              element={<Settings />}
            />

            <Route
              path="/app/billing"
              element={<Billing />}
            />

            <Route
              path="/app/admin"
              element={<AdminSubscriptions />}
            />

          </Route>

          {/* Unknown URL */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;