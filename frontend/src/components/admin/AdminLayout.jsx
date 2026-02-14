import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getAdmin, logoutAdmin, getUserType } from "../../api/auth";
import "./AdminLayout.css";

export default function AdminLayout({ title, children }) {
  const loc = useLocation();
  const nav = useNavigate();
  const admin = getAdmin();
  const userType = getUserType();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function onLogout() {
    logoutAdmin();
    nav("/admin/login");
  }

  const active = (path) => (loc.pathname === path ? "side__link side__link--active" : "side__link");

  return (
    <div className="admin">
      <aside className={`side ${sidebarOpen ? "side--open" : ""}`}>
        <div className="side__brand">
          <div className="side__logo">F</div>
          <div>
            <div className="side__name">FECASC</div>
            <div className="side__muted">{userType === "staff" ? "Consultant Panel" : "Admin Panel"}</div>
          </div>
        </div>

        <nav className="side__nav">
          {userType === "admin" && (
            <>
              <Link className={active("/admin")} to="/admin" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
              <Link className={active("/admin/bookings")} to="/admin/bookings" onClick={() => setSidebarOpen(false)}>Bookings</Link>
              <Link className={active("/admin/services")} to="/admin/services" onClick={() => setSidebarOpen(false)}>Services</Link>
              <Link className={active("/admin/quotes")} to="/admin/quotes" onClick={() => setSidebarOpen(false)}>Quotes</Link>
              <Link className={active("/admin/invoices")} to="/admin/invoices" onClick={() => setSidebarOpen(false)}>Invoices</Link>
              <Link className={active("/admin/team")} to="/admin/team" onClick={() => setSidebarOpen(false)}>Team</Link>
              <Link className={active("/admin/gallery")} to="/admin/gallery" onClick={() => setSidebarOpen(false)}>Gallery</Link>
              <Link className={active("/admin/blog")} to="/admin/blog" onClick={() => setSidebarOpen(false)}>Blog</Link>
              <Link className={active("/admin/comments")} to="/admin/comments" onClick={() => setSidebarOpen(false)}>Comments</Link>
            </>
          )}
          {userType === "staff" && (
            <>
              <Link className={active("/consultant/dashboard")} to="/consultant/dashboard" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
              <Link className={active("/consultant/quotes")} to="/consultant/quotes" onClick={() => setSidebarOpen(false)}>My Quotes</Link>
              <Link className={active("/consultant/invoices")} to="/consultant/invoices" onClick={() => setSidebarOpen(false)}>My Invoices</Link>
            </>
          )}
        </nav>

        <div className="side__bottom">
          <div className="side__user">
            <div className="side__avatar">{(admin?.name || "A").slice(0,1).toUpperCase()}</div>
            <div>
              <div className="side__userName">{admin?.name || "Admin"}</div>
              <div className="side__muted small">{admin?.email || ""}</div>
            </div>
          </div>
          <button className="btn btn--danger" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <section className="main">
        <header className="top">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 className="top__title">{title}</h1>
        </header>

        <div className="content">{children}</div>
      </section>
    </div>
  );
}
