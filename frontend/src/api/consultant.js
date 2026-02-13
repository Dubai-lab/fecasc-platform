import http from "./http";

// Consultant/Staff Login
export const loginConsultant = (email, password) => {
  return http.post("/auth/staff-login", { email, password }).then(res => res.data);
};

// Get consultant's assigned bookings
export const getMyBookings = () => {
  return http.get("/bookings/my-bookings").then(res => res.data);
};

// Update booking status (as consultant)
export const updateBookingStatus = (id, status) => {
  return http.patch(`/bookings/${id}/status`, { status }).then(res => res.data);
};

// Get consultant profile info from token
export const getConsultantProfile = () => {
  const raw = localStorage.getItem("fecasc_consultant");
  return raw ? JSON.parse(raw) : null;
};

// Save consultant session
export const saveConsultantSession = (token, consultant) => {
  localStorage.setItem("fecasc_consultant_token", token);
  localStorage.setItem("fecasc_consultant", JSON.stringify(consultant));
};

// Logout consultant
export const logoutConsultant = () => {
  localStorage.removeItem("fecasc_consultant_token");
  localStorage.removeItem("fecasc_consultant");
};

// Check if consultant is logged in
export const isConsultantLoggedIn = () => {
  return !!localStorage.getItem("fecasc_consultant_token");
};
