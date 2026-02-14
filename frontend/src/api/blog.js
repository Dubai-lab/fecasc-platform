import http from "./http";

// Get all published blog posts with pagination
export const getAllBlogPosts = (page = 1, limit = 10, categoryId = null, search = null) => {
  let url = `/blog?page=${page}&limit=${limit}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  if (search) url += `&search=${search}`;
  return http.get(url).then(res => res.data);
};

// Get featured blog posts (latest 3)
export const getFeaturedPosts = () => {
  return http.get("/blog/featured").then(res => res.data);
};

// Get all blog categories
export const getBlogCategories = () => {
  return http.get("/blog/categories").then(res => res.data);
};

// Get single blog post by slug
export const getBlogPostBySlug = (slug) => {
  return http.get(`/blog/${slug}`).then(res => res.data);
};

// ADMIN: Create new blog post
export const createBlogPost = (postData) => {
  return http.post("/blog", postData).then(res => res.data);
};

// ADMIN: Update blog post
export const updateBlogPost = (id, postData) => {
  return http.patch(`/blog/${id}`, postData).then(res => res.data);
};

// ADMIN: Delete blog post
export const deleteBlogPost = (id) => {
  return http.delete(`/blog/${id}`).then(res => res.data);
};

// ADMIN: Create blog category
export const createBlogCategory = (categoryData) => {
  return http.post("/blog/categories", categoryData).then(res => res.data);
};

// Comments API

// Get approved comments for a post (PUBLIC)
export const getPostComments = (postId) => {
  return http.get(`/blog/${postId}/comments`).then(res => res.data);
};

// Create new comment (PUBLIC)
export const createComment = (postId, commentData) => {
  return http.post(`/blog/${postId}/comments`, commentData).then(res => res.data);
};

// Get all comments (ADMIN - including unapproved)
export const getAllComments = () => {
  return http.get("/blog/comments/all").then(res => res.data);
};

// Approve/Unapprove comment (ADMIN)
export const approveComment = (commentId, isApproved) => {
  return http.patch(`/blog/comments/${commentId}/approve`, { isApproved }).then(res => res.data);
};

// Delete comment (ADMIN)
export const deleteComment = (commentId) => {
  return http.delete(`/blog/comments/${commentId}`).then(res => res.data);
};
