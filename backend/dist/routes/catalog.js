"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/restaurants", async (_req, res, next) => {
    try {
        res.json({ success: true, data: await Restaurant_1.default.find().sort({ createdAt: -1 }) });
    }
    catch (e) {
        next(e);
    }
});
router.get("/categories", async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.restaurant)
            filter.restaurant = req.query.restaurant;
        res.json({ success: true, data: await Category_1.default.find(filter).populate("restaurant", "name").sort({ name: 1 }) });
    }
    catch (e) {
        next(e);
    }
});
router.get("/products", async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.restaurant)
            filter.restaurant = req.query.restaurant;
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.featured === "true")
            filter.isFeatured = true;
        if (req.query.search)
            filter.name = { $regex: String(req.query.search), $options: "i" };
        res.json({ success: true, data: await Product_1.default.find(filter).populate("restaurant", "name cuisine").populate("category", "name").sort({ isFeatured: -1, createdAt: -1 }) });
    }
    catch (e) {
        next(e);
    }
});
router.post("/products", auth_1.requireAuth, auth_1.requireAdmin, async (req, res, next) => {
    try {
        res.status(201).json({ success: true, data: await Product_1.default.create(req.body) });
    }
    catch (e) {
        next(e);
    }
});
router.patch("/products/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const item = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item)
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
        res.json({ success: true, data: item });
    }
    catch (e) {
        next(e);
    }
});
router.delete("/products/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const item = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!item)
            return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
