import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  addToCart, 
  getCartItems, 
  updateQuantity, 
  removeFromCart, 
  applyCoupon, 
  removeCoupon 
} from '../controllers/cartController.js';

const router = express.Router();
router.post('/add', protect, addToCart); 
router.get('/', protect, getCartItems);
router.put('/update', protect, updateQuantity);
router.delete('/remove/:itemId', protect, removeFromCart);
router.post('/apply-coupon', protect, applyCoupon);
router.delete('/remove-coupon', protect, removeCoupon);

export default router;