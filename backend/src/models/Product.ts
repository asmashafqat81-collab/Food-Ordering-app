import mongoose, { Schema } from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  image: string;
  restaurant: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  isAvailable: boolean;
  isFeatured: boolean;
}

const schema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IProduct>("Product", schema);