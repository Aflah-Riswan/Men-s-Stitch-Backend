
import express  from 'express'
import { createRazorPayOrderId, placeOnlineOrder } from '../controllers/paymentController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/create-payment',protect, createRazorPayOrderId)
router.post('/place-order-online', protect , placeOnlineOrder)
export default router          