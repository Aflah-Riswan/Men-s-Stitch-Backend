
import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { addToCart, getCartItems } from '../controllers/cartController.js'


const router = express.Router()
router.post('/',protect,addToCart)
router.get('/',protect,getCartItems)

export default router