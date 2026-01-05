import express from 'express';
import { admin, protect } from '../middlewares/authMiddleware.js';
import { 
    cancelOrder, 
    getAllOrders, 
    getMyOrders, 
    getOrderDetails, 
    getOrderStats, 
    orderDetailsAdmin, 
    placeOrder, 
    updateOrderStatus, 
    updateOrderItemStatus, 
    returnOrderItem 
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/place-order', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);

router.get('/', protect, admin, getAllOrders);
router.get('/stats', protect, admin, getOrderStats);

router.put('/:orderId/items/:itemId/return', protect, returnOrderItem);
router.put('/:orderId/cancel', protect, cancelOrder);
router.get('/admin/:orderId', protect, admin, orderDetailsAdmin);
router.get('/:orderId', protect, getOrderDetails);
router.put('/update-status/:orderId', protect, admin, updateOrderStatus);
router.put('/update-item-status/:orderId', protect, admin, updateOrderItemStatus);

export default router;