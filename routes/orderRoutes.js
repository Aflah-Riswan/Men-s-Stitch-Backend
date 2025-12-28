
import express from 'express';
import { admin, protect } from '../middlewares/authMiddleware.js';
import { cancelOrder, getAllOrders, getMyOrders, getOrderDetails, getOrderStats, orderDetailsAdmin, placeOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place-order', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders)
router.get('/stats', protect, admin, getOrderStats)

router.get('/admin/:orderId', protect, admin, orderDetailsAdmin)

router.put('/:orderId/cancel', protect, cancelOrder);
router.get('/:orderId', protect, getOrderDetails)

export default router;