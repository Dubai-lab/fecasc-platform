import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import * as blogApi from "../../api/blog.js";
import "./Blog.css";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [imageError, setImageError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    tags: "",
    metaDescription: "",
    featuredImageUrl: "",
    status: "DRAFT",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        blogApi.getAllBlogPosts(1, 100),
        blogApi.getBlogCategories(),
      ]);
      console.log("Loaded posts:", postsData);
      console.log("Loaded categories:", categoriesData);
      setPosts(postsData.posts || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Failed to load blog data:", err);
      setFormError("Failed to load blog data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setFormError("");
    setImageError("");
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      categoryId: "",
      tags: "",
      metaDescription: "",
      featuredImageUrl: "",
      status: "DRAFT",
    });
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormError("");
    setImageError("");
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categoryId: post.categoryId,
      tags: post.tags.join(", "),
      metaDescription: post.metaDescription || "",
      featuredImageUrl: post.featuredImageUrl || "",
      status: post.status || "DRAFT",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset image error when URL changes so it can re-validate
    if (name === "featuredImageUrl") {
      setImageError("");
    }
  };

  const handleCategoryChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate required fields
    if (!formData.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!formData.categoryId) {
      setFormError("Please select a category");
      return;
    }
    if (!formData.excerpt.trim()) {
      setFormError("Excerpt is required");
      return;
    }
    if (!formData.content.trim()) {
      setFormError("Content is required");
      return;
    }

    try {
      setSubmitting(true);
      const data = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map(t => t.trim().toLowerCase())
          .filter(t => t),
      };

      console.log("Sending blog post data:", data);

      if (editingPost) {
        await blogApi.updateBlogPost(editingPost.id, data);
      } else {
        const result = await blogApi.createBlogPost(data);
        console.log("Blog post created successfully:", result);
      }

      setShowModal(false);
      setFormError("");
      await loadData();
    } catch (err) {
      console.error("Failed to save post:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Error saving post. Please try again.";
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await blogApi.createBlogCategory(categoryForm);
      setCategoryForm({ name: "", description: "" });
      setShowCategoryModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create category:", err);
      alert(err.response?.data?.message || "Error creating category");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (post) => {
    try {
      const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await blogApi.updateBlogPost(post.id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error("Failed to update post status:", err);
      alert("Error updating post status");
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await blogApi.deleteBlogPost(deleteConfirmId);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Error deleting post");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-blog">
        <div className="page-header">
          <h1>Blog Management</h1>
          <div className="header-actions">
            <button onClick={handleAddNew} className="btn btn-primary">
              + New Post
            </button>
            <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary">
              + Category
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading blog posts...</div>
        ) : (
          <div className="blog-content">
            <div className="posts-section">
              <h2>Blog Posts</h2>
              <div className="posts-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Published</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id}>
                        <td className="title-cell">{post.title}</td>
                        <td>{post.category?.name}</td>
                        <td>{post.author?.name}</td>
                        <td>
                          <span className={`status-badge ${post.status.toLowerCase()}`}>
                            {post.status}
                          </span>
                        </td>
                        <td>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{post.viewCount}</td>
                        <td className="actions-cell">
                          <button
                            className="icon-btn edit"
                            onClick={() => handleEdit(post)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className={`icon-btn ${post.status === "PUBLISHED" ? "unpublish" : "publish"}`}
                            onClick={() => handlePublish(post)}
                            title={post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          >
                            {post.status === "PUBLISHED" ? "📤" : "📥"}
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDelete(post.id)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="categories-section">
              <h2>Categories</h2>
              <div className="categories-list">
                {categories.map(cat => (
                  <div key={cat.id} className="category-item">
                    <div>
                      <h4>{cat.name}</h4>
                      {cat.description && <p>{cat.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Post Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingPost ? "Edit Post" : "New Blog Post"}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmitPost} className="post-form">
                {formError && <div className="error-message">{formError}</div>}

                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Featured Image URL</label>
                    <input
                      type="url"
                      name="featuredImageUrl"
                      value={formData.featuredImageUrl}
                      onChange={handleChange}
                      placeholder="https://res.cloudinary.com/..."
                    />
                    {formData.featuredImageUrl && (
                      <div className="image-preview-container">
                        {imageError ? (
                          <div className="image-error">
                            ❌ Invalid image URL or image cannot be accessed
                          </div>
                        ) : (
                          <div className="image-preview">
                            <img 
                              src={formData.featuredImageUrl} 
                              alt="Preview" 
                              onLoad={() => setImageError("")}
                              onError={() => setImageError("failed")}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Excerpt *</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Content (HTML) *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="8"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="environmental, compliance, sustainability"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Meta Description (SEO)</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : (editingPost ? "Update Post" : "Create Post")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Category</h2>
                <button className="close-btn" onClick={() => setShowCategoryModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmitCategory} className="category-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCategoryModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Blog Post</h2>
                <button className="close-btn" onClick={() => setDeleteConfirmId(null)}>×</button>
              </div>
              <div className="confirmation-content">
                <p>Are you sure you want to delete this post?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
