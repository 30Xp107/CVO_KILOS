import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { BrandMark, Button, FormField, Spinner, TextInput } from "../../components/ui.jsx";

export default function AdminLogin() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="login-loading">
        <Spinner size={28} />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (admin) {
    return <Navigate to={admin.role === "staff" ? "/staff" : "/admin"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      const from = location.state?.from;
      const isAuthPage = from === "/admin/login" || from === "/auth/register";
      const destination = !from || isAuthPage
        ? loggedIn.role === "staff"
          ? "/staff"
          : "/admin"
        : from;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-aside">
        <BrandMark light />
        <div className="login-aside-copy">
          <p className="eyebrow">KILOS Profiling portal</p>
          <h1>Sign in to your account</h1>
          <p>
            Review beneficiary profiles, update referral status, and manage your profiling
            assignments.
          </p>
          <ul>
            <li>
              <FileSpreadsheet size={18} />
              <span>View and manage profiling responses</span>
            </li>
            <li>
              <FileText size={18} />
              <span>Generate a filled KILOS form as PDF for each beneficiary</span>
            </li>
            <li>
              <ShieldCheck size={18} />
              <span>Secure access for authorized DSWD staff only</span>
            </li>
          </ul>
        </div>
        <p className="login-aside-foot">
          Department of Social Welfare and Development · Walang Gutom Program
        </p>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <span className="login-icon">
            <LockKeyhole size={23} />
          </span>
          <h2>Sign in to your account</h2>
          <p className="login-subtitle">
            Use your DSWD email and password to sign in.
          </p>

          {error ? <div className="form-alert">{error}</div> : null}

          <form onSubmit={handleSubmit} className="login-form">
            <FormField label="Email address" htmlFor="email" required>
              <TextInput
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@dswd.gov.ph"
                required
              />
            </FormField>
            <FormField label="Password" htmlFor="password" required>
              <div className="password-field">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </FormField>
            <Button type="submit" loading={submitting} iconRight={ArrowRight} className="login-submit">
              Sign in
            </Button>
          </form>

          <div className="register-divider">or</div>

          <div className="register-link-wrapper">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="register-link-highlight"
            >
              Register as staff
            </Link>
          </div>

          <p className="login-hint">
            Access is limited to authorized personnel. All activity may be logged for security and
            audit purposes.
          </p>
        </div>
      </main>
    </div>
  );
}
