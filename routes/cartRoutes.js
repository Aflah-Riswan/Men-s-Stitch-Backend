
import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { addToCart } from '../controllers/cartController.js'


const router = express.Router()
router.post('/',protect,addToCart)

export default router