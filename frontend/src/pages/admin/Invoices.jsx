import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import * as invoicesApi from "../../api/invoices";
import "./Invoices.css";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoicesApi.getAllInvoices();
      setInvoices(response || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await invoicesApi.getDashboardSummary();
      setSummary(response);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const filteredInvoices = filterStatus === "ALL"
    ? invoices
    : invoices.filter((inv) => inv.status === filterStatus);

  return (
    <AdminLayout title="Invoices Management">
      <div className="invoices-container">
        <div className="invoices-header">
          <h1>💰 Invoice & Revenue Management</h1>
        </div>

        {summary && (
        <div className="summary-grid">
          <div className="summary-card total-revenue">
            <h3>Total Revenue</h3>
            <p className="amount">L${(summary.totalRevenue || 0).toLocaleString()}</p>
            <span className="count">{summary.totalPaidCount} paid invoices</span>
          </div>

          <div className="summary-card pending-revenue">
            <h3>Pending Revenue</h3>
            <p className="amount">L${(summary.pendingRevenue || 0).toLocaleString()}</p>
            <span className="count">{summary.pendingCount} awaiting payment</span>
          </div>

          <div className="summary-card overdue-revenue">
            <h3>Overdue Revenue</h3>
            <p className="amount">L${(summary.overdueRevenue || 0).toLocaleString()}</p>
            <span className="count">{summary.overdueCount} overdue invoices</span>
          </div>
        </div>
      )}

      <div className="invoices-filter">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">All Invoices</option>
          <option value="GENERATED">Generated</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading invoices...</p>
      ) : filteredInvoices.length === 0 ? (
        <p className="no-invoices">No invoices found.</p>
      ) : (
        <div className="invoices-grid">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onClick={() => setSelectedInvoice(invoice)}
            />
          ))}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRefresh={() => {
            fetchInvoices();
            fetchSummary();
          }}
        />
      )}
    </div>
    </AdminLayout>
  );
}

function InvoiceCard({ invoice, onClick }) {
  const statusColors = {
    GENERATED: "#f0f0f0",
    SENT: "#e3f2fd",
    PAID: "#e8f5e9",
    OVERDUE: "#ffebee",
    CANCELLED: "#f3e5f5",
  };

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== "PAID";

  return (
    <div
      className="invoice-card"
      style={{ borderLeft: `4px solid ${statusColors[invoice.status] || "#ccc"}` }}
      onClick={onClick}
    >
      <div className="invoice-card-header">
        <h3>Invoice #{invoice.id.substring(0, 8)}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: statusColors[invoice.status] }}
        >
          {isOverdue && invoice.status !== "PAID" ? "OVERDUE" : invoice.status}
        </span>
      </div>
      <div className="invoice-card-body">
        <p>
          <strong>Amount:</strong> L${invoice.totalAmount.toLocaleString()}
        </p>
        <p>
          <strong>Due:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Booking:</strong> {invoice.bookingId.substring(0, 8)}
        </p>
        {invoice.paidAt && (
          <p className="paid-date">
            Paid: {new Date(invoice.paidAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

function InvoiceDetailModal({ invoice, onClose, onRefresh }) {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSendInvoice = async () => {
    try {
      setSending(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      await invoicesApi.sendInvoice(invoice.id);
      
      setSuccessMessage("✓ Invoice sent successfully!");
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMessage("Error sending invoice: " + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  const handleVerifyPayment = async (verified) => {
    try {
      setVerifying(true);
      setErrorMessage("");
      setSuccessMessage("");
      await invoicesApi.verifyPayment(invoice.id, verified, verifyNotes);
      setSuccessMessage(verified ? "✓ Payment verified!" : "✓ Payment verification rejected");
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMessage("Error verifying payment: " + (error.response?.data?.message || error.message));
    } finally {
      setVerifying(false);
    }
  };

  const hasPaymentProof = invoice.paymentProofs && invoice.paymentProofs.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invoice Details</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="invoice-details">
            <div className="detail-row">
              <span className="label">Invoice ID:</span>
              <span className="value">{invoice.id}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value badge">{invoice.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Quote ID:</span>
              <span className="value">{invoice.quoteId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Booking ID:</span>
              <span className="value">{invoice.bookingId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount:</span>
              <span className="value amount">L${invoice.totalAmount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Due Date:</span>
              <span className="value">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <h3>Bank Transfer Details</h3>
          <div className="bank-details">
            <p>
              <strong>Bank:</strong> {invoice.bankAccount}
            </p>
            <p>
              <strong>Account Name:</strong> {invoice.accountName}
            </p>
            <p>
              <strong>Account Number:</strong> {invoice.accountNumber}
            </p>
          </div>

          {invoice.quote && invoice.quote.lineItems && (
            <>
              <h3>Services from Quote</h3>
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
                  {invoice.quote.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>L${item.unitPrice.toLocaleString()}</td>
                      <td>L${item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {hasPaymentProof && (
            <div className="payment-proof-section">
              <h3>Payment Proof Uploaded</h3>
              {invoice.paymentProofs.map((proof, idx) => (
                <div key={idx} className="proof-item">
                  <p>
                    <strong>Receipt:</strong>{" "}
                    <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer">
                      View Receipt
                    </a>
                  </p>
                  <p>
                    <strong>Uploaded:</strong> {new Date(proof.uploadedAt).toLocaleDateString()}
                  </p>
                  {proof.verifiedAt && (
                    <p>
                      <strong>Verified:</strong> {new Date(proof.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                  {proof.verificationNotes && (
                    <p>
                      <strong>Notes:</strong> {proof.verificationNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {invoice.status === "GENERATED" && (
            <div className="action-section">
              <h3>Send to Client</h3>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              <button
                className="btn-primary"
                onClick={handleSendInvoice}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send Invoice"}
              </button>
            </div>
          )}

          {hasPaymentProof && invoice.status !== "PAID" && (
            <div className="verification-section">
              <h3>Verify Payment</h3>
              <textarea
                placeholder="Add verification notes (optional)"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows="3"
              />
              <div className="verification-actions">
                <button
                  className="btn-success"
                  onClick={() => handleVerifyPayment(true)}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "✓ Verify Payment"}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleVerifyPayment(false)}
                  disabled={verifying}
                >
                  {verifying ? "Rejecting..." : "✕ Reject Payment"}
                </button>
              </div>
            </div>
          )}

          {invoice.status === "PAID" && invoice.paidAt && (
            <div className="paid-confirmation">
              <h3>✓ Payment Confirmed</h3>
              <p>Paid on: {new Date(invoice.paidAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
