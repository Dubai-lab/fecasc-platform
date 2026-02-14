import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import * as blogApi from "../../api/blog.js";
import "./Comments.css";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, all
  const [approveConfirmId, setApproveConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAllComments();
      setComments(data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    setApproveConfirmId(id);
  };

  const confirmApprove = async () => {
    const comment = comments.find(c => c.id === approveConfirmId);
    if (!comment) return;

    try {
      await blogApi.approveComment(approveConfirmId, !comment.isApproved);
      setApproveConfirmId(null);
      loadComments();
    } catch (err) {
      console.error("Failed to approve comment:", err);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    try {
      await blogApi.deleteComment(deleteConfirmId);
      setDeleteConfirmId(null);
      loadComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const getFilteredComments = () => {
    if (filter === "pending") return comments.filter(c => !c.isApproved);
    if (filter === "approved") return comments.filter(c => c.isApproved);
    return comments;
  };

  const filteredComments = getFilteredComments();

  return (
    <AdminLayout>
      <div className="admin-comments">
        <div className="page-header">
          <h1>Blog Comments</h1>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({comments.filter(c => !c.isApproved).length})
            </button>
            <button
              className={`filter-btn ${filter === "approved" ? "active" : ""}`}
              onClick={() => setFilter("approved")}
            >
              Approved ({comments.filter(c => c.isApproved).length})
            </button>
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({comments.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading comments...</div>
        ) : filteredComments.length === 0 ? (
          <div className="no-comments">
            <p>
              {filter === "pending" && "No pending comments"}
              {filter === "approved" && "No approved comments"}
              {filter === "all" && "No comments yet"}
            </p>
          </div>
        ) : (
          <div className="comments-list">
            {filteredComments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-info">
                    <h4>{comment.authorName}</h4>
                    <p className="email">{comment.authorEmail}</p>
                    <p className="meta">
                      on <strong>{comment.post?.title}</strong> •{" "}
                      {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="comment-status">
                    {comment.isApproved ? (
                      <span className="badge approved">✓ Approved</span>
                    ) : (
                      <span className="badge pending">⏳ Pending</span>
                    )}
                  </div>
                </div>

                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>

                <div className="comment-actions">
                  <button
                    className={`action-btn ${comment.isApproved ? "unapprove" : "approve"}`}
                    onClick={() => handleApprove(comment.id)}
                    title={comment.isApproved ? "Unapprove" : "Approve"}
                  >
                    {comment.isApproved ? "❌ Unapprove" : "✓ Approve"}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(comment.id)}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approve Confirmation Modal */}
        {approveConfirmId && (
          <div className="modal-overlay" onClick={() => setApproveConfirmId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Approve Comment</h2>
                <button className="close-btn" onClick={() => setApproveConfirmId(null)}>×</button>
              </div>
              <div className="confirmation-content">
                <p>
                  {comments.find(c => c.id === approveConfirmId)?.isApproved
                    ? "Unapprove this comment?"
                    : "Approve this comment?"}
                </p>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setApproveConfirmId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmApprove}
                >
                  {comments.find(c => c.id === approveConfirmId)?.isApproved
                    ? "Unapprove"
                    : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Comment</h2>
                <button className="close-btn" onClick={() => setDeleteConfirmId(null)}>×</button>
              </div>
              <div className="confirmation-content">
                <p>Are you sure you want to delete this comment?</p>
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
                  Delete Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
