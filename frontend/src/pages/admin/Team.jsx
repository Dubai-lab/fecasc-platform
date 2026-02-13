import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { fetchAllTeamAdmin, createTeamMember, updateTeamMember, deleteTeamMember } from "../../api/team";
import { fetchAllServicesAdmin } from "../../api/services";
import "./AdminForm.css";

export default function Team() {
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    credentials: "",
    bio: "",
    order: 0,
    email: "",
    password: "",
    confirmPassword: "",
    role: "PUBLIC",
    assignedServices: [],
    isPublic: true,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteTeamConfirm, setDeleteTeamConfirm] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        const [teamData, servicesData] = await Promise.all([
          fetchAllTeamAdmin(),
          fetchAllServicesAdmin()
        ]);
        console.log("Initial team load:", teamData);
        console.log("Services load:", servicesData);
        if (mounted) {
          setTeam(Array.isArray(teamData) ? teamData : []);
          setServices(Array.isArray(servicesData) ? servicesData : []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (mounted) {
          setTeam([]);
          setErrorMsg("Failed to load team: " + error.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadData();
    return () => { mounted = false; };
  }, []);

  const reloadTeam = async () => {
    try {
      const data = await fetchAllTeamAdmin();
      console.log("Team loaded:", data);
      if (Array.isArray(data)) {
        setTeam(data);
      } else {
        console.warn("Team data is not an array:", data);
        setTeam([]);
      }
    } catch (error) {
      console.error("Error loading team:", error);
      // Don't show alert - just log error and keep component rendered
      setErrorMsg("Failed to reload team members. Please refresh the page.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const submitData = { ...formData };
      if (imageFile) {
        submitData.image = imageFile;
      }

      console.log("Submitting team member:", submitData);

      if (editing) {
        await updateTeamMember(editing, submitData);
        setSuccessMsg("Team member updated successfully!");
      } else {
        const response = await createTeamMember(submitData);
        console.log("Create response:", response);
        setSuccessMsg("Team member added successfully!");
      }
      
      setFormData({
        name: "",
        title: "",
        credentials: "",
        bio: "",
        order: 0,
        email: "",
        password: "",
        confirmPassword: "",
        role: "PUBLIC",
        assignedServices: [],
        isPublic: true,
        isActive: true,
      });
      setImageFile(null);
      setImagePreview("");
      setEditing(null);
      
      // Wait a moment then reload
      setTimeout(reloadTeam, 500);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred";
      setErrorMsg(errorMessage);
    }
  };

  const handleEdit = (member) => {
    setEditing(member.id);
    setFormData({
      name: member.name,
      title: member.title,
      credentials: member.credentials || "",
      bio: member.bio || "",
      order: member.order || 0,
      email: member.email || "",
      password: "",
      confirmPassword: "",
      role: member.role || "PUBLIC",
      assignedServices: member.assignedServices || [],
      isPublic: member.isPublic !== undefined ? member.isPublic : true,
      isActive: member.isActive !== undefined ? member.isActive : true,
    });
    setImageFile(null);
    setImagePreview(member.imageUrl || "");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleDelete = (member) => {
    setDeleteTeamConfirm(member);
  };

  const confirmDeleteTeam = async () => {
    try {
      await deleteTeamMember(deleteTeamConfirm.id);
      setSuccessMsg("Team member deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      setDeleteTeamConfirm(null);
      await reloadTeam();
    } catch (error) {
      setErrorMsg("Error: " + error.message);
      setDeleteTeamConfirm(null);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: "",
      title: "",
      credentials: "",
      bio: "",
      order: 0,
      email: "",
      password: "",
      confirmPassword: "",
      role: "PUBLIC",
      assignedServices: [],
      isPublic: true,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1>Team Management</h1>
        <p className="admin-page__subtitle">Add, edit, and manage team members</p>

        {/* Form Section */}
        <div className="form-card">
          <h2>{editing ? "Edit Team Member" : "Add New Team Member"}</h2>
          
          {successMsg && (
            <div className="alert alert--success" style={{ marginBottom: "20px" }}>
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert--error" style={{ marginBottom: "20px" }}>
              ✗ {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="admin-form">
            {/* Basic Information */}
            <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "700" }}>Basic Information</h3>
              
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Emmanuel T. Flomo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Founder & CEO"
                  required
                />
              </div>

              <div className="form-group">
                <label>Credentials</label>
                <input
                  type="text"
                  name="credentials"
                  value={formData.credentials}
                  onChange={handleInputChange}
                  placeholder="e.g., BSc. Environmental Science • MSc"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief biography..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="image-preview" style={{ marginTop: "12px" }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Order (Position)</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            {/* Staff/Consultant Information */}
            <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "700" }}>Staff/Consultant Access (Optional)</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>Leave email and password empty if this is a public team member only</p>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="consultant@company.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="PUBLIC">Public (Website Only)</option>
                  <option value="STAFF">Staff (Can Login)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign Services *</label>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "12px" }}>Select which services this staff member manages</p>
                <div style={{ display: "grid", gap: "8px", maxHeight: "200px", overflowY: "auto", border: "1px solid #e5e7eb", padding: "12px", borderRadius: "8px" }}>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <label key={service.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={formData.assignedServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                assignedServices: [...prev.assignedServices, service.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                assignedServices: prev.assignedServices.filter(id => id !== service.id)
                              }));
                            }
                          }}
                        />
                        <span>{service.title}</span>
                      </label>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "12px" }}>No services available. Create services first.</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <span>Show on "Our Team" page</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                {editing ? "Update Member" : "Add Member"}
              </button>
              {editing && (
                <button type="button" onClick={handleCancel} className="btn btn--outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Team Members List */}
        <div className="form-card">
          <h2>Team Members ({team.length})</h2>
          
          {loading ? (
            <p style={{ color: "var(--muted)" }}>Loading team members...</p>
          ) : team.length > 0 ? (
            <div className="team-list">
              {team.map((member) => {
                const imageUrl = member.imageUrl ? `http://localhost:5000${member.imageUrl}` : null;
                return (
                  <div key={member.id} className="team-item">
                    {imageUrl && (
                      <img src={imageUrl} alt={member.name} className="team-item__image" />
                    )}
                    <div className="team-item__content">
                      <h3>{member.name}</h3>
                      <div className="team-item__title">{member.title}</div>
                      {member.credentials && (
                        <div className="team-item__creds">{member.credentials}</div>
                      )}
                      {member.bio && (
                        <p className="team-item__bio">{member.bio}</p>
                      )}
                      <div className="team-item__meta">
                        Order: {member.order} • Status: {member.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <div className="team-item__actions">
                      <button
                        onClick={() => handleEdit(member)}
                        className="btn btn--outline"
                        style={{ padding: "6px 12px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="btn btn--danger"
                        style={{ padding: "6px 12px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--muted)" }}>No team members yet. Add your first team member above.</p>
          )}
        </div>

        <DeleteConfirmModal 
          item={deleteTeamConfirm}
          itemName="Team Member"
          onConfirm={confirmDeleteTeam}
          onCancel={() => setDeleteTeamConfirm(null)}
        />
      </div>
    </AdminLayout>
  );
}
