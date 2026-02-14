import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { getBlogPostBySlug, getPostComments, createComment } from "../api/blog.js";
import "./BlogPost.css";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState("");
  const [commentForm, setCommentForm] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await getBlogPostBySlug(slug);
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
        
        // Load comments for this post
        const postComments = await getPostComments(data.post.id);
        setComments(postComments || []);
      } catch (err) {
        setError("Failed to load blog post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.authorName.trim() || !commentForm.authorEmail.trim() || !commentForm.content.trim()) {
      setError("Please fill in all comment fields");
      return;
    }

    try {
      setCommentSubmitting(true);
      await createComment(post.id, {
        authorName: commentForm.authorName.trim(),
        authorEmail: commentForm.authorEmail.trim(),
        content: commentForm.content.trim(),
      });
      
      setCommentForm({ authorName: "", authorEmail: "", content: "" });
      setCommentSuccess("Thank you! Your comment has been submitted for approval.");
      setTimeout(() => setCommentSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-container">
        <div className="error">{error || "Article not found"}</div>
        <button onClick={() => navigate("/blog")} className="back-btn">
          ← Back to Blog
        </button>
      </div>
    );
  }

  const publishDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="blog-post-container">
      <Navbar />
      <button onClick={() => navigate("/blog")} className="back-btn">
        ← Back to Blog
      </button>

      <article className="blog-post">
        {post.featuredImageUrl && (
          <div className="featured-image">
            <img src={post.featuredImageUrl} alt={post.title} />
          </div>
        )}

        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-meta">
            <span className="category-tag" style={{ backgroundColor: "#0b3d2e" }}>
              {post.category?.name}
            </span>
            <span className="meta-info">
              By <strong>{post.author?.name}</strong> • {publishDate}
            </span>
            <span className="views">{post.viewCount} views</span>
          </div>

          {post.metaDescription && (
            <p className="post-excerpt">{post.metaDescription}</p>
          )}
        </div>

        <div className="post-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <strong>Tags:</strong>
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="post-footer">
          <div className="author-info">
            <h4>About the Author</h4>
            <p><strong>{post.author?.name}</strong></p>
            <p>{post.author?.email}</p>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h3>Related Articles</h3>
          <div className="related-grid">
            {relatedPosts.map((relPost) => (
              <div key={relPost.id} className="related-card" onClick={() => navigate(`/blog/${relPost.slug}`)}>
                {relPost.featuredImageUrl && (
                  <img src={relPost.featuredImageUrl} alt={relPost.title} />
                )}
                <div className="related-content">
                  <h4>{relPost.title}</h4>
                  <p>{relPost.excerpt}</p>
                  <small>{relPost.category?.name}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>

        {/* Comment Form */}
        <div className="comment-form-wrapper">
          <h4>Leave a Comment</h4>
          {commentSuccess && <div className="success-message">{commentSuccess}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="authorName"
                  value={commentForm.authorName}
                  onChange={handleCommentChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="authorEmail"
                  value={commentForm.authorEmail}
                  onChange={handleCommentChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Comment *</label>
              <textarea
                name="content"
                value={commentForm.content}
                onChange={handleCommentChange}
                placeholder="Share your thoughts..."
                rows="5"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={commentSubmitting}
            >
              {commentSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
          <p className="comment-note">Note: Comments require moderation before appearing.</p>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <strong>{comment.authorName}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
