import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/auth.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../lib/upload.js";
import { transporter } from "../lib/mailer.js";

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
        const assignedServicesList = parsedServices.length > 0 
          ? `<br><strong>Assigned Services:</strong> ${parsedServices.join(", ")}`
          : "";

        await transporter.sendMail({
          from: process.env.SMTP_FROM || "noreply@fecasc.com",
          to: email,
          subject: "Welcome to FECASC - Your Staff Account Created",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0b3d2e, #11624a); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Welcome to FECASC</h1>
              </div>
              
              <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>Your staff account has been created successfully! You can now access the FECASC consultant dashboard to manage your assigned projects.</p>
                
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 12px 0;"><strong>Login Credentials:</strong></p>
                  <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 6px 0;"><strong>Password:</strong> ${password}</p>
                  <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">Please change your password after your first login.</p>
                </div>
                
                <div style="margin: 24px 0;">
                  <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/login" style="display: inline-block; background: #1a8f6a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Login to Dashboard
                  </a>
                </div>
                
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    <strong>Your Role:</strong> ${title}<br>
                    <strong>Status:</strong> Active${assignedServicesList}
                  </p>
                </div>
                
                <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                  If you have any questions, please contact the admin team.
                </p>
              </div>
            </div>
          `,
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
    const { name, title, credentials, bio, order, isActive, email, password, role, department, isPublic } = req.body as {
      name?: string;
      title?: string;
      credentials?: string;
      bio?: string;
      order?: number;
      isActive?: boolean;
      email?: string;
      password?: string;
      role?: string;
      department?: string;
      isPublic?: boolean;
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

    const teamMember = await prisma.teamMember.update({
      where: { id: String(id) },
      data: {
        name: name ?? undefined,
        title: title ?? undefined,
        credentials: credentials ?? undefined,
        bio: bio ?? undefined,
        imageUrl: imageUrl ?? undefined,
        order: order ? parseInt(order as any) : undefined,
        isActive: isActive ?? undefined,
        email: email ?? undefined,
        passwordHash: passwordHash ?? undefined,
        role: role ?? undefined,
        department: department ?? undefined,
        isPublic: isPublic ?? undefined,
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
