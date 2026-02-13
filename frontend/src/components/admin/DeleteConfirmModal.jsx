export default function DeleteConfirmModal({ item, itemName, onConfirm, onCancel, isLoading }) {
  if (!item) return null;

  return (
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
        borderRadius: 14,
        padding: 32,
        maxWidth: 450,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>⚠️</div>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 20, fontWeight: 900, textAlign: "center" }}>
          Delete {itemName}?
        </h2>
        <p style={{ marginBottom: 24, fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
          Are you sure you want to permanently delete <strong>"{item.title || item.name}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
              fontSize: 14,
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.background = "#991b1b";
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.target.style.background = "#dc2626";
            }}
          >
            {isLoading ? "Deleting..." : "🗑️ Yes, Delete"}
          </button>
          <button 
            onClick={onCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              padding: "12px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
              fontSize: 14,
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.target.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.target.style.background = "#f3f4f6";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
