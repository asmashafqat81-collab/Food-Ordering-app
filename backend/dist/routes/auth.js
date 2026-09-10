"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const sign = (user) => jsonwebtoken_1.default.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name, email and a password of at least 6 characters are required" } });
        }
        const exists = await User_1.default.findOne({ email });
        if (exists)
            return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "Email is already registered" } });
        const user = await User_1.default.create({ name, email, password: await bcryptjs_1.default.hash(password, 12) });
        res.status(201).json({ success: true, data: { token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
    }
    catch (e) {
        next(e);
    }
});
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select("+password");
        if (!user || !(await bcryptjs_1.default.compare(password || "", user.password))) {
            return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect" } });
        }
        res.json({ success: true, data: { token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
    }
    catch (e) {
        next(e);
    }
});
router.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } });
        res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
