import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchBookings, updateBookingStatus } from "../../api/bookings";

const statuses = ["NEW", "ASSIGNED", "AWAITING_CLIENT", "COMPLETED"];

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expandedBooking, setExpandedBooking] = useState(null);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await fetchBookings();
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setErr("");
      setLoading(true);
      try {
        const data = await fetchBookings();
        if (mounted) setItems(data);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || "Failed to load bookings");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  async function onStatusChange(id, status) {
    await updateBookingStatus(id, status);
    await load();
  }

  function getStatusColor(status) {
    switch(status) {
      case "COMPLETED": return { bg: "#dcfce7", text: "#166534" };
      case "AWAITING_CLIENT": return { bg: "#fef3c7", text: "#92400e" };
      case "ASSIGNED": return { bg: "#dbeafe", text: "#0c4a6e" };
      case "NEW": return { bg: "#f3e8ff", text: "#581c87" };
      default: return { bg: "#f0f9ff", text: "#0c4a6e" };
    }
  }

  return (
    <AdminLayout title="Bookings">
      {err ? <div style={{ padding: 12, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12 }}>{err}</div> : null}

      <div style={{ marginTop: 12, background: "white", border: "1px solid #e5e7eb", borderRadius: 16 }}>
        <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
          {loading ? "Loading..." : `${items.length} booking(s)`}
        </div>

        <div style={{ padding: 14, display: "grid", gap: 12 }}>
          {items.map((b) => {
            const isExpanded = expandedBooking === b.id;
            const statusColor = getStatusColor(b.status);
            
            return (
              <div key={b.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, background: "#fafbfc", overflow: "hidden" }}>
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{b.clientName}</div>
                      <div style={{ fontSize: 11, background: "#ecfdf5", color: "#065f46", padding: "4px 8px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700 }}>{b.bookingRef}</div>
                    </div>
                    <div style={{ color: "#475569", fontSize: 14 }}>Service: <strong>{b.service?.title}</strong></div>
                  </div>
                  <select 
                    value={b.status} 
                    onChange={(e) => onStatusChange(b.id, e.target.value)} 
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontWeight: 700,
                      fontSize: 13,
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      cursor: "pointer",
                    }}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Contact Info */}
                <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
                  <div>📧 <b>Email:</b> {b.clientEmail}</div>
                  {b.clientPhone ? <div>📱 <b>Phone:</b> {b.clientPhone}</div> : null}
                  {b.assignedConsultant ? <div>👤 <b>Assigned to:</b> {b.assignedConsultant.name} ({b.assignedConsultant.title})</div> : <div style={{ color: "#dc2626" }}>⚠️ <b>Not assigned</b></div>}
                  <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                    📅 <b>Received:</b> {new Date(b.createdAt).toLocaleString()}
                  </div>
                  {b.clientConfirmEmailSent && <div style={{ fontSize: 12, color: "#059669" }}>✅ <b>Confirmation sent:</b> {new Date(b.clientConfirmEmailSent).toLocaleString()}</div>}
                </div>

                {/* Client Message */}
                {b.message ? (
                  <div style={{ marginBottom: 12, padding: "12px", background: "white", borderRadius: 8, borderLeft: "3px solid #1a8f6a" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>💬 Client Message:</div>
                    <div style={{ fontSize: 14, color: "#1e293b" }}>{b.message}</div>
                  </div>
                ) : null}

                {/* Toggle Notes Button */}
                <button
                  onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    transition: "all 0.2s",
                  }}
                >
                  {isExpanded ? "▼ Hide Notes" : "▶ Show Notes"}
                </button>

                {/* Notes Section */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>Internal Notes:</div>
                    {b.internalNotes ? (
                      <div style={{
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}>
                        {b.internalNotes}
                      </div>
                    ) : (
                      <div style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>No notes yet. Consultant will add notes when they contact the client.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && items.length === 0 ? (
            <div style={{ color: "#64748b" }}>No bookings yet.</div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
