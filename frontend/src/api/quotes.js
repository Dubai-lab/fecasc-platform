import http from "./http.js";

// Get all quotes
export const getAllQuotes = async () => {
  const { data } = await http.get("/api/quotes");
  return data;
};

// Get quote by ID
export const getQuoteById = async (quoteId) => {
  const { data } = await http.get(`/api/quotes/${quoteId}`);
  return data;
};

// Get quote for a specific booking
export const getQuoteByBooking = async (bookingId) => {
  const { data } = await http.get(`/api/quotes/booking/${bookingId}`);
  return data;
};

// Create a new quote
export const createQuote = async (quoteData) => {
  const { data } = await http.post("/api/quotes", quoteData);
  return data;
};

// Update an existing quote (DRAFT status only)
export const updateQuote = async (quoteId, updates) => {
  const { data } = await http.patch(`/api/quotes/${quoteId}`, updates);
  return data;
};

// Send quote to client
export const sendQuote = async (quoteId, deliveryMethod) => {
  const { data } = await http.post(`/api/quotes/${quoteId}/send`, {
    deliveryMethod,
  });
  return data;
};

/* Public/Client Endpoints (no auth required) */

// Client approve quote
export const approveQuote = async (quoteId, email) => {
  const { data } = await http.post(
    `/api/quotes/${quoteId}/approve`,
    { email },
    { skipAuth: true }
  );
  return data;
};

// Client reject quote
export const rejectQuote = async (quoteId, email) => {
  const { data } = await http.post(
    `/api/quotes/${quoteId}/reject`,
    { email },
    { skipAuth: true }
  );
  return data;
};

// Client send message about quote
export const sendQuoteMessage = async (quoteId, email, message) => {
  const { data } = await http.post(
    `/api/quotes/${quoteId}/message`,
    { email, message },
    { skipAuth: true }
  );
  return data;
};

// Client upload signed PDF
export const uploadSignedPDF = async (quoteId, email, pdfUrl) => {
  const { data } = await http.post(
    `/api/quotes/${quoteId}/upload-signed-pdf`,
    { email, pdfUrl },
    { skipAuth: true }
  );
  return data;
};

// Admin verify signed agreement
export const verifyQuoteAgreement = async (quoteId) => {
  const { data } = await http.patch(`/api/quotes/${quoteId}/verify`);
  return data;
};
