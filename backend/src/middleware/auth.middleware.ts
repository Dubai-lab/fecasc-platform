import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export type AuthedRequest = Request & {
  admin?: { adminId: string; email: string };
  staff?: { staffId: string; email: string };
};

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = verifyToken(token);
    if ("adminId" in decoded) {
      req.admin = { adminId: decoded.adminId, email: decoded.email };
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireStaff(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = verifyToken(token);
    if ("staffId" in decoded) {
      req.staff = { staffId: decoded.staffId, email: decoded.email };
      return next();
    }
    return res.status(403).json({ message: "Staff access required" });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
