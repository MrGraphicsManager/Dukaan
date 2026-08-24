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

import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Info from "./pages/Info.jsx";

/* =========================================================
   DUKAAN OFFICIAL LAUNCH
   27 AUGUST 2026 — 1:00 PM IST
========================================================= */

const LAUNCH_TIME = new Date(
  "2026-08-24T22:25:00+05:30"
).getTime();

/* =========================================================
   LAUNCH COUNTDOWN PAGE
========================================================= */

function LaunchLock() {
  const getTimeLeft = () =>
    Math.max(0, LAUNCH_TIME - Date.now());

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
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
    <div
      className="min-h-screen bg-brand-sand text-brand-indigo noise"
      style={{
        fontFamily:
          "var(--font-body, Arial, Helvetica, sans-serif)",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-brand-mitti bg-brand-sand/95">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">

          <Link
            to="/"
            className="font-display text-2xl md:text-3xl"
          >
            दुकान · Dukaan
          </Link>

          <Link
            to="/login"
            className="text-sm font-medium text-brand-indigo hover:text-brand-terracotta transition-colors"
          >
            Admin Login
          </Link>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-5">

        <section className="min-h-[calc(100vh-64px)] flex items-center justify-center py-16">

          <div className="w-full max-w-5xl text-center">

            {/* Label */}

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-mitti bg-white/60 text-xs font-semibold uppercase tracking-widest text-brand-terracotta">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
              Launching Soon
            </div>


            {/* Heading */}

            <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight">

              The dukaan is
              <br />

              <span className="text-brand-terracotta">
                almost open.
              </span>

            </h1>


            {/* Description */}

            <p className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-brand-indigo/75 leading-relaxed">

              Dukaan is getting the shelves ready for you.
              Billing, stock and udhaar — built for Indian
              small shops — arrive on

              <strong className="text-brand-indigo">
                {" "}27 August 2026 at 1:00 PM IST.
              </strong>

            </p>


            {/* =================================================
                COUNTDOWN
            ================================================= */}

            <div className="mt-12 grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">

              {/* DAYS */}

              <div className="bg-white rounded-xl border border-brand-mitti p-4 sm:p-6 shadow-card">

                <div className="font-display text-3xl sm:text-5xl md:text-6xl">
                  {format(days)}
                </div>

                <div className="mt-2 text-[9px] sm:text-xs uppercase tracking-widest text-brand-indigo/55 font-semibold">
                  Days
                </div>

              </div>


              {/* HOURS */}

              <div className="bg-white rounded-xl border border-brand-mitti p-4 sm:p-6 shadow-card">

                <div className="font-display text-3xl sm:text-5xl md:text-6xl">
                  {format(hours)}
                </div>

                <div className="mt-2 text-[9px] sm:text-xs uppercase tracking-widest text-brand-indigo/55 font-semibold">
                  Hours
                </div>

              </div>


              {/* MINUTES */}

              <div className="bg-white rounded-xl border border-brand-mitti p-4 sm:p-6 shadow-card">

                <div className="font-display text-3xl sm:text-5xl md:text-6xl">
                  {format(minutes)}
                </div>

                <div className="mt-2 text-[9px] sm:text-xs uppercase tracking-widest text-brand-indigo/55 font-semibold">
                  Minutes
                </div>

              </div>


              {/* SECONDS */}

              <div className="bg-white rounded-xl border border-brand-mitti p-4 sm:p-6 shadow-card">

                <div className="font-display text-3xl sm:text-5xl md:text-6xl">
                  {format(seconds)}
                </div>

                <div className="mt-2 text-[9px] sm:text-xs uppercase tracking-widest text-brand-indigo/55 font-semibold">
                  Seconds
                </div>

              </div>

            </div>


            {/* Launch date */}

            <div className="mt-8 text-xs md:text-sm uppercase tracking-widest text-brand-terracotta font-semibold">
              27 · 08 · 2026&nbsp;&nbsp; | &nbsp;&nbsp;01:00 PM IST
            </div>


            {/* =================================================
                FEATURE CARDS
            ================================================= */}

            <div className="mt-14 grid md:grid-cols-3 gap-4 text-left">

              <div className="bg-white rounded-xl border border-brand-mitti p-5 shadow-card">

                <div className="w-10 h-10 rounded-lg bg-brand-indigo text-white grid place-items-center font-bold">
                  ₹
                </div>

                <div className="mt-4 font-heading text-lg font-bold">
                  Billing
                </div>

                <p className="mt-1 text-sm text-brand-indigo/70">
                  Fast billing with Cash, UPI and Udhaar.
                </p>

              </div>


              <div className="bg-white rounded-xl border border-brand-mitti p-5 shadow-card">

                <div className="w-10 h-10 rounded-lg bg-brand-indigo text-white grid place-items-center font-bold">
                  ▣
                </div>

                <div className="mt-4 font-heading text-lg font-bold">
                  Inventory
                </div>

                <p className="mt-1 text-sm text-brand-indigo/70">
                  Track products, stock and low-stock alerts.
                </p>

              </div>


              <div className="bg-white rounded-xl border border-brand-mitti p-5 shadow-card">

                <div className="w-10 h-10 rounded-lg bg-brand-indigo text-white grid place-items-center font-bold">
                  ₹
                </div>

                <div className="mt-4 font-heading text-lg font-bold">
                  Udhaar
                </div>

                <p className="mt-1 text-sm text-brand-indigo/70">
                  Track pending payments and reminders.
                </p>

              </div>

            </div>


            {/* Footer message */}

            <p className="mt-10 text-sm text-brand-indigo/55">
              Made for Indian small businesses.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   PROTECTED ROUTES
========================================================= */

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
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* =========================================================
   LAUNCH ROUTE CONTROLLER
========================================================= */

function LaunchController() {
  const location = useLocation();

  const [launched, setLaunched] = useState(
    Date.now() >= LAUNCH_TIME
  );

  useEffect(() => {
    const checkLaunch = () => {
      setLaunched(
        Date.now() >= LAUNCH_TIME
      );
    };

    checkLaunch();

    const timer = setInterval(
      checkLaunch,
      1000
    );

    return () => {
      clearInterval(timer);
    };
  }, []);


  /* =======================================================
     ADMIN ACCESS BEFORE LAUNCH
  ======================================================= */

  const adminPaths = [
    "/login",
    "/app/admin",
  ];

  const isAdminPath = adminPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
  );


  /* =======================================================
     BEFORE LAUNCH

     ONLY:
     - Admin Login
     - Admin page

     Everything else = countdown
  ======================================================= */

  if (!launched && !isAdminPath) {
    return <LaunchLock />;
  }


  /* =======================================================
     AFTER LAUNCH / ADMIN
  ======================================================= */

  return (
    <Routes>

      {/* ===================================================
          PUBLIC PAGES
      =================================================== */}

      <Route
        path="/"
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
          AUTH
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