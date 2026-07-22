import express from 'express';
import { createOrder, getMyOrders, getOrderById, markAsPaid, getAllOrders, updateOrderStatus, deleteOrder, createManualOrder } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public — guest can place order (no auth required)
router.post('/', createOrder);

// Protected user routes
router.get('/my',   protect, getMyOrders);
router.get('/:id',  protect, getOrderById);
router.put('/:id/pay', protect, markAsPaid);

// Admin routes
router.get('/',               protect, adminOnly, getAllOrders);
router.put('/:id/status',     protect, adminOnly, updateOrderStatus);
router.delete('/:id',         protect, adminOnly, deleteOrder);
router.post('/manual',        protect, adminOnly, createManualOrder);

export default router;
