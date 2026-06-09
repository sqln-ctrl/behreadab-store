import express from "express";
import { getAllUsers, getUserById, updateUser, saveAddress, deleteAddress, getWishlist, toggleWishlist } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Wishlist
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, toggleWishlist);

// Addresses
router.post("/address", protect, saveAddress);
router.delete("/address/:addressId", protect, deleteAddress);

// Admin
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, updateUser);

export default router;
