import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Button,
  FormField,
  SectionCard,
  Spinner,
  TextInput,
} from "../../components/ui.jsx";
import { formatDate, initials } from "../../lib/helpers.js";

export default function Settings() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [health, setHealth] = useState({ state: "loading" });

  useEffect(() => {
    let active = true;
    api
      .get("/health")
      .then(() => active && setHealth({ state: "ok" }))
      .catch(() => active && setHealth({ state: "error" }));
    return () => {
      active = false;
    };
  }, []);

  const handlePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      push("New password must be at least 8 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      push("New passwords do not match.", "warning");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/auth/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      push("Password updated successfully.", "success");
    } catch (err) {
      push(err.message || "Could not update your password.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="settings-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Account & system</p>
          <h2>Settings</h2>
          <p>Manage your administrator account and review system information.</p>
        </div>
      </section>

      <div className="settings-grid">
        <div className="settings-main">
          <SectionCard
            icon={UserRound}
            eyebrow="Profile"
            title="Administrator account"
            description="This account has access to all beneficiary profiling records."
          >
            <div className="account-card">
              <span className="record-avatar">{initials(admin?.name || admin?.email)}</span>
              <div>
                <strong>{admin?.name || "Administrator"}</strong>
                <span>{admin?.email}</span>
                <span className="role-pill">{admin?.role === "admin" ? "Administrator" : "Staff"}</span>
              </div>
            </div>
            <div className="field-grid form-gap-top">
              <FormField label="Display name" htmlFor="adminName">
                <TextInput id="adminName" value={admin?.name || ""} disabled />
              </FormField>
              <FormField label="Email address" htmlFor="adminEmail">
                <TextInput id="adminEmail" value={admin?.email || ""} disabled />
              </FormField>
              <FormField label="Last sign-in" htmlFor="adminLastLogin" className="span-2">
                <TextInput
                  id="adminLastLogin"
                  value={formatDate(admin?.lastLoginAt, true)}
                  disabled
                />
              </FormField>
            </div>
            <p className="field-hint">
              The account email and display name are managed by the system administrator. Use the
              password form above to rotate this account&apos;s password.
            </p>
          </SectionCard>

          <SectionCard
            icon={KeyRound}
            eyebrow="Security"
            title="Change password"
            description="Use a strong password with at least 8 characters."
          >
            <form onSubmit={handlePassword} className="field-grid">
              <FormField label="Current password" htmlFor="currentPassword" required className="span-2">
                <TextInput
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </FormField>
              <FormField label="New password" htmlFor="newPassword" required>
                <TextInput
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </FormField>
              <FormField
                label="Confirm new password"
                htmlFor="confirmPassword"
                required
                error={
                  confirmPassword && confirmPassword !== newPassword
                    ? "Passwords do not match."
                    : ""
                }
              >
                <TextInput
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </FormField>
              <div className="span-2">
                <Button type="submit" icon={ShieldCheck} loading={saving}>
                  Update password
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <aside className="settings-side">
          <SectionCard icon={Database} eyebrow="System" title="Service status">
            <div className="health-row">
              {health.state === "loading" ? (
                <Spinner size={17} />
              ) : health.state === "ok" ? (
                <CheckCircle2 size={18} className="text-green" />
              ) : (
                <XCircle size={18} className="text-red" />
              )}
              <div>
                <strong>
                  {health.state === "loading"
                    ? "Checking API…"
                    : health.state === "ok"
                      ? "API and database connected"
                      : "API unavailable"}
                </strong>
                <span>
                  {health.state === "ok"
                    ? "The profiling API is responding normally."
                    : "Check your deployment environment variables."}
                </span>
              </div>
            </div>
            <ul className="system-list">
              <li>
                <FileSpreadsheet size={16} />
                <span>Excel export includes all form fields plus a household member sheet.</span>
              </li>
              <li>
                <FileText size={16} />
                <span>Each PDF export recreates the six-page KILOS form with the response filled in.</span>
              </li>
              <li>
                <Download size={16} />
                <span>Exports respect the active search and status filters on the responses page.</span>
              </li>
            </ul>
          </SectionCard>

          <SectionCard icon={ShieldCheck} eyebrow="Shortcuts" title="Quick links">
            <div className="settings-links">
              <Link to="/admin/submissions" className="settings-link">
                <FileSpreadsheet size={17} />
                <span>Manage responses</span>
              </Link>
              <a href="/" target="_blank" rel="noreferrer" className="settings-link">
                <ExternalLink size={17} />
                <span>Open public form</span>
              </a>
              <button type="button" className="settings-link" onClick={handleLogout}>
                <LogOut size={17} />
                <span>Sign out of admin</span>
              </button>
            </div>
          </SectionCard>

          <div className="settings-note">
            <ShieldCheck size={18} />
            <p>
              Beneficiary records are confidential. Export only when necessary, store files
              securely, and follow your office's data privacy guidelines.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
