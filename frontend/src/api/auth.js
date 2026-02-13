import http from "./http";

// Unified login for both Admin and Staff
export async function loginUnified(email, password) {
  const res = await http.post("/auth/login-unified", { email, password });
  return res.data;
}

// Legacy admin login (kept for backward compatibility)
export async function loginAdmin(email, password) {
  const res = await http.post("/auth/login", { email, password });
  return res.data;
}

export function logoutAdmin() {
  localStorage.removeItem("fecasc_token");
  localStorage.removeItem("fecasc_admin");
  localStorage.removeItem("fecasc_user_type");
  localStorage.removeItem("fecasc_consultant_token");
  localStorage.removeItem("fecasc_consultant");
}

export function saveSession(token, user, userType = "admin") {
  localStorage.setItem("fecasc_token", token);
  localStorage.setItem("fecasc_user_type", userType);
  
  if (userType === "admin") {
    localStorage.setItem("fecasc_admin", JSON.stringify(user));
  } else if (userType === "staff") {
    localStorage.setItem("fecasc_consultant", JSON.stringify(user));
    localStorage.setItem("fecasc_consultant_token", token);
  }
}

export function getAdmin() {
  const raw = localStorage.getItem("fecasc_admin");
  return raw ? JSON.parse(raw) : null;
}

export function getUser() {
  const userType = localStorage.getItem("fecasc_user_type");
  if (userType === "admin") {
    return getAdmin();
  } else if (userType === "staff") {
    const raw = localStorage.getItem("fecasc_consultant");
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

export function getUserType() {
  return localStorage.getItem("fecasc_user_type") || null;
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("fecasc_token"));
}
