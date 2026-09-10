"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(_req, res) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
}
function errorHandler(err, _req, res, _next) {
    console.error(err);
    if (err?.code === 11000) {
        return res.status(409).json({ success: false, error: { code: "DUPLICATE", message: "A record with that value already exists" } });
    }
    res.status(err?.status || 500).json({
        success: false,
        error: { code: err?.codeName || "INTERNAL_ERROR", message: err?.message || "Unexpected server error" }
    });
}
