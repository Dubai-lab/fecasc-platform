import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAdmin, logoutAdmin } from "../../api/auth";
import "./AdminLayout.css";

export default function AdminLayout({ title, children }) {
  const loc = useLocation();
  const nav = useNavigate();
  const admin = getAdmin();

  function onLogout() {
    logoutAdmin();
    nav("/admin/login");
  }

  const active = (path) => (loc.pathname === path ? "side__link side__link--active" : "side__link");

  return (
    <div className="admin">
      <aside className="side">
        <div className="side__brand">
          <div className="side__logo">F</div>
          <div>
            <div className="side__name">FECASC</div>
            <div className="side__muted">Admin Panel</div>
          </div>
        </div>

        <nav className="side__nav">
          <Link className={active("/admin")} to="/admin">Dashboard</Link>
          <Link className={active("/admin/bookings")} to="/admin/bookings">Bookings</Link>
          <Link className={active("/admin/services")} to="/admin/services">Services</Link>
          <Link className={active("/admin/team")} to="/admin/team">Team</Link>
          <Link className={active("/admin/gallery")} to="/admin/gallery">Gallery</Link>
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
          <h1 className="top__title">{title}</h1>
        </header>

        <div className="content">{children}</div>
      </section>
    </div>
  );
}
