
import express from 'express'
const router = express.Router()
import { protect } from '../middlewares/authMiddleware.js'
import { addToWishList, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js'


router.post('/add', protect, addToWishList)
router.get('/', protect , getWishlist)
router.delete('/remove/:itemId', protect, removeFromWishlist);

export default router