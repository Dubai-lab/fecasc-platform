import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public: GET /api/services
router.get("/", async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// Admin: GET /api/services/all
router.get("/all", requireAdmin, async (_req, res) => {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  res.json(services);
});

// Admin: POST /api/services
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description, isActive } = req.body as {
      title?: string;
      description?: string;
      isActive?: boolean;
    };

    if (!title) return res.status(400).json({ message: "title is required" });

    const service = await prisma.service.create({
      data: {
        title,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    res.status(201).json(service);
  } catch (e: any) {
    console.error(e);
    if (String(e?.message || "").includes("Unique constraint")) {
      return res.status(409).json({ message: "Service title already exists" });
    }
    res.status(500).json({ message: "Failed to create service" });
  }
});

// Admin: PATCH /api/services/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body as {
      title?: string;
      description?: string;
      isActive?: boolean;
    };

    const service = await prisma.service.update({
      where: { id: String(id) },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        isActive: isActive ?? undefined,
      },
    });

    res.json(service);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update service" });
  }
});

// Admin: DELETE /api/services/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service has any bookings
    const bookingCount = await prisma.booking.count({
      where: { serviceId: String(id) },
    });

    if (bookingCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete service. It has ${bookingCount} booking(s). Deactivate it instead.` 
      });
    }

    await prisma.service.delete({
      where: { id: String(id) },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete service" });
  }
});

export default router;
