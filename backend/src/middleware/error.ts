import { Request, Response, NextFunction } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err?.code === 11000) {
    return res.status(409).json({ success: false, error: { code: "DUPLICATE", message: "A record with that value already exists" } });
  }
  res.status(err?.status || 500).json({
    success: false,
    error: { code: err?.codeName || "INTERNAL_ERROR", message: err?.message || "Unexpected server error" }
  });
}