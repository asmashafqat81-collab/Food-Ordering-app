"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
const Restaurant_1 = __importDefault(require("./models/Restaurant"));
const Category_1 = __importDefault(require("./models/Category"));
const Product_1 = __importDefault(require("./models/Product"));
const images = {
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
    bowl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"
};
async function seed() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/food_ordering_app");
    await Promise.all([User_1.default.deleteMany({}), Restaurant_1.default.deleteMany({}), Category_1.default.deleteMany({}), Product_1.default.deleteMany({})]);
    const passwordHash = await bcryptjs_1.default.hash("Admin123!", 12);
    await User_1.default.create({ name: "Admin", email: "admin@foodapp.local", password: passwordHash, role: "admin" });
    await User_1.default.create({ name: "Demo User", email: "user@foodapp.local", password: await bcryptjs_1.default.hash("User123!", 12), role: "user" });
    const restaurant = await Restaurant_1.default.create({
        name: "Urban Bites",
        description: "Modern comfort food, burgers, pizza and fresh bowls.",
        image: images.burger,
        cuisine: "American • Italian",
        deliveryFee: 2.99,
        etaMinutes: 30,
        isOpen: true
    });
    const [burgers, pizza, pasta, healthy] = await Category_1.default.create([
        { name: "Burgers", restaurant: restaurant._id },
        { name: "Pizza", restaurant: restaurant._id },
        { name: "Pasta", restaurant: restaurant._id },
        { name: "Healthy", restaurant: restaurant._id }
    ]);
    await Product_1.default.insertMany([
        { name: "Classic Smash Burger", description: "Double smashed beef, cheddar, pickles and house sauce.", price: 11.99, image: images.burger, restaurant: restaurant._id, category: burgers._id, isFeatured: true },
        { name: "Truffle Mushroom Pizza", description: "Mozzarella, mushrooms, truffle oil and herbs.", price: 14.5, image: images.pizza, restaurant: restaurant._id, category: pizza._id, isFeatured: true },
        { name: "Creamy Garlic Pasta", description: "Silky garlic cream sauce, parmesan and fresh herbs.", price: 12.75, image: images.pasta, restaurant: restaurant._id, category: pasta._id },
        { name: "Green Power Bowl", description: "Avocado, greens, grains, chickpeas and lemon dressing.", price: 10.25, image: images.bowl, restaurant: restaurant._id, category: healthy._id }
    ]);
    console.log("Seed complete");
    await mongoose_1.default.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
