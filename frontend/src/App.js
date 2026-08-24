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

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null) return <div className="flex items-center justify-center min-h-screen text-brand-indigo/60">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route element={<Protected><AppLayout /></Protected>}>
            <Route path="/app" element={<SubGate><Dashboard /></SubGate>} />
            <Route path="/app/pos" element={<SubGate><POS /></SubGate>} />
            <Route path="/app/products" element={<SubGate><Products /></SubGate>} />
            <Route path="/app/stock" element={<SubGate><Stock /></SubGate>} />
            <Route path="/app/customers" element={<SubGate><Customers /></SubGate>} />
            <Route path="/app/customers/:id" element={<SubGate><CustomerDetail /></SubGate>} />
            <Route path="/app/udhaar" element={<SubGate><Udhaar /></SubGate>} />
            <Route path="/app/orders" element={<SubGate><Orders /></SubGate>} />
            <Route path="/app/orders/:id" element={<SubGate><OrderDetail /></SubGate>} />
            <Route path="/app/reports" element={<SubGate><Reports /></SubGate>} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="/app/billing" element={<Billing />} />
            <Route path="/app/admin" element={<AdminSubscriptions />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
