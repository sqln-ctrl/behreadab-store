import express from 'express';
import { getDashboardStats, getHeroConfig, updateHeroConfig, getAllUsers, updateUser, getUserById } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Public — hero config readable by frontend
router.get('/hero', getHeroConfig);

// Protected admin routes
router.use(protect, adminOnly);
router.get('/stats',       getDashboardStats);
router.put('/hero',        updateHeroConfig);
router.get('/users',       getAllUsers);
router.get('/users/:id',   getUserById);
router.put('/users/:id',   updateUser);

// Hero media upload
router.post('/upload-hero-media', upload.single('images'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.file.path, public_id: req.file.filename });
}));

export default router;
