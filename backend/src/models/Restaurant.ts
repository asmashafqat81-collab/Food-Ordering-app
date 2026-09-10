import mongoose, { Schema } from "mongoose";

export interface IRestaurant extends mongoose.Document {
  name: string;
  description: string;
  image: string;
  cuisine: string;
  deliveryFee: number;
  etaMinutes: number;
  isOpen: boolean;
}

const schema = new Schema<IRestaurant>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  cuisine: { type: String, required: true },
  deliveryFee: { type: Number, default: 0 },
  etaMinutes: { type: Number, default: 30 },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IRestaurant>("Restaurant", schema);