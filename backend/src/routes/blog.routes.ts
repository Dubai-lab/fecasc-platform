import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { verifyToken } from "../lib/auth.js";

const router = Router();

// Optional admin check - sets admin property if valid admin token present, but doesn't fail if missing
function optionalAdminCheck(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (token) {
    try {
      const decoded = verifyToken(token);
      if ("adminId" in decoded) {
        req.admin = { adminId: decoded.adminId, email: decoded.email };
      }
    } catch {
      // Token is invalid, but that's okay for optional check
    }
  }
  next();
}

// PUBLIC/ADMIN: GET /api/blog - Get all blog posts (admin sees all, public sees only published)
router.get("/", optionalAdminCheck, async (req, res) => {
  try {
    const { page = 1, limit = 10, categoryId, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Check if user is admin by checking if admin property exists from middleware
    // If no admin property, user is public and should only see published posts
    const isAdmin = !!(req as any).admin;

    const where: any = isAdmin ? {} : { status: "PUBLISHED" };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { excerpt: { contains: search as string, mode: "insensitive" } },
        { tags: { hasSome: [(search as string).toLowerCase()] } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (e: any) {
    console.error("GET /blog Error:", e);
    res.status(500).json({ message: "Failed to fetch blog posts" });
  }
});

// PUBLIC: GET /api/blog/categories - Get all blog categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    res.json(categories);
  } catch (e: any) {
    console.error("GET /blog/categories Error:", e);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// PUBLIC: GET /api/blog/featured - Get featured blog posts (latest 3)
router.get("/featured", async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
    res.json(posts);
  } catch (e: any) {
    console.error("GET /blog/featured Error:", e);
    res.status(500).json({ message: "Failed to fetch featured posts" });
  }
});

// PUBLIC: GET /api/blog/:slug - Get single blog post by slug
router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug);

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related posts (same category, different post)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        categoryId: post.categoryId,
        id: { not: post.id },
        status: "PUBLISHED",
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
      take: 3,
    });

    res.json({ post, relatedPosts });
  } catch (e: any) {
    console.error("GET /blog/:slug Error:", e);
    res.status(500).json({ message: "Failed to fetch blog post" });
  }
});

// ADMIN: POST /api/blog - Create new blog post
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, categoryId, tags, featuredImageUrl, metaDescription } = req.body;

    if (!title || !excerpt || !content || !categoryId) {
      return res.status(400).json({ message: "title, excerpt, content, and categoryId are required" });
    }

    // Generate slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Ensure slug is unique by appending a number if needed
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        categoryId,
        tags: tags || [],
        featuredImageUrl,
        metaDescription,
        authorId: (req as any).admin.adminId,
        status: "DRAFT",
      },
      include: {
        category: true,
        author: { select: { name: true, email: true } },
      },
    });

    res.status(201).json(post);
  } catch (e: any) {
    console.error("POST /blog Error:", e);
    res.status(500).json({ message: "Failed to create blog post", error: e.message });
  }
});

// ADMIN: PATCH /api/blog/:id - Update blog post
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { title, excerpt, content, categoryId, tags, featuredImageUrl, metaDescription, status, publishedAt } = req.body;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (excerpt) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (categoryId) updateData.categoryId = categoryId;
    if (tags) updateData.tags = tags;
    if (featuredImageUrl) updateData.featuredImageUrl = featuredImageUrl;
    if (metaDescription) updateData.metaDescription = metaDescription;
    if (status) updateData.status = status;
    if (status === "PUBLISHED" && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        author: { select: { name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (e: any) {
    console.error("PATCH /blog/:id Error:", e);
    res.status(500).json({ message: "Failed to update blog post", error: e.message });
  }
});

// ADMIN: DELETE /api/blog/:id - Delete blog post
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    await prisma.blogPost.delete({ where: { id } });

    res.json({ message: "Blog post deleted successfully" });
  } catch (e: any) {
    console.error("DELETE /blog/:id Error:", e);
    res.status(500).json({ message: "Failed to delete blog post" });
  }
});

// ADMIN: POST /api/blog/categories - Create category
router.post("/categories", requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
      },
    });

    res.status(201).json(category);
  } catch (e: any) {
    console.error("POST /blog/categories Error:", e);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// PUBLIC: GET /api/blog/:postId/comments - Get approved comments for a post
router.get("/:postId/comments", async (req, res) => {
  try {
    const postId = String(req.params.postId);

    const comments = await prisma.blogComment.findMany({
      where: {
        postId,
        isApproved: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (e: any) {
    console.error("GET /:postId/comments Error:", e);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// PUBLIC: POST /api/blog/:postId/comments - Create new comment
router.post("/:postId/comments", async (req, res) => {
  try {
    const postId = String(req.params.postId);
    const { authorName, authorEmail, content } = req.body;

    if (!authorName || !authorEmail || !content) {
      return res.status(400).json({ message: "authorName, authorEmail, and content are required" });
    }

    // Verify blog post exists
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
      },
    });

    res.status(201).json(comment);
  } catch (e: any) {
    console.error("POST /:postId/comments Error:", e);
    res.status(500).json({ message: "Failed to create comment", error: e.message });
  }
});

// ADMIN: GET /api/blog/comments/all - Get all comments (including unapproved)
router.get("/comments/all", requireAdmin, async (req, res) => {
  try {
    const comments = await prisma.blogComment.findMany({
      include: {
        post: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (e: any) {
    console.error("GET /comments/all Error:", e);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// ADMIN: PATCH /api/blog/comments/:commentId/approve - Approve/Unapprove comment
router.patch("/comments/:commentId/approve", requireAdmin, async (req, res) => {
  try {
    const commentId = String(req.params.commentId);
    const { isApproved } = req.body;

    const comment = await prisma.blogComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const updated = await prisma.blogComment.update({
      where: { id: commentId },
      data: { isApproved: isApproved === true },
    });

    res.json(updated);
  } catch (e: any) {
    console.error("PATCH /comments/:commentId/approve Error:", e);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

// ADMIN: DELETE /api/blog/comments/:commentId - Delete comment
router.delete("/comments/:commentId", requireAdmin, async (req, res) => {
  try {
    const commentId = String(req.params.commentId);

    const comment = await prisma.blogComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await prisma.blogComment.delete({ where: { id: commentId } });

    res.json({ message: "Comment deleted successfully" });
  } catch (e: any) {
    console.error("DELETE /comments/:commentId Error:", e);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
