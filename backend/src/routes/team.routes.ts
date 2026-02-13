import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/auth.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../lib/upload.js";
import { sendEmail } from "../lib/mailer.js";
import { getWelcomeEmailTemplate } from "../lib/templates/welcomeEmail.js";

const router = Router();

// Public: GET /api/team
router.get("/", async (_req, res) => {
  try {
    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    res.json(team);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch team" });
  }
});

// Admin: GET /api/team/all
router.get("/all", requireAdmin, async (_req, res) => {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });
    res.json(team);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch team" });
  }
});

// Admin: POST /api/team (with file upload)
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, title, credentials, bio, order, email, password, role, assignedServices, isPublic } = req.body;
    
    console.log("POST /team - Request body:", { name, title, credentials, bio, order, email, role, assignedServices, isPublic });
    console.log("POST /team - File:", req.file);

    if (!name || !title) {
      return res.status(400).json({ message: "name and title are required" });
    }

    // Parse order as integer
    const parsedOrder = order ? parseInt(String(order)) : 0;
    
    // Generate image URL - support both Cloudinary (path) and local storage (filename)
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = (req.file as any).path || `/uploads/team/${(req.file as any).filename}`;
    }

    // Hash password if creating a staff member
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Parse assignedServices
    let parsedServices: string[] = [];
    if (assignedServices) {
      try {
        parsedServices = typeof assignedServices === "string" ? JSON.parse(assignedServices) : assignedServices;
      } catch (e) {
        parsedServices = [];
      }
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        name: String(name),
        title: String(title),
        credentials: credentials ? String(credentials) : null,
        bio: bio ? String(bio) : null,
        imageUrl: imageUrl,
        order: parsedOrder,
        isActive: true,
        email: email ? String(email) : null,
        passwordHash: passwordHash,
        role: role ? String(role) : "PUBLIC",  // PUBLIC, STAFF
        assignedServices: parsedServices,
        isPublic: isPublic !== undefined ? isPublic === "true" || isPublic === true : true,
      },
    });

    // Send welcome email if staff member with email and password
    if (email && password && (role === "STAFF" || role === "staff")) {
      try {
        const { html, text } = getWelcomeEmailTemplate(
          String(name),
          String(email),
          password,
          String(title),
          parsedServices
        );

        await sendEmail({
          from: process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com",
          to: String(email),
          subject: "Welcome to FECASC - Your Staff Account Created",
          html,
          text,
        });
        console.log("Welcome email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the request if email fails
      }
    }

    console.log("Team member created:", teamMember);
    res.status(201).json(teamMember);
  } catch (e: any) {
    console.error("POST /team Error:", e);
    if (String(e?.message || "").includes("Unique constraint")) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Failed to create team member", error: e.message });
  }
});

// Admin: PATCH /api/team/:id (with file upload)
router.patch("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, credentials, bio, order, isActive, email, password, role, assignedServices, isPublic } = req.body as {
      name?: string;
      title?: string;
      credentials?: string;
      bio?: string;
      order?: number | string;
      isActive?: boolean | string;
      email?: string;
      password?: string;
      role?: string;
      assignedServices?: string[] | string;
      isPublic?: boolean | string;
    };

    // Generate image URL if file was uploaded (Cloudinary returns secure_url in path)
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      imageUrl = (req.file as any).path || `/uploads/team/${(req.file as any).filename}`;
    }

    // Hash password if provided
    let passwordHash: string | undefined = undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Convert isActive to boolean if it's a string
    let parsedIsActive: boolean | undefined = undefined;
    if (isActive !== undefined && isActive !== null) {
      parsedIsActive = typeof isActive === "string" ? isActive === "true" : isActive;
    }

    // Convert isPublic to boolean if it's a string
    let parsedIsPublic: boolean | undefined = undefined;
    if (isPublic !== undefined && isPublic !== null) {
      parsedIsPublic = typeof isPublic === "string" ? isPublic === "true" : isPublic;
    }

    // Parse assignedServices
    let parsedServices: string[] | undefined = undefined;
    if (assignedServices !== undefined) {
      try {
        parsedServices = typeof assignedServices === "string" ? JSON.parse(assignedServices) : assignedServices;
      } catch (e) {
        parsedServices = [];
      }
    }

    const teamMember = await prisma.teamMember.update({
      where: { id: String(id) },
      data: {
        name: name ?? undefined,
        title: title ?? undefined,
        credentials: credentials ?? undefined,
        bio: bio ?? undefined,
        imageUrl: imageUrl ?? undefined,
        order: order ? parseInt(String(order)) : undefined,
        isActive: parsedIsActive ?? undefined,
        email: email ?? undefined,
        passwordHash: passwordHash ?? undefined,
        role: role ?? undefined,
        assignedServices: parsedServices ?? undefined,
        isPublic: parsedIsPublic ?? undefined,
      },
    });

    res.json(teamMember);
  } catch (e: any) {
    console.error(e);
    if (String(e?.message || "").includes("Unique constraint")) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Failed to update team member" });
  }
});

// Admin: DELETE /api/team/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.teamMember.delete({
      where: { id: String(id) },
    });

    res.json({ message: "Team member deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete team member" });
  }
});

export default router;
