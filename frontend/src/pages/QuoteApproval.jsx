import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as quotesApi from "../api/quotes";
import "./QuoteApproval.css";

export default function QuoteApproval() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    status: "APPROVED",
    clientMessage: "",
    agreedAt: new Date().toISOString(),
  });

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError("");
      const quote = await quotesApi.getPublicQuote(quoteId);
      setQuote(quote);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quote");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    if (!formData.status) {
      setError("Please select your response");
      return;
    }

    try {
      setSubmitting(true);
      await quotesApi.clientApproveQuote(quoteId, {
        email: formData.email,
        status: formData.status,
        clientMessage: formData.clientMessage || null,
        agreedAt: formData.agreedAt,
      });

      setSuccess(
        formData.status === "APPROVED"
          ? "✓ Quote approved successfully! We'll be in touch shortly."
          : formData.status === "REJECTED"
          ? "✓ Quote rejected. We'll follow up with you soon."
          : "✓ Your message has been sent. Our team will review it."
      );

      // Reset form
      setFormData({
        email: "",
        status: "APPROVED",
        clientMessage: "",
        agreedAt: new Date().toISOString(),
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quote-approval-container">
        <div className="loading">Loading quote details...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="quote-approval-container">
        <div className="error-box">Quote not found</div>
      </div>
    );
  }

  const totalAmount = quote.lineItems?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div className="quote-approval-container">
      <div className="quote-approval-wrapper">
        <div className="approval-header">
          <h1>📋 Quote Review & Approval</h1>
          <p className="ref-number">Reference: {quoteId.substring(0, 8).toUpperCase()}</p>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <div className="approval-content">
          {/* Quote Details */}
          <section className="quote-details">
            <div className="quote-details-header">
              <h2>Quote Details</h2>
              <a
                href={`/api/quotes/${quoteId}/download?email=${encodeURIComponent(quote.booking?.clientEmail || '')}`}
                className="download-btn"
                target="_blank"
                rel="noreferrer"
              >
                ⬇️ Download Quote
              </a>
            </div>

            <div className="quote-header-info">
              <div className="info-group">
                <label>For:</label>
                <p>{quote.booking?.clientName}</p>
              </div>
              <div className="info-group">
                <label>Service:</label>
                <p>{quote.booking?.service?.title}</p>
              </div>
              <div className="info-group">
                <label>From:</label>
                <p>{quote.createdBy?.name || quote.adminCreatedBy?.name || "Our Team"}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="line-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>L${item.unitPrice.toLocaleString()}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                        L${item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-row">
                <strong>Total Amount:</strong>
                <strong className="total-amount">L${totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="notes-section">
                <h3>Notes</h3>
                <p className="notes-text">{quote.notes}</p>
              </div>
            )}
          </section>

          {/* Approval Form */}
          <section className="approval-form">
            <h2>Your Response</h2>
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Your Email Address *</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Status Selection */}
              <div className="form-group">
                <label>Your Response *</label>
                <div className="status-options">
                  <label className="radio-group">
                    <input
                      type="radio"
                      name="status"
                      value="APPROVED"
                      checked={formData.status === "APPROVED"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span className="radio-label">✓ I Approve This Quote</span>
                  </label>

                  <label className="radio-group">
                    <input
                      type="radio"
                      name="status"
                      value="NEGOTIATING"
                      checked={formData.status === "NEGOTIATING"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span className="radio-label">💬 I Have Questions/Changes</span>
                  </label>

                  <label className="radio-group">
                    <input
                      type="radio"
                      name="status"
                      value="REJECTED"
                      checked={formData.status === "REJECTED"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    <span className="radio-label">✗ I Do Not Approve</span>
                  </label>
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">
                  {formData.status === "APPROVED" ? "Comments (Optional)" : "Message (Optional)"}
                </label>
                <textarea
                  id="message"
                  placeholder="Add any comments or questions here..."
                  rows="4"
                  value={formData.clientMessage}
                  onChange={(e) => setFormData({ ...formData, clientMessage: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Response"}
              </button>
            </form>

            {/* Instructions */}
            <div className="instructions">
              <h3>Next Steps</h3>
              <div className="instruction-text">
                {formData.status === "APPROVED" && (
                  <p>
                    ✓ Thank you for approving. Our team will contact you within 24 hours to discuss the next
                    steps and finalize the agreement.
                  </p>
                )}
                {formData.status === "NEGOTIATING" && (
                  <p>
                    💬 Please share your questions or suggested changes above. Our team will review and get
                    back to you with revised terms.
                  </p>
                )}
                {formData.status === "REJECTED" && (
                  <p>✗ We appreciate your feedback. Our team will reach out to discuss alternatives.</p>
                )}
              </div>
              <p className="contact-info">
                <strong>Need help?</strong> Contact us at{" "}
                <a href="mailto:contact@fecasc.com">contact@fecasc.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
