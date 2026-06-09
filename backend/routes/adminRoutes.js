import express from "express";
import { getDashboardStats, getHeroConfig, updateHeroConfig } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/hero", getHeroConfig);
router.put("/hero", protect, adminOnly, updateHeroConfig);

export default router;
