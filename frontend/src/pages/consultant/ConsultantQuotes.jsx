import React, { useState, useEffect } from "react";
import axios from "axios";
import ConsultantLayout from "../../components/consultant/ConsultantLayout";
import * as quotesApi from "../../api/quotes";
import "../admin/Quotes.css";

export default function ConsultantQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [formData, setFormData] = useState({
    bookingId: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    notes: "",
    internalNotes: "",
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await quotesApi.getAllQuotes();
      setQuotes(response || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: "", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const handleRemoveLineItem = (index) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...formData.lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : parseFloat(value) || 0,
    };
    setFormData({ ...formData, lineItems: updated });
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!formData.bookingId || formData.lineItems.length === 0) {
      alert("Please select a booking and add at least one line item");
      return;
    }

    try {
      await quotesApi.createQuote(formData);
      alert("Quote created successfully!");
      setFormData({
        bookingId: "",
        lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: "",
        internalNotes: "",
      });
      setShowCreateForm(false);
      fetchQuotes();
    } catch (error) {
      alert("Error creating quote: " + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const filteredQuotes = filterStatus === "ALL"
    ? quotes
    : quotes.filter((q) => q.status === filterStatus);

  return (
    <ConsultantLayout title="My Quotes">
      <div className="quotes-container">
        <div className="quotes-header">
          <h1>📋 My Quotes</h1>
          <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Close Form" : "+ Create Quote"}
          </button>
        </div>

        {showCreateForm && (
          <div className="quote-form-card">
            <h2>Create New Quote</h2>
            <form onSubmit={handleCreateQuote}>
              <div className="form-group">
                <label>Booking ID *</label>
                <input
                  type="text"
                  placeholder="Select or paste booking ID"
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  required
                />
              </div>

              <div className="line-items-section">
                <h3>Line Items (Charges)</h3>
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="line-item-row">
                    <input
                      type="text"
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(index, "description", e.target.value)
                      }
                      className="item-description"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, "quantity", e.target.value)
                      }
                      className="item-qty"
                      min="0.1"
                      step="0.1"
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(index, "unitPrice", e.target.value)
                      }
                      className="item-price"
                      min="0"
                    />
                    <span className="item-total">
                      L${(item.quantity * item.unitPrice).toLocaleString()}
                    </span>
                    {formData.lineItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveLineItem(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddLineItem}
                >
                  + Add Line Item
                </button>
              </div>

              <div className="quote-total">
                <strong>Total Amount:</strong>
                <span>L${calculateTotal().toLocaleString()}</span>
              </div>

              <div className="form-group">
                <label>Notes for Client</label>
                <textarea
                  placeholder="Optional notes to include in the quote..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Internal Notes (Consultant Only)</label>
                <textarea
                  placeholder="Internal notes not visible to client..."
                  value={formData.internalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, internalNotes: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Quote
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="quotes-filter">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Quotes</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Quotes List */}
        <div className="quotes-list">
          <h2>Your Quotes ({filteredQuotes.length})</h2>
          {loading ? (
            <div className="loading">Loading quotes...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="no-quotes">No quotes found</div>
          ) : (
            <div className="quotes-grid">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="quote-card" onClick={() => setSelectedQuote(quote)}>
                  <div className="quote-card-header">
                    <h3>Quote #{quote.id.slice(0, 8)}</h3>
                    <span className="status-badge" style={{
                      background: quote.status === "APPROVED" ? "#dcfce7" :
                                 quote.status === "SENT" ? "#dbeafe" :
                                 quote.status === "REJECTED" ? "#fee2e2" : "#f3f4f6",
                      color: quote.status === "APPROVED" ? "#166534" :
                             quote.status === "SENT" ? "#0369a1" :
                             quote.status === "REJECTED" ? "#991b1b" : "#374151",
                    }}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="quote-card-body">
                    <p><strong>Booking:</strong> {quote.bookingId}</p>
                    <p><strong>Total:</strong> L${quote.totalAmount.toLocaleString()}</p>
                    <p><strong>Items:</strong> {quote.lineItems?.length || 0}</p>
                  </div>
                  <div className="quote-created">Created: {new Date(quote.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedQuote && <QuoteDetailModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} />}
      </div>
    </ConsultantLayout>
  );
}

function QuoteDetailModal({ quote, onClose }) {
  const [sendingTo, setSendingTo] = useState("email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendQuote = async () => {
    if (!recipientEmail) {
      alert("Please enter recipient email");
      return;
    }

    setSending(true);
    try {
      await axios.post(`/api/quotes/${quote.id}/send`, {
        method: sendingTo,
        recipientEmail,
      });
      alert("Quote sent successfully!");
      setSending(false);
      setRecipientEmail("");
      onClose();
    } catch (error) {
      alert("Error sending quote: " + (error.response?.data?.message || error.message));
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quote #{quote.id.slice(0, 8)}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="quote-details">
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value badge">{quote.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Booking ID:</span>
              <span className="value">{quote.bookingId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount:</span>
              <span className="value amount">L${quote.totalAmount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Created:</span>
              <span className="value">{new Date(quote.createdAt).toLocaleDateString()}</span>
            </div>
            {quote.sentAt && (
              <div className="detail-row">
                <span className="label">Sent:</span>
                <span className="value">{new Date(quote.sentAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="line-items-table">
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>L${item.unitPrice.toLocaleString()}</td>
                    <td>L${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quote.notes && (
            <div className="notes-section">
              <h4>Client Notes</h4>
              <p>{quote.notes}</p>
            </div>
          )}

          {quote.internalNotes && (
            <div className="internal-notes-section">
              <h4>Internal Notes</h4>
              <p>{quote.internalNotes}</p>
            </div>
          )}

          {quote.status !== "APPROVED" && quote.status !== "REJECTED" && (
            <div className="send-section">
              <h3>Send Quote to Client</h3>
              <div className="delivery-options">
                <label>
                  <input type="radio" name="delivery" value="email" checked={sendingTo === "email"} onChange={(e) => setSendingTo(e.target.value)} />
                  Email
                </label>
              </div>
              <input
                type="email"
                placeholder="Recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <button
                onClick={handleSendQuote}
                disabled={sending}
                style={{
                  marginTop: "12px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: sending ? "not-allowed" : "pointer",
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? "Sending..." : "Send Quote"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
