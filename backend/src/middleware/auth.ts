import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role: "user" | "admin" };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role: "user" | "admin" };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
  }
  next();
}