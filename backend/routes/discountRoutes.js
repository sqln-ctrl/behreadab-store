import express from 'express';
import { getDiscounts, getAllDiscounts, createDiscount, removeDiscount } from '../controllers/discountController.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();
router.get('/', getDiscounts);
router.get('/all', protect, adminOnly, getAllDiscounts);
router.post('/', protect, adminOnly, createDiscount);
router.delete('/:id', protect, adminOnly, removeDiscount);
export default router;
