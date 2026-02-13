import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { createService, fetchAllServicesAdmin, updateService, deleteService } from "../../api/services";

export default function Services() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function load() {
    setErr("");
    try {
      const data = await fetchAllServicesAdmin();
      setItems(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load services");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setErr("");
      try {
        const data = await fetchAllServicesAdmin();
        if (mounted) setItems(data);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || "Failed to load services");
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    setErr("");
    try {
      await createService({ title, description: desc, isActive: true });
      setTitle("");
      setDesc("");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create service");
    }
  }

  async function toggleActive(s) {
    await updateService(s.id, { isActive: !s.isActive });
    await load();
  }

  async function handleEdit(s) {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditDesc(s.description || "");
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) {
      setErr("Title cannot be empty");
      return;
    }
    setErr("");
    try {
      await updateService(editingId, { title: editTitle, description: editDesc });
      setEditingId(null);
      setEditTitle("");
      setEditDesc("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update service");
    }
  }

  async function handleDelete(s) {
    setDeleteConfirm(s);
  }

  async function confirmDelete() {
    setErr("");
    try {
      await deleteService(deleteConfirm.id);
      setDeleteConfirm(null);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete service");
      setDeleteConfirm(null);
    }
  }

  return (
    <AdminLayout title="Services">
      {err ? <div style={{ padding: 12, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, color: "#991b1b", fontWeight: 700 }}>{err}</div> : null}

      <div style={{ marginTop: 12, background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18 }}>
        <div style={{ fontWeight: 900, marginBottom: 16, fontSize: 16 }}>➕ Add New Service</div>
        <form onSubmit={onAdd} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Service Title *</label>
            <input 
              placeholder="E.g., Environmental Impact Assessment" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Description (Optional)</label>
            <input 
              placeholder="Brief description of the service" 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "inherit" }}
            />
          </div>
          <button className="btnPrimary" type="submit" style={{ marginTop: 4 }}>Add Service</button>
        </form>
      </div>

      <div style={{ marginTop: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 16 }}>
        <div style={{ padding: 18, borderBottom: "1px solid #e5e7eb", fontWeight: 900, fontSize: 16 }}>
          📋 Services ({items.length})
        </div>
        <div style={{ padding: 12, display: "grid", gap: 12 }}>
          {items.map((s) => (
            <div key={s.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: s.isActive ? "#fafbfc" : "#f5f5f5", opacity: s.isActive ? 1 : 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>{s.description || "No description"}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                    Status: <span style={{ fontWeight: 700, color: s.isActive ? "#166534" : "#991b1b" }}>
                      {s.isActive ? "🟢 Active" : "🔴 Inactive"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button 
                    className="btn" 
                    onClick={() => handleEdit(s)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: "white",
                      color: "#0f172a",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => toggleActive(s)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid",
                      borderColor: s.isActive ? "#e5e7eb" : "#fecdd3",
                      background: s.isActive ? "white" : "#fff1f2",
                      color: s.isActive ? "#0f172a" : "#991b1b",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => handleDelete(s)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #fecdd3",
                      background: "#fff1f2",
                      color: "#991b1b",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>
              No services added yet. Create one above to get started!
            </div>
          )}
        </div>
      </div>

      {editingId && (
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
            padding: 24,
            maxWidth: 500,
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 900 }}>
              ✏️ Edit Service
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Service Title *</label>
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)} 
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Description (Optional)</label>
              <input 
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={handleSaveEdit}
                className="btnPrimary"
                style={{ flex: 1 }}
              >
                Save Changes
              </button>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setEditTitle("");
                  setEditDesc("");
                }}
                style={{
                  flex: 1,
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <DeleteConfirmModal 
          item={deleteConfirm}
          itemName="Service"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </AdminLayout>
  );
}
