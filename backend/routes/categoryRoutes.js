import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Public
router.get('/', getCategories);

// Admin
router.post('/', protect, adminOnly, upload.single('image'), asyncHandler(async (req, res, next) => {
  if (req.file?.path) req.body.image_url = req.file.path;
  next();
}), createCategory);

router.put('/:id', protect, adminOnly, upload.single('image'), asyncHandler(async (req, res, next) => {
  if (req.file?.path) req.body.image_url = req.file.path;
  next();
}), updateCategory);

router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
