import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  FileText,
  UserRound,
  UserCheck,
} from "lucide-react";
import { api } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import {
  Button,
  EmptyState,
  Spinner,
} from "../../components/ui.jsx";
import { formatDate } from "../../lib/helpers.js";

export default function StaffManagement() {
  const { push } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get("/admin/staff");
        setStaff(data.staff || []);
      } catch (err) {
        setError(err.message || "Unable to load staff accounts.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size={26} />
        <span>Loading staff accounts…</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={UserRound}
        title="Unable to load staff"
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      >
        {error}
      </EmptyState>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="settings-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Staff management</p>
            <h2>Staff accounts</h2>
            <p>View registered staff members and their profiling accomplishments.</p>
          </div>
        </section>
        <EmptyState
          icon={UserCheck}
          title="No staff accounts yet"
          action={
            <Link to="/auth/register" className="btn btn-primary">
              Register staff
            </Link>
          }
        >
          Staff members you register will appear here with their profiling response counts.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Staff management</p>
          <h2>Staff accounts</h2>
          <p>View registered staff members and their profiling accomplishments.</p>
        </div>
      </section>

      <div className="settings-grid">
        <div className="settings-main">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID Number</th>
                <th>Position</th>
                <th>Email</th>
                <th>Responses</th>
                <th>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="table-person">
                      <span className="table-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{member.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="mono">{member.idNumber || "—"}</span>
                  </td>
                  <td>
                    <span className="tag">{member.position || "Not set"}</span>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <strong>{member.submissionCount}</strong>
                  </td>
                  <td>
                    {member.lastLoginAt
                      ? formatDate(member.lastLoginAt, true)
                      : <span className="muted">Never</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="settings-side">
          <section className="panel">
            <header className="panel-head">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>Staff summary</h3>
              </div>
            </header>
            <div className="stat-grid" style={{ gridTemplateColumns: "1fr" }}>
              <article className="stat-card stat-blue">
                <span className="stat-icon">
                  <UserRound size={20} />
                </span>
                <div>
                  <span className="stat-label">Total staff</span>
                  <strong className="stat-value">{staff.length}</strong>
                </div>
              </article>
              <article className="stat-card stat-green">
                <span className="stat-icon">
                  <FileText size={20} />
                </span>
                <div>
                  <span className="stat-label">Total responses</span>
                  <strong className="stat-value">
                    {staff.reduce((sum, m) => sum + m.submissionCount, 0)}
                  </strong>
                </div>
              </article>
              <article className="stat-card stat-gold">
                <span className="stat-icon">
                  <UserCheck size={20} />
                </span>
                <div>
                  <span className="stat-label">With responses</span>
                  <strong className="stat-value">
                    {staff.filter((m) => m.submissionCount > 0).length}
                  </strong>
                </div>
              </article>
            </div>
          </section>

          <section className="panel">
            <header className="panel-head">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h3>Manage staff</h3>
              </div>
            </header>
            <div className="settings-links">
              <Link to="/auth/register" className="settings-link">
                <UserRound size={17} />
                <span>Register new staff</span>
              </Link>
              <Link to="/admin/submissions" className="settings-link">
                <FileText size={17} />
                <span>View all responses</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
