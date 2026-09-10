import mongoose, { Schema } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

const itemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  items: Array<{ product: mongoose.Types.ObjectId; name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  phone: string;
  notes?: string;
}

const schema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  items: { type: [itemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending","confirmed","preparing","out_for_delivery","delivered","cancelled"], default: "pending" },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model<IOrder>("Order", schema);