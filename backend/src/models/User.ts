import mongoose, { Schema } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

const schema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

export default mongoose.model<IUser>("User", schema);