import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { getAllBlogPosts, getBlogCategories, getFeaturedPosts } from "../api/blog.js";
import "./Blog.css";

export default function Blog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [pagination, setPagination] = useState({});

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const cats = await getBlogCategories();
        setCategories(cats);
        
        // Load featured posts (only on first page with no filters)
        if (page === 1 && !search && !selectedCategory) {
          const featured = await getFeaturedPosts();
          setFeaturedPosts(featured);
        }
        
        // Load paginated posts
        const data = await getAllBlogPosts(page, POSTS_PER_PAGE, selectedCategory, search);
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, search, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    updateSearchParams();
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId === selectedCategory ? "" : catId);
    setPage(1);
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page);
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);
  };

  useEffect(() => {
    updateSearchParams();
  }, [page, search, selectedCategory]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="blog-container">
      <Navbar />
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="hero-content">
          <h1>FECASC Blog</h1>
          <p>Environmental Insights, Sustainability Tips & Industry Updates</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="blog-search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>
        </form>
      </div>

      <div className="blog-main">
        {/* Sidebar with Categories */}
        <aside className="blog-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="category-list">
              <button
                className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
                onClick={() => handleCategoryChange("")}
              >
                All Articles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="blog-content">
          {/* Featured Posts - Only on first page */}
          {page === 1 && !search && !selectedCategory && featuredPosts.length > 0 && (
            <section className="featured-section">
              <h2>Featured Articles</h2>
              <div className="featured-grid">
                {featuredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="featured-card"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.featuredImageUrl && (
                      <div className="featured-image">
                        <img src={post.featuredImageUrl} alt={post.title} />
                      </div>
                    )}
                    <div className="featured-content">
                      <span className="featured-badge">Featured</span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="featured-meta">
                        <span className="category">{post.category?.name}</span>
                        <span className="date">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Blog Posts Grid */}
          <section className="posts-section">
            <h2>
              {search ? `Search Results for "${search}"` : "All Articles"}
            </h2>

            {loading ? (
              <div className="loading">Loading articles...</div>
            ) : posts.length === 0 ? (
              <div className="no-posts">
                <p>No articles found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="posts-grid">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="post-card"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      {post.featuredImageUrl && (
                        <div className="post-image">
                          <img src={post.featuredImageUrl} alt={post.title} />
                        </div>
                      )}
                      <div className="post-card-content">
                        <div className="post-header-meta">
                          <span className="category-tag">{post.category?.name}</span>
                          <span className="post-date">
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-excerpt">{post.excerpt}</p>
                        <div className="post-footer-meta">
                          <span className="author">By {post.author?.name}</span>
                          <span className="read-more">Read More →</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="pag-btn"
                    >
                      ← Previous
                    </button>

                    <div className="page-numbers">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`page-btn ${p === page ? "active" : ""}`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                      className="pag-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
