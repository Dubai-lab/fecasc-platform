import { useNavigate } from "react-router-dom";
import { getConsultantProfile, logoutConsultant } from "../../api/consultant";
import { logoutAdmin } from "../../api/auth";

export default function ConsultantLayout({ title, children }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logoutConsultant();
    logoutAdmin();
    navigate("/admin/login");
  };

  const consultant = getConsultantProfile();

  if (!consultant) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #0b3d2e, #11624a)",
        color: "white",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <div>
          <h1 style={{ margin: "0", fontSize: "20px", fontWeight: "900" }}>FECASC Consultant</h1>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "right", fontSize: "14px" }}>
            <div style={{ fontWeight: "700" }}>{consultant.name}</div>
            <div style={{ opacity: 0.8, fontSize: "12px" }}>Consultant</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        display: "flex",
        gap: "32px",
      }}>
        <a href="/consultant/dashboard" style={{
          padding: "16px 0",
          fontSize: "14px",
          fontWeight: "700",
          color: window.location.pathname === "/consultant/dashboard" ? "#16a34a" : "#666",
          borderBottom: window.location.pathname === "/consultant/dashboard" ? "3px solid #16a34a" : "none",
          textDecoration: "none",
          transition: "all 0.3s",
          cursor: "pointer",
        }}>
          Dashboard
        </a>
        <a href="/consultant/quotes" style={{
          padding: "16px 0",
          fontSize: "14px",
          fontWeight: "700",
          color: window.location.pathname === "/consultant/quotes" ? "#16a34a" : "#666",
          borderBottom: window.location.pathname === "/consultant/quotes" ? "3px solid #16a34a" : "none",
          textDecoration: "none",
          transition: "all 0.3s",
          cursor: "pointer",
        }}>
          My Quotes
        </a>
        <a href="/consultant/invoices" style={{
          padding: "16px 0",
          fontSize: "14px",
          fontWeight: "700",
          color: window.location.pathname === "/consultant/invoices" ? "#16a34a" : "#666",
          borderBottom: window.location.pathname === "/consultant/invoices" ? "3px solid #16a34a" : "none",
          textDecoration: "none",
          transition: "all 0.3s",
          cursor: "pointer",
        }}>
          My Invoices
        </a>
      </nav>

      {/* Content */}
      <main style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "900", color: "#0b3d2e" }}>
          {title}
        </h2>
        {children}
      </main>
    </div>
  );
}
