import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { galleryUpload } from "../lib/upload.js";

const router = Router();

// Public: GET /api/gallery/:category
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ["projects", "worksite", "services"];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const images = await prisma.galleryImage.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { order: "asc" },
    });

    res.json(images);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch gallery images" });
  }
});

// Public: GET /api/gallery - Get all gallery images
router.get("/", async (_req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { category: "asc" },
    });

    res.json(images);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch gallery images" });
  }
});

// Admin: POST /api/gallery - Upload image
router.post(
  "/",
  requireAdmin,
  galleryUpload.single("image"),
  async (req, res) => {
    try {
      const { category, title, description, order } = req.body as {
        category?: string;
        title?: string;
        description?: string;
        order?: string;
      };

      if (!category || !req.file) {
        return res
          .status(400)
          .json({ message: "category and image file are required" });
      }

      const validCategories = ["projects", "worksite", "services"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const imageUrl = (req.file as any).path;

      const image = await prisma.galleryImage.create({
        data: {
          category,
          title: title || null,
          description: description || null,
          imageUrl,
          order: order ? parseInt(order) : 0,
          isActive: true,
        },
      });

      res.status(201).json(image);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Failed to upload image" });
    }
  }
);

// Admin: PATCH /api/gallery/:id - Update image
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order, isActive } = req.body as {
      title?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    };

    const image = await prisma.galleryImage.update({
      where: { id: String(id) },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        order: order ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    res.json(image);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update image" });
  }
});

// Admin: DELETE /api/gallery/:id - Delete image
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.galleryImage.findUnique({
      where: { id: String(id) },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from database
    await prisma.galleryImage.delete({
      where: { id: String(id) },
    });

    res.json({ message: "Image deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

export default router;
