import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import * as quotesApi from "../../api/quotes";
import "./Quotes.css";

export default function Quotes() {
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
    <AdminLayout title="Quotes Management">
      <div className="quotes-container">
      <div className="quotes-header">
        <h1>📋 Quote Management</h1>
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
              <label>Internal Notes (Admin/Consultant Only)</label>
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
              <button type="submit" className="btn-primary">
                Create Quote
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="quotes-filter">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Quotes</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="VIEWED">Viewed</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NEGOTIATING">Negotiating</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading quotes...</p>
      ) : filteredQuotes.length === 0 ? (
        <p className="no-quotes">No quotes found. Create one to get started!</p>
      ) : (
        <div className="quotes-grid">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onClick={() => setSelectedQuote(quote)}
            />
          ))}
        </div>
      )}

      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onRefresh={fetchQuotes}
        />
      )}
    </div>
    </AdminLayout>
  );
}

function QuoteCard({ quote, onClick }) {
  const statusColors = {
    DRAFT: "#f0f0f0",
    SENT: "#e3f2fd",
    VIEWED: "#fff3e0",
    APPROVED: "#e8f5e9",
    REJECTED: "#ffebee",
    NEGOTIATING: "#f3e5f5",
  };

  return (
    <div
      className="quote-card"
      style={{ borderLeft: `4px solid ${statusColors[quote.status] || "#ccc"}` }}
      onClick={onClick}
    >
      <div className="quote-card-header">
        <h3>Quote #{quote.id.substring(0, 8)}</h3>
        <span className="status-badge" style={{ backgroundColor: statusColors[quote.status] }}>
          {quote.status}
        </span>
      </div>
      <div className="quote-card-body">
        <p>
          <strong>Booking:</strong> {quote.bookingId.substring(0, 8)}
        </p>
        <p>
          <strong>Amount:</strong> L${quote.totalAmount.toLocaleString()}
        </p>
        <p>
          <strong>Items:</strong> {quote.lineItems.length} line{quote.lineItems.length !== 1 ? "s" : ""}
        </p>
        <p className="quote-created">
          Created: {new Date(quote.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function QuoteDetailModal({ quote, onClose, onRefresh }) {
  const [sending, setSending] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("EMAIL");

  const handleSendQuote = async () => {
    try {
      setSending(true);
      await axios.post(`/api/quotes/${quote.id}/send`, { deliveryMethod }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert(`Quote sent via ${deliveryMethod}!`);
      onRefresh();
      onClose();
    } catch (error) {
      alert("Error sending quote: " + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quote Details</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="quote-details">
            <div className="detail-row">
              <span className="label">Quote ID:</span>
              <span className="value">{quote.id}</span>
            </div>
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
          </div>

          <h3>Line Items</h3>
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>L${item.unitPrice.toLocaleString()}</td>
                  <td>L${item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

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

          {quote.status === "DRAFT" && (
            <div className="send-section">
              <h3>Send Quote to Client</h3>
              <div className="delivery-options">
                <label>
                  <input
                    type="radio"
                    value="EMAIL"
                    checked={deliveryMethod === "EMAIL"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  📧 Email
                </label>
                <label>
                  <input
                    type="radio"
                    value="WHATSAPP"
                    checked={deliveryMethod === "WHATSAPP"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  💬 WhatsApp
                </label>
                <label>
                  <input
                    type="radio"
                    value="SECURE_LINK"
                    checked={deliveryMethod === "SECURE_LINK"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  🔗 Secure Link
                </label>
              </div>
              <button
                className="btn-primary"
                onClick={handleSendQuote}
                disabled={sending}
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
