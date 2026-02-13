import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { signToken, verifyPassword } from "../lib/auth.js";

const router = Router();

// POST /api/auth/login (Admin Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ adminId: admin.id, email: admin.email });

    return res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Login failed" });
  }
});

// POST /api/auth/staff-login (Consultant/Staff Login)
router.post("/staff-login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // Find staff member with email and password
    const staff = await prisma.teamMember.findFirst({
      where: {
        email,
        passwordHash: { not: null }, // Must have a password (is staff)
        isActive: true,
      },
    });

    if (!staff) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(password, staff.passwordHash!);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ staffId: staff.id, email: staff.email });

    return res.json({
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        title: staff.title,
        department: staff.department,
        role: staff.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Login failed" });
  }
});

// POST /api/auth/login-unified (Unified Login for Admin and Staff)
router.post("/login-unified", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // Try admin login first
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      const ok = await verifyPassword(password, admin.password);
      if (ok) {
        const token = signToken({ adminId: admin.id, email: admin.email });
        return res.json({
          token,
          user: { id: admin.id, name: admin.name, email: admin.email },
          userType: "admin",
        });
      }
    }

    // Try staff login
    const staff = await prisma.teamMember.findFirst({
      where: {
        email,
        passwordHash: { not: null }, // Must have a password (is staff)
        isActive: true,
      },
    });

    if (staff) {
      const ok = await verifyPassword(password, staff.passwordHash!);
      if (ok) {
        const token = signToken({ staffId: staff.id, email: staff.email });
        return res.json({
          token,
          user: {
            id: staff.id,
            name: staff.name,
            email: staff.email,
            title: staff.title,
            department: staff.department,
            role: staff.role,
          },
          userType: "staff",
        });
      }
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Login failed" });
  }
});

export default router;
