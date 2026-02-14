import React, { useState, useEffect } from "react";
import ConsultantLayout from "../../components/consultant/ConsultantLayout";
import * as invoicesApi from "../../api/invoices";
import "../admin/Invoices.css";

export default function ConsultantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

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
      setSummary(response || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const filteredInvoices = filterStatus === "ALL"
    ? invoices
    : invoices.filter((inv) => inv.status === filterStatus);

  return (
    <ConsultantLayout title="My Invoices">
      <div className="invoices-container">
        <div className="invoices-header">
          <h1>💰 My Invoices</h1>
        </div>

        {/* Summary Grid */}
        <div className="summary-grid">
          <div className="summary-card total-revenue">
            <h3>Total Revenue</h3>
            <p className="amount">L${(summary.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="summary-card pending-revenue">
            <h3>Pending Revenue</h3>
            <p className="amount">L${(summary.pendingRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="summary-card overdue-revenue">
            <h3>Overdue Revenue</h3>
            <p className="amount">L${(summary.overdueRevenue || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="invoices-filter">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Invoices</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="no-invoices">No invoices found</div>
        ) : (
          <div className="invoices-grid">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="invoice-card" onClick={() => setSelectedInvoice(invoice)}>
                <div className="invoice-card-header">
                  <h3>Invoice #{invoice.invoiceNumber}</h3>
                  <span className="status-badge" style={{
                    background: invoice.status === "PAID" ? "#dcfce7" :
                               invoice.status === "SENT" ? "#dbeafe" :
                               invoice.status === "OVERDUE" ? "#fee2e2" : "#f3f4f6",
                    color: invoice.status === "PAID" ? "#166534" :
                           invoice.status === "SENT" ? "#0369a1" :
                           invoice.status === "OVERDUE" ? "#991b1b" : "#374151",
                  }}>
                    {invoice.status}
                  </span>
                </div>
                <div className="invoice-card-body">
                  <p><strong>Quote ID:</strong> {invoice.quoteId?.slice(0, 8)}</p>
                  <p><strong>Total:</strong> L${invoice.totalAmount.toLocaleString()}</p>
                  <p><strong>Items:</strong> {invoice.lineItems?.length || 0}</p>
                </div>
                <div className="invoice-created">Created: {new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {selectedInvoice && <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      </div>
    </ConsultantLayout>
  );
}

function InvoiceDetailModal({ invoice, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invoice #{invoice.invoiceNumber}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="invoice-details">
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value badge">{invoice.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Quote ID:</span>
              <span className="value">{invoice.quoteId?.slice(0, 8)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount:</span>
              <span className="value amount">L${invoice.totalAmount.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Paid Amount:</span>
              <span className="value amount">L${(invoice.paidAmount || 0).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Outstanding:</span>
              <span className="value amount">L${(invoice.totalAmount - (invoice.paidAmount || 0)).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Created:</span>
              <span className="value">{new Date(invoice.createdAt).toLocaleDateString()}</span>
            </div>
            {invoice.dueDate && (
              <div className="detail-row">
                <span className="label">Due Date:</span>
                <span className="value">{new Date(invoice.dueDate).toLocaleDateString()}</span>
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
                {invoice.lineItems?.map((item, idx) => (
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

          {invoice.notes && (
            <div className="notes-section">
              <h4>Notes</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          {invoice.paymentProofs && invoice.paymentProofs.length > 0 && (
            <div className="payment-proof-section">
              <h3>Payment Proofs</h3>
              {invoice.paymentProofs.map((proof, idx) => (
                <div key={idx} className="proof-item">
                  <p><strong>Amount:</strong> L${proof.amount.toLocaleString()}</p>
                  <p><strong>Date:</strong> {new Date(proof.uploadedAt).toLocaleDateString()}</p>
                  {proof.proofUrl && <p><a href={proof.proofUrl} target="_blank" rel="noopener noreferrer">View Proof</a></p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
