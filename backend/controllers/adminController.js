import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, revenueData] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: "user" }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  // Last 7 days orders
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = await Order.find({ createdAt: { $gte: sevenDaysAgo } })
    .populate("user", "name email")
    .sort("-createdAt")
    .limit(10);

  // Orders by status
  const statusCounts = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.name", totalSold: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  res.json({ totalOrders, totalProducts, totalUsers, totalRevenue, recentOrders, statusCounts, topProducts });
});

// @GET/PUT /api/admin/hero  — hero section settings
// Store hero config directly in a simple JSON (no extra model needed)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const heroPath = path.join(__dirname, "../data/hero.json");

export const getHeroConfig = asyncHandler(async (req, res) => {
  if (!fs.existsSync(heroPath)) {
    return res.json({
      headline: "Timeless",
      subheadline: "Elegance.",
      subtext: "Premium watches crafted for style, precision, and performance.",
      ctaText: "Shop Now",
      discountText: "",
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=85",
      badge: "New Arrival",
      badgeSub: "Swiss Collection 2025",
      fromPrice: "199",
    });
  }
  const config = JSON.parse(fs.readFileSync(heroPath, "utf-8"));
  res.json(config);
});

export const updateHeroConfig = asyncHandler(async (req, res) => {
  const dir = path.dirname(heroPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(heroPath, JSON.stringify(req.body, null, 2));
  res.json(req.body);
});
