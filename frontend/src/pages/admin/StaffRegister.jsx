import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { BrandMark, Button, FormField, Spinner, TextInput, Select } from "../../components/ui.jsx";

const POSITIONS = [
  { value: "Community Engagement Coordinator", label: "Community Engagement Coordinator" },
  { value: "Field Staff", label: "Field Staff" },
];

export default function StaffRegister() {
  const { admin, loading, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const fullName = [firstName, middleInitial, lastName].filter(Boolean).join(" ");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await register(
        idNumber,
        firstName,
        middleInitial,
        lastName,
        email,
        position,
        password,
        confirmPassword
      );
      navigate(created.role === "staff" ? "/staff" : "/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-aside">
        <BrandMark light />
        <div className="login-aside-copy">
          <p className="eyebrow">Staff registration</p>
          <h1>KILOS Staff account</h1>
          <p>
            Create a staff account to manage the beneficiary profiles you handle. You will be able
            to view and update the responses assigned to you.
          </p>
          <ul>
            <li>
              <UserPlus size={18} />
              <span>Register with your ID number and official email</span>
            </li>
            <li>
              <FileText size={18} />
              <span>View the profiling responses you interviewed</span>
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
            <UserPlus size={23} />
          </span>
          <h2>Create your staff account</h2>
          <p className="login-subtitle">
            Use your official DSWD email address. Your name will be used to match the beneficiary
            profiles you handle.
          </p>

          {error ? <div className="form-alert">{error}</div> : null}

          <form onSubmit={handleSubmit} className="login-form">
            <FormField label="ID Number" htmlFor="idNumber" required>
              <TextInput
                id="idNumber"
                autoComplete="username"
                value={idNumber}
                onChange={(event) => setIdNumber(event.target.value)}
                placeholder="e.g. 2026-001"
                required
              />
            </FormField>

            <div className="field-grid">
              <FormField label="First Name" htmlFor="firstName" required>
                <TextInput
                  id="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Juan"
                  required
                />
              </FormField>
              <FormField label="Middle Initial" htmlFor="middleInitial">
                <TextInput
                  id="middleInitial"
                  autoComplete="additional-name"
                  value={middleInitial}
                  onChange={(event) => setMiddleInitial(event.target.value)}
                  placeholder="P."
                  maxLength="5"
                />
              </FormField>
              <FormField label="Last Name" htmlFor="lastName" required>
                <TextInput
                  id="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Dela Cruz"
                  required
                />
              </FormField>
            </div>

            <FormField label="Email address" htmlFor="email" required>
              <TextInput
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="juan.delacruz@dswd.gov.ph"
                required
              />
            </FormField>

            <FormField label="Position" htmlFor="position" required>
              <Select
                id="position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                required
              >
                <option value="">Select position</option>
                {POSITIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <div className="password-field">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
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

            <FormField label="Confirm password" htmlFor="confirmPassword" required>
              <div className="password-field">
                <TextInput
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </FormField>

            <Button type="submit" loading={submitting} iconRight={ArrowLeft} className="login-submit">
              Create account
            </Button>
          </form>

          <div className="signin-link-wrapper">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="register-link-highlight"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
