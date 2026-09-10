"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(header.slice(7), process.env.JWT_SECRET);
        req.user = { id: payload.id, role: payload.role };
        next();
    }
    catch {
        return res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
    }
    next();
}
