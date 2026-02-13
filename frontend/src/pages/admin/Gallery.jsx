import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import {
  fetchGalleryByCategory,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../../api/gallery";
import "../common/Gallery.css";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("projects");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteImageConfirm, setDeleteImageConfirm] = useState(null);

  const categories = [
    { id: "projects", label: "📸 Projects Gallery", description: "EIA assessments, completed projects, environmental audits" },
    { id: "worksite", label: "🏗️ Worksite Gallery", description: "Field work, construction sites, implementation photos" },
    { id: "services", label: "💼 Services Gallery", description: "Training sessions, solar installations, consulting work" },
  ];

  // Load images when category changes
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const data = await fetchGalleryByCategory(activeCategory);
        setImages(data);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [activeCategory]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryByCategory(activeCategory);
      setImages(data);
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile && !editingId) {
      alert("Please select an image to upload");
      return;
    }

    setUploading(true);
    try {
      if (editingId) {
        // Update existing image
        await updateGalleryImage(editingId, {
          title: formData.title || null,
          description: formData.description || null,
          order: formData.order,
        });
        setEditingId(null);
      } else {
        // Upload new image
        const uploadFormData = new FormData();
        uploadFormData.append("category", activeCategory);
        uploadFormData.append("title", formData.title || "");
        uploadFormData.append("description", formData.description || "");
        uploadFormData.append("order", formData.order);
        uploadFormData.append("image", selectedFile);

        await uploadGalleryImage(uploadFormData);
        setSelectedFile(null);
      }

      setFormData({ title: "", description: "", order: 0 });
      setSuccessMessage(
        editingId
          ? "Image updated successfully!"
          : "Image uploaded successfully!"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      loadImages();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to " + (editingId ? "update" : "upload") + " image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image) => {
    setEditingId(image.id);
    setFormData({
      title: image.title || "",
      description: image.description || "",
      order: image.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", order: 0 });
  };

  const handleDelete = (image) => {
    setDeleteImageConfirm(image);
  };

  const confirmDeleteImage = async () => {
    try {
      await deleteGalleryImage(deleteImageConfirm.id);
      setSuccessMessage("Image deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteImageConfirm(null);
      loadImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
      setDeleteImageConfirm(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-gallery-container">
        <h1>📁 Gallery Manager</h1>
        <p className="subtitle">Manage your project, worksite, and service gallery images</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="gallery-content">
          {/* Upload Form */}
          <div className="upload-section">
            <h2>{editingId ? "Edit Image" : "Upload New Image"}</h2>
            <p className="form-description">
              {categories.find((c) => c.id === activeCategory)?.description}
            </p>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Image Title (Optional)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Solar Installation Project"
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Add details about this image"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {!editingId && (
                <div className="form-group">
                  <label>Image File *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile && (
                    <p className="file-selected">
                      ✓ {selectedFile.name}
                    </p>
                  )}
                </div>
              )}

              <div className="form-buttons">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading
                    ? "Processing..."
                    : editingId
                    ? "Update Image"
                    : "Upload Image"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-secondary"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Images List */}
          <div className="images-section">
            <h2>
              {activeCategory === "projects"
                ? "📸 Projects"
                : activeCategory === "worksite"
                ? "🏗️ Worksites"
                : "💼 Services"}{" "}
              ({images.length})
            </h2>

            {loading ? (
              <div className="loading">Loading images...</div>
            ) : images.length > 0 ? (
              <div className="images-grid">
                {images.map((image) => (
                  <div key={image.id} className="image-card">
                    <div className="image-wrapper">
                      <img
                        src={`http://localhost:5000${image.imageUrl}`}
                        alt={image.title || "Gallery image"}
                      />
                    </div>
                    <div className="image-info">
                      {image.title && <h3>{image.title}</h3>}
                      {image.description && <p>{image.description}</p>}
                      <div className="image-meta">
                        <span>Order: {image.order}</span>
                        <span className={image.isActive ? "active" : "inactive"}>
                          {image.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="image-actions">
                      <button
                        onClick={() => handleEdit(image)}
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image)}
                        className="btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No images in this category yet. Upload one to get started!</p>
              </div>
            )}
          </div>
        </div>

        <DeleteConfirmModal 
          item={deleteImageConfirm}
          itemName="Image"
          onConfirm={confirmDeleteImage}
          onCancel={() => setDeleteImageConfirm(null)}
        />
      </div>
    </AdminLayout>
  );
}
