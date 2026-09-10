"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const catalog_1 = __importDefault(require("./routes/catalog"));
const orders_1 = __importDefault(require("./routes/orders"));
const error_1 = require("./middleware/error");
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 5000);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express_1.default.json());
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
app.use("/api/auth", auth_1.default);
app.use("/api", catalog_1.default);
app.use("/api/orders", orders_1.default);
app.use(error_1.notFound);
app.use(error_1.errorHandler);
mongoose_1.default
    .connect(process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/food_ordering_app")
    .then(() => {
    app.listen(port, () => {
        console.log(`API running on port ${port}`);
    });
})
    .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
});
