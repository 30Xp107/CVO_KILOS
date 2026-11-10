import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { initials } from "../../lib/helpers.js";
import { BrandMark } from "../../components/ui.jsx";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/submissions", label: "Responses", icon: FileSpreadsheet },
  { to: "/admin/staff", label: "Staff", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const STAFF_NAV = [
  { to: "/staff/submissions", label: "My Responses", icon: FileSpreadsheet, end: true },
];

const TITLES = {
  "/admin": "Overview",
  "/admin/submissions": "Profiling responses",
  "/admin/staff": "Staff management",
  "/admin/settings": "Settings",
  "/staff": "My profiling responses",
  "/staff/submissions": "My profiling responses",
};

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const navItems = admin?.role === "staff" ? STAFF_NAV : ADMIN_NAV;

  const pageTitle = location.pathname.startsWith("/submissions/")
    ? "Response details"
    : location.pathname.startsWith("/admin/submissions/")
      ? "Response details"
      : TITLES[location.pathname] || "Admin";

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${drawerOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <BrandMark light />
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace">
          <span>Admin workspace</span>
          <strong>KILOS Profiling</strong>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <span className="admin-nav-label">Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? "is-active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                <ChevronRight size={15} className="nav-chevron" />
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-note">
          <ShieldCheck size={18} />
          <p>
            Records contain confidential personal information. Handle according to the Data Privacy
            Act of 2012.
          </p>
        </div>

        <div className="admin-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer" className="sidebar-public-link">
            <ExternalLink size={15} /> Open public form
          </a>
          <span className="version">KILOS Profiling System · v1.0</span>
        </div>
      </aside>

      {drawerOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <span className="admin-crumb">DSWD · Walang Gutom Program</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>
          <div className="admin-user">
            <span className="avatar">{initials(admin?.name || admin?.email || "A")}</span>
            <div className="admin-user-copy">
              <strong>{admin?.name || "User"}</strong>
              <span>{admin?.email}</span>
              <span className="role-pill">{admin?.role === "admin" ? "Administrator" : "Staff"}</span>
            </div>
            <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
