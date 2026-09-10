"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, async (req, res, next) => {
    try {
        const { items, deliveryAddress, phone, notes } = req.body;
        if (!Array.isArray(items) || items.length === 0 || !deliveryAddress || !phone) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Items, delivery address and phone are required" } });
        }
        const ids = items.map((i) => i.product);
        const products = await Product_1.default.find({ _id: { $in: ids }, isAvailable: true }).populate("restaurant");
        if (products.length !== ids.length) {
            return res.status(400).json({ success: false, error: { code: "INVALID_ITEMS", message: "One or more products are unavailable" } });
        }
        const restaurantId = products[0].restaurant._id.toString();
        if (products.some((p) => p.restaurant._id.toString() !== restaurantId)) {
            return res.status(400).json({ success: false, error: { code: "MULTI_RESTAURANT", message: "An order can contain items from one restaurant only" } });
        }
        const normalized = products.map((p) => {
            const requested = items.find((i) => i.product === p._id.toString() || i.product === p._id.toString().trim());
            return { product: p._id, name: p.name, price: p.price, quantity: Math.max(1, Number(requested?.quantity || 1)) };
        });
        const subtotal = normalized.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const restaurant = products[0].restaurant;
        const deliveryFee = Number(restaurant.deliveryFee || 0);
        const order = await Order_1.default.create({ user: req.user.id, restaurant: restaurant._id, items: normalized, subtotal, deliveryFee, total: subtotal + deliveryFee, deliveryAddress, phone, notes });
        res.status(201).json({ success: true, data: await order.populate("restaurant", "name") });
    }
    catch (e) {
        next(e);
    }
});
router.get("/my-orders", auth_1.requireAuth, async (req, res, next) => {
    try {
        res.json({ success: true, data: await Order_1.default.find({ user: req.user.id }).populate("restaurant", "name image").sort({ createdAt: -1 }) });
    }
    catch (e) {
        next(e);
    }
});
router.get("/", auth_1.requireAuth, auth_1.requireAdmin, async (_req, res, next) => {
    try {
        res.json({ success: true, data: await Order_1.default.find().populate("user", "name email").populate("restaurant", "name").sort({ createdAt: -1 }) });
    }
    catch (e) {
        next(e);
    }
});
router.patch("/:id/status", auth_1.requireAuth, auth_1.requireAdmin, async (req, res, next) => {
    try {
        const allowed = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
        if (!allowed.includes(req.body.status))
            return res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Invalid order status" } });
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate("user", "name email").populate("restaurant", "name");
        if (!order)
            return res.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
        res.json({ success: true, data: order });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
