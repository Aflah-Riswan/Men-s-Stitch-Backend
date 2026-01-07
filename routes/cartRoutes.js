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

// 1. Add Item to Cart
router.post('/add', protect, addToCart); 


// 2. Get Cart
router.get('/', protect, getCartItems);

// 3. Update Quantity (Increment/Decrement)
router.put('/update', protect, updateQuantity);

// 4. Remove Item
router.delete('/remove/:itemId', protect, removeFromCart);

// 5. Apply Coupon
router.post('/apply-coupon', protect, applyCoupon);

// 6. Remove Coupon
router.delete('/remove-coupon', protect, removeCoupon);

export default router;