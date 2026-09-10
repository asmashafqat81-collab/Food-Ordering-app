import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const sign = (user: any) => jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name, email and a password of at least 6 characters are required" } });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "Email is already registered" } });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ success: true, data: { token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect" } });
    }
    res.json({ success: true, data: { token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } });
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

export default router;