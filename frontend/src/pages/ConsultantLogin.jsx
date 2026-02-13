import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginConsultant, saveConsultantSession } from "../api/consultant";
import "./Page.css";

export default function ConsultantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginConsultant(email, password);
      if (result.token && result.staff) {
        saveConsultantSession(result.token, result.staff);
        navigate("/consultant/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b3d2e, #11624a)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0b3d2e", marginBottom: "8px" }}>
            Consultant Portal
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Sign in to access your assigned projects
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fecdd3",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}>
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", color: "#1f2937", fontSize: "14px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="consultant@company.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", color: "#1f2937", fontSize: "14px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#1a8f6a",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = "#0b3d2e")}
            onMouseOut={(e) => !loading && (e.target.style.background = "#1a8f6a")}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "12px" }}>
            Don't have a consultant account?
          </p>
          <Link
            to="/"
            style={{
              color: "#1a8f6a",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "14px",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.8")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
