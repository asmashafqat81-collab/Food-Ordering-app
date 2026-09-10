
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth";
import catalogRoutes from "./routes/catalog";
import orderRoutes from "./routes/orders";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "food-ordering-api",
      time: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/food_ordering_app"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });

