import mongoose, { Schema } from "mongoose";

export interface ICategory extends mongoose.Document {
  name: string;
  restaurant: mongoose.Types.ObjectId;
}

const schema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true }
}, { timestamps: true });

export default mongoose.model<ICategory>("Category", schema);