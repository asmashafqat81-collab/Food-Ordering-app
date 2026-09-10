import { Router } from "express";
import Restaurant from "../models/Restaurant";
import Category from "../models/Category";
import Product from "../models/Product";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/restaurants", async (_req, res, next) => {
  try { res.json({ success: true, data: await Restaurant.find().sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.get("/categories", async (req, res, next) => {
  try {
    const filter: any = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    res.json({ success: true, data: await Category.find(filter).populate("restaurant", "name").sort({ name: 1 }) });
  } catch (e) { next(e); }
});

router.get("/products", async (req, res, next) => {
  try {
    const filter: any = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.search) filter.name = { $regex: String(req.query.search), $options: "i" };
    res.json({ success: true, data: await Product.find(filter).populate("restaurant", "name cuisine").populate("category", "name").sort({ isFeatured: -1, createdAt: -1 }) });
  } catch (e) { next(e); }
});

router.post("/products", requireAuth, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await Product.create(req.body) }); } catch (e) { next(e); }
});

router.patch("/products/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    res.json({ success: true, data: item });
  } catch (e) { next(e); }
});

router.delete("/products/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;