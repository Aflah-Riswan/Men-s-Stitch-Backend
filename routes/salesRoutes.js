
import express from 'express'
import { getSalesReport } from '../controllers/salesController.js'
import { admin, protect } from '../middlewares/authMiddleware.js'
const router = express.Router()

// router.get('/report',protect ,admin ,getSalesReport)

export default router