
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js'; 
import { cancelOrder, getMyOrders, placeOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place-order', protect, placeOrder);
router.get('/my-orders', protect, getMyOrders);      
router.put('/:orderId/cancel', protect, cancelOrder); 

export default router;