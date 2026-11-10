import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { Spinner } from "./components/ui.jsx";
import FormPage from "./pages/FormPage.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import StaffRegister from "./pages/admin/StaffRegister.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Submissions from "./pages/admin/Submissions.jsx";
import SubmissionDetail from "./pages/admin/SubmissionDetail.jsx";
import Settings from "./pages/admin/Settings.jsx";
import StaffManagement from "./pages/admin/StaffManagement.jsx";
import StaffSubmissions from "./pages/admin/StaffSubmissions.jsx";
import { Link } from "react-router-dom";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return null;
}

/* -------------------------------------------------------------------------- */
/* Role-based route guards                                                    */
/* -------------------------------------------------------------------------- */

function AuthRoute({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="login-loading">
        <Spinner size={28} />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AdminOnlyRoute({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="login-loading">
        <Spinner size={28} />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (!admin || admin.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function StaffOnlyRoute({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="login-loading">
        <Spinner size={28} />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (!admin || admin.role !== "staff") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="login-loading">
        <Spinner size={28} />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (admin) {
    const destination = admin.role === "staff" ? "/staff" : "/admin";
    return <Navigate to={destination} replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <div className="not-found-actions">
        <Link to="/admin/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public profiling form - requires any authenticated user */}
            <Route
              path="/"
              element={
                <AuthRoute>
                  <FormPage />
                </AuthRoute>
              }
            />

            {/* Guest-only: login and registration */}
            <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
            <Route path="/auth/register" element={<GuestRoute><StaffRegister /></GuestRoute>} />

            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <AdminOnlyRoute>
                  <AdminLayout />
                </AdminOnlyRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="staff" element={<StaffManagement />} />
            </Route>

            {/* Submission detail - accessible by both admin and staff (backend enforces ownership) */}
            <Route
              path="/submissions/:id"
              element={
                <AuthRoute>
                  <SubmissionDetail />
                </AuthRoute>
              }
            />

            {/* Staff-only routes */}
            <Route
              path="/staff"
              element={
                <StaffOnlyRoute>
                  <AdminLayout />
                </StaffOnlyRoute>
              }
            >
              <Route index element={<StaffSubmissions />} />
              <Route path="submissions" element={<StaffSubmissions />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
