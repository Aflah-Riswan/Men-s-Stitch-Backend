
import express from 'express'
import { addMoneyToWallet, getMyWallet } from '../controllers/walletController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/add-money', protect , addMoneyToWallet)
router.get('/details',protect,  getMyWallet)

export default router