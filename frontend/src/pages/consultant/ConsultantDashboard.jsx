import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, getConsultantProfile, logoutConsultant } from "../../api/consultant";
import { logoutAdmin } from "../../api/auth";
import * as quotesApi from "../../api/quotes";
import * as invoicesApi from "../../api/invoices";
import http from "../../api/http";
import "./ConsultantDashboard.css";

const statusColors = {
  NEW: "#f0f9ff",
  ASSIGNED: "#dbeafe",
  AWAITING_CLIENT: "#fef3c7",
  COMPLETED: "#dcfce7",
};

const statusTextColors = {
  NEW: "#0c4a6e",
  ASSIGNED: "#0369a1",
  AWAITING_CLIENT: "#92400e",
  COMPLETED: "#166534",
};

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoiceSummary, setInvoiceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [contactMethod, setContactMethod] = useState("WHATSAPP");
  const [addingNote, setAddingNote] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const profile = getConsultantProfile();
    if (!profile) {
      navigate("/admin/login");
      return;
    }
    setConsultant(profile);
    loadBookings();
    loadQuotes();
    loadRevenue();
  }, [navigate]);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      const data = await quotesApi.getAllQuotes();
      setQuotes(data);
    } catch (err) {
      console.error("Failed to load quotes", err);
    }
  };

  const loadRevenue = async () => {
    try {
      const data = await invoicesApi.getDashboardSummary();
      setInvoiceSummary(data);
    } catch (err) {
      console.error("Failed to load revenue summary", err);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBooking || !newNote.trim()) return;

    setAddingNote(true);
    try {
      await http.patch(`/bookings/${selectedBooking.id}/notes`, { note: newNote, contactMethod });
      setShowNoteModal(false);
      setSelectedBooking(null);
      setNewNote("");
      setContactMethod("WHATSAPP");
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleLogout = () => {
    logoutConsultant();
    logoutAdmin();
    navigate("/admin/login");
  };

  // Calculate statistics
  const stats = {
    total: bookings.length,
    awaiting: bookings.filter(b => b.status === "ASSIGNED" || b.status === "NEW").length,
    inProgress: bookings.filter(b => b.status === "AWAITING_CLIENT").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    quotesTotal: quotes.length,
    quotesApproved: quotes.filter(q => q.status === "APPROVED").length,
    totalRevenue: invoiceSummary?.totalRevenue || 0,
    totalInvoices: invoiceSummary?.totalInvoices || 0,
    quotesPending: quotes.filter(q => q.status === "SENT" || q.status === "VIEWED").length,
  };

  // Filter bookings based on selected status
  const filteredBookings = filterStatus === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!consultant) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div className="consultant-dashboard">
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #0b3d2e, #11624a)",
        color: "white",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900" }}>👤 {consultant.name}</h1>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px" }}>{consultant.title}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            padding: "10px 16px",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.2)";
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: 0, background: "#f8fafc", minHeight: "calc(100vh - 80px)" }}>
        
        {/* Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0b3d2e 0%, #1a8f6a 100%)",
          color: "white",
          padding: "40px 24px",
          marginBottom: "32px",
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "900" }}>
                {getGreeting()}, {consultant.name} 👋
              </h1>
              <p style={{ margin: 0, opacity: 0.95, fontSize: "15px" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.awaiting}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Needing Action</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.inProgress}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Waiting for Clients</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.completed}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Completed</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.quotesPending}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Pending Quotes</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.quotesApproved}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Approved Quotes</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>{stats.total}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Total Bookings</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>L${(stats.totalRevenue || 0).toLocaleString()}</div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px 40px 24px" }}>
          
          {/* Helpful Tips */}
          {stats.awaiting > 0 && (
            <div style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "1px solid #fcd34d",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}>
              <div style={{ fontSize: "20px", marginTop: "2px" }}>⏱️</div>
              <div>
                <div style={{ fontWeight: "700", color: "#78350f", marginBottom: "4px" }}>Action Required!</div>
                <div style={{ fontSize: "13px", color: "#92400e" }}>
                  You have <strong>{stats.awaiting}</strong> client {stats.awaiting === 1 ? 'inquiry' : 'inquiries'} waiting for your response. Reach out to them today to move projects forward!
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <a href="/consultant/quotes" style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(22, 163, 74, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ fontSize: "24px" }}>📄</div>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>Manage Quotes</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>{stats.quotesTotal} total • {stats.quotesPending} pending</div>
            </a>
            <a href="/consultant/invoices" style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(22, 163, 74, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ fontSize: "24px" }}>💰</div>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>View Invoices</div>
              <div style={{ fontSize: "12px", opacity: 0.9 }}>Track your revenue</div>
            </a>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFilterStatus("ALL")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: filterStatus === "ALL" ? "#1a8f6a" : "white",
                color: filterStatus === "ALL" ? "white" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus("NEW")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: filterStatus === "NEW" ? "#dbeafe" : "white",
                color: filterStatus === "NEW" ? "#0369a1" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📭 New ({bookings.filter(b => b.status === "NEW").length})
            </button>
            <button
              onClick={() => setFilterStatus("ASSIGNED")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: filterStatus === "ASSIGNED" ? "#dbeafe" : "white",
                color: filterStatus === "ASSIGNED" ? "#0369a1" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📬 Assigned ({bookings.filter(b => b.status === "ASSIGNED").length})
            </button>
            <button
              onClick={() => setFilterStatus("AWAITING_CLIENT")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: filterStatus === "AWAITING_CLIENT" ? "#fef3c7" : "white",
                color: filterStatus === "AWAITING_CLIENT" ? "#92400e" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ⏳ Waiting for Client ({bookings.filter(b => b.status === "AWAITING_CLIENT").length})
            </button>
            <button
              onClick={() => setFilterStatus("COMPLETED")}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: filterStatus === "COMPLETED" ? "#dcfce7" : "white",
                color: filterStatus === "COMPLETED" ? "#166534" : "#475569",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ✅ Completed ({bookings.filter(b => b.status === "COMPLETED").length})
            </button>
          </div>

          {/* Bookings List */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "900", color: "#1f2937" }}>
              📋 {filterStatus === "ALL" ? "All" : filterStatus} Client Inquiries
            </h2>

            {error && (
              <div style={{
                background: "#fee2e2",
                border: "1px solid #fecdd3",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "60px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
                Loading your client inquiries...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "60px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                {filterStatus === "ALL" ? "No client inquiries yet. Check back soon!" : `No ${filterStatus.toLowerCase()} inquiries at the moment.`}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#fafbfc",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                   e.currentTarget.style.borderColor = "#0369a1";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#1f2937" }}>
                          {booking.clientName}
                        </h3>
                        <div style={{ fontSize: 11, background: "#ecfdf5", color: "#065f46", padding: "4px 8px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700 }}>
                          {booking.bookingRef}
                        </div>
                      </div>
                      <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                        📌 {booking.service?.title}
                      </p>
                    </div>
                    <div style={{
                      background: statusColors[booking.status],
                      color: statusTextColors[booking.status],
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}>
                      {booking.status}
                    </div>
                  </div>

                  <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "12px", paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
                    <div>📧 <b>Email:</b> {booking.clientEmail}</div>
                    {booking.clientPhone && <div>📱 <b>Phone:</b> {booking.clientPhone}</div>}
                    {booking.message && (
                      <div style={{ marginTop: "8px", padding: "8px 12px", background: "white", borderRadius: "6px", borderLeft: "3px solid #0369a1" }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>💬 Client Message:</div>
                        "{booking.message}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: 12 }}>
                    <button
                      onClick={() => {
                        const text = `${booking.clientName}\nEmail: ${booking.clientEmail}\nPhone: ${booking.clientPhone || "N/A"}\nService: ${booking.service?.title}\nMessage: ${booking.message || "No message"}`;
                        navigator.clipboard.writeText(text);
                        alert("Client details copied!");
                      }}
                      style={{
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      📋 Copy Details
                    </button>

                    {(booking.status === "NEW" || booking.status === "ASSIGNED") && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowNoteModal(true);
                          setNewNote("");
                        }}
                        style={{
                          background: "#0369a1",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => (e.target.style.background = "#0c4a9e")}
                        onMouseOut={(e) => (e.target.style.background = "#0369a1")}
                      >
                        ✍️ Log Contact
                      </button>
                    )}
                  </div>

                  {booking.internalNotes && (
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>📝 Contact History:</div>
                      <div style={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: 10,
                        fontSize: 12,
                        color: "#475569",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}>
                        {booking.internalNotes}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    📅 Received: {new Date(booking.createdAt).toLocaleDateString()}
                    {booking.consultantRepliedAt && ` • First Contact: ${new Date(booking.consultantRepliedAt).toLocaleDateString()}`}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Note Modal */}
      {showNoteModal && selectedBooking && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", fontWeight: "900" }}>
              ✍️ Log Client Contact
            </h2>
            <p style={{ color: "#64748b", marginBottom: "16px" }}>
              Client: <b>{selectedBooking.clientName}</b>
            </p>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16, background: "#f0f9ff", padding: 10, borderRadius: 6, borderLeft: "3px solid #0c4a6e" }}>
              Add a note about your contact with the client (when you called, what was discussed, next steps, etc). This helps track the project progress.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
                How did you contact them?
              </label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="WHATSAPP">💬 WhatsApp</option>
                <option value="EMAIL">📧 Email</option>
                <option value="PHONE">☎️ Phone Call</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
                Contact Note
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="E.g., Called client on 13-Feb, discussed project scope. They approved initial quote. Will visit site on 15-Feb to finalize details."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  minHeight: "100px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                style={{
                  flex: 1,
                  background: "#1a8f6a",
                  color: "white",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: addingNote ? "wait" : "pointer",
                  opacity: addingNote ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!addingNote) e.target.style.background = "#0c4a9e";
                }}
                onMouseOut={(e) => {
                  if (!addingNote) e.target.style.background = "#0369a1";
                }}
              >
                {addingNote ? "Saving..." : "✓ Save Note & Mark Progress"}
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedBooking(null);
                  setNewNote("");
                  setContactMethod("WHATSAPP");
                }}
                disabled={addingNote}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
