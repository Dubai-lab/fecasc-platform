import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { loginUnified, saveSession, isLoggedIn, getUserType } from "../../api/auth";
import "./Login.css";
import { useEffect } from "react";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@fecasc.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      const userType = getUserType();
      if (userType === "admin") {
        nav("/admin", { replace: true });
      } else if (userType === "staff") {
        nav("/consultant/dashboard", { replace: true });
      }
    }
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await loginUnified(email, password);
      saveSession(data.token, data.user, data.userType);
      
      // Route based on user type (use replace to prevent going back to login)
      if (data.userType === "admin") {
        nav("/admin", { replace: true });
      } else if (data.userType === "staff") {
        nav("/consultant/dashboard", { replace: true });
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="login__wrapper">
        <div className="login">
          <div className="login__logo">FECASC</div>
          <h1>Welcome Back</h1>

          {err ? <div className="error">{err}</div> : null}

          <form onSubmit={onSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button className="btnPrimary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
