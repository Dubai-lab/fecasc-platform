import http from "./http.js";

// Get all invoices
export const getAllInvoices = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await http.get(`/invoices${params ? `?${params}` : ""}`);
  return data;
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
  const { data } = await http.get(`/invoices/${invoiceId}`);
  return data;
};

// Create invoice from approved quote
export const createInvoice = async (invoiceData) => {
  const { data } = await http.post("/invoices", invoiceData);
  return data;
};

// Update invoice details
export const updateInvoice = async (invoiceId, updates) => {
  const { data } = await http.patch(`/invoices/${invoiceId}`, updates);
  return data;
};

// Send invoice to client
export const sendInvoice = async (invoiceId, message = "") => {
  const { data } = await http.post(`/invoices/${invoiceId}/send`, { message });
  return data;
};

// Get financial dashboard summary (admin only)
export const getDashboardSummary = async () => {
  const { data } = await http.get("/invoices/dashboard/summary");
  return data;
};

/* Public/Client Endpoints (no auth required) */

// Client upload payment proof
export const uploadPaymentProof = async (invoiceId, email, proofUrl) => {
  const { data } = await http.post(
    `/invoices/${invoiceId}/payment-proof`,
    { email, proofUrl },
    { skipAuth: true }
  );
  return data;
};

// Admin verify payment
export const verifyPayment = async (invoiceId, verified = true, notes = "") => {
  const { data } = await http.patch(`/invoices/${invoiceId}/verify-payment`, {
    verified,
    notes,
  });
  return data;
};
