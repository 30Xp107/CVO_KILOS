import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarPlus,
  Download,
  ExternalLink,
  FileCheck2,
  Inbox,
  RefreshCw,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { api, downloadRequest } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Button,
  EmptyState,
  Spinner,
  StatusBadge,
} from "../../components/ui.jsx";
import { LABELS, label, formatDate } from "../../lib/helpers.js";

const STATUS_COLORS = {
  new: "#2563EB",
  in_review: "#F59E0B",
  referred: "#8B5CF6",
  completed: "#16A34A",
};

export default function Dashboard() {
  const { admin } = useAuth();
  const { push } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/admin/stats", undefined, { signal });
      setStats(data);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Unable to load dashboard.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await downloadRequest("/admin/export/excel", `KILOS-Responses-${date}.xlsx`);
      push("Excel export downloaded.", "success");
    } catch (err) {
      push(err.message || "Could not export responses.", "error");
    } finally {
      setExporting(false);
    }
  };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading && !stats) {
    return (
      <div className="dashboard-loading">
        <Spinner size={26} />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <EmptyState
        icon={Inbox}
        title="Dashboard unavailable"
        action={
          <Button variant="outline" icon={RefreshCw} onClick={() => load()}>
            Try again
          </Button>
        }
      >
        {error}
      </EmptyState>
    );
  }

  const statusCounts = stats?.statusCounts || { new: 0, in_review: 0, referred: 0, completed: 0 };
  const statusTotal = Object.values(statusCounts).reduce((sum, value) => sum + value, 0);
  const monthly = stats?.monthly || [];
  const maxMonth = Math.max(1, ...monthly.map((item) => item.count));
  const needs = stats?.needs || [];
  const maxNeed = Math.max(1, ...needs.map((item) => item.count));

  let cursor = 0;
  const gradientStops = Object.entries(statusCounts).map(([key, value]) => {
    const start = statusTotal ? (cursor / statusTotal) * 100 : 0;
    cursor += value;
    const end = statusTotal ? (cursor / statusTotal) * 100 : 0;
    return `${STATUS_COLORS[key]} ${start}% ${end}%`;
  });

  const cards = [
    {
      label: "Total responses",
      value: stats?.total || 0,
      icon: Users,
      tone: "blue",
      hint: "All profiling records",
    },
    {
      label: "Submitted today",
      value: stats?.today || 0,
      icon: CalendarPlus,
      tone: "gold",
      hint: today,
    },
    {
      label: "This month",
      value: stats?.thisMonth || 0,
      icon: TrendingUp,
      tone: "green",
      hint: "New profiles this month",
    },
    {
      label: "Referred",
      value: statusCounts.referred || 0,
      icon: Send,
      tone: "violet",
      hint: "Sent to partner agencies",
    },
  ];

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{admin?.name || "Administrator"}</h2>
          <p>
            Here is what is happening with KILOS profiling submissions. {today}.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <Button variant="outline" icon={Download} loading={exporting} onClick={handleExport}>
            Export Excel
          </Button>
          <Link to="/admin/submissions" className="btn btn-primary">
            View responses <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}

      <section className="stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`stat-card stat-${card.tone}`} key={card.label}>
              <span className="stat-icon">
                <Icon size={20} />
              </span>
              <div>
                <span className="stat-label">{card.label}</span>
                <strong className="stat-value">{card.value}</strong>
                <span className="stat-hint">{card.hint}</span>
              </div>
            </article>
          );
        })}
      </section>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <header className="panel-head">
            <div>
              <p className="eyebrow">Trend</p>
              <h3>Submissions over the last 6 months</h3>
            </div>
            <span className="panel-badge">{stats?.total || 0} total</span>
          </header>
          <div className="bar-chart" role="img" aria-label="Bar chart of submissions over the last six months">
            {monthly.map((item) => (
              <div className="bar-column" key={item.key}>
                <span className="bar-count">{item.count}</span>
                <div className="bar-track">
                  <span
                    className="bar-fill"
                    style={{ height: `${Math.max(4, (item.count / maxMonth) * 100)}%` }}
                  />
                </div>
                <span className="bar-label">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel donut-panel">
          <header className="panel-head">
            <div>
              <p className="eyebrow">Workflow</p>
              <h3>Response status</h3>
            </div>
          </header>
          <div className="donut-wrap">
            <div
              className="donut"
              style={{
                background: statusTotal
                  ? `conic-gradient(${gradientStops.join(", ")})`
                  : "conic-gradient(#e2e8f0 0% 100%)",
              }}
              role="img"
              aria-label={`${statusTotal} records by status`}
            >
              <div className="donut-center">
                <strong>{statusTotal}</strong>
                <span>records</span>
              </div>
            </div>
            <ul className="donut-legend">
              {Object.entries(LABELS.status).map(([key, text]) => (
                <li key={key}>
                  <span className="legend-dot" style={{ background: STATUS_COLORS[key] }} />
                  <span>{text}</span>
                  <strong>{statusCounts[key] || 0}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="dashboard-grid dashboard-grid-secondary">
        <section className="panel">
          <header className="panel-head">
            <div>
              <p className="eyebrow">Needs</p>
              <h3>Assistance requested</h3>
            </div>
            <Link to="/admin/submissions" className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          </header>
          {needs.length === 0 ? (
            <EmptyState icon={Inbox} title="No assistance data yet">
              Assistance interests will appear here once responses are submitted.
            </EmptyState>
          ) : (
            <ul className="need-bars">
              {needs.map((need) => (
                <li key={need.label}>
                  <div className="need-bar-head">
                    <span>{label("assistance", need.label)}</span>
                    <strong>{need.count}</strong>
                  </div>
                  <div className="need-track">
                    <span style={{ width: `${(need.count / maxNeed) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <p className="eyebrow">Latest</p>
              <h3>Recent submissions</h3>
            </div>
            <Link to="/admin/submissions" className="text-link">
              View all <ArrowRight size={14} />
            </Link>
          </header>
          {stats?.recent?.length ? (
            <ul className="recent-list">
              {stats.recent.map((item) => (
                <li key={item._id}>
                  <Link to={`/admin/submissions/${item._id}`} className="recent-item">
                    <span className="recent-avatar">
                      {(item.personal?.cardHolderName || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="recent-copy">
                      <strong>{item.personal?.cardHolderName || "Unnamed beneficiary"}</strong>
                      <small>
                        {item.referenceNo} · {formatDate(item.submittedAt)}
                      </small>
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={FileCheck2} title="No submissions yet">
              Share the public form link to start collecting profiles.
            </EmptyState>
          )}
        </section>
      </div>

      <section className="quick-actions">
        <div>
          <h3>Quick actions</h3>
          <p>Export data for reporting or share the public profiling form.</p>
        </div>
        <div className="quick-action-buttons">
          <Button variant="outline" icon={Download} onClick={handleExport} loading={exporting}>
            Download all responses
          </Button>
          <a className="btn btn-outline" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Open public form
          </a>
        </div>
      </section>
    </div>
  );
}
