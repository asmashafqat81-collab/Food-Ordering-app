import { Router } from "express";
import Product from "../models/Product";
import Order, { OrderStatus } from "../models/Order";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { items, deliveryAddress, phone, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !deliveryAddress || !phone) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Items, delivery address and phone are required" } });
    }

    const ids = items.map((i: any) => i.product);
    const products = await Product.find({ _id: { $in: ids }, isAvailable: true }).populate("restaurant");
    if (products.length !== ids.length) {
      return res.status(400).json({ success: false, error: { code: "INVALID_ITEMS", message: "One or more products are unavailable" } });
    }

    const restaurantId = products[0].restaurant._id.toString();
    if (products.some((p: any) => p.restaurant._id.toString() !== restaurantId)) {
      return res.status(400).json({ success: false, error: { code: "MULTI_RESTAURANT", message: "An order can contain items from one restaurant only" } });
    }

    const normalized = products.map((p: any) => {
      const requested = items.find((i: any) => i.product === p._id.toString() || i.product === p._id.toString().trim());
      return { product: p._id, name: p.name, price: p.price, quantity: Math.max(1, Number(requested?.quantity || 1)) };
    });

    const subtotal = normalized.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const restaurant: any = products[0].restaurant;
    const deliveryFee = Number(restaurant.deliveryFee || 0);
    const order = await Order.create({ user: req.user!.id, restaurant: restaurant._id, items: normalized, subtotal, deliveryFee, total: subtotal + deliveryFee, deliveryAddress, phone, notes });
    res.status(201).json({ success: true, data: await order.populate("restaurant", "name") });
  } catch (e) { next(e); }
});

router.get("/my-orders", requireAuth, async (req: AuthRequest, res, next) => {
  try { res.json({ success: true, data: await Order.find({ user: req.user!.id }).populate("restaurant", "name image").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try { res.json({ success: true, data: await Order.find().populate("user", "name email").populate("restaurant", "name").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const allowed: OrderStatus[] = ["pending","confirmed","preparing","out_for_delivery","delivered","cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Invalid order status" } });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate("user", "name email").populate("restaurant", "name");
    if (!order) return res.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
});

export default router;