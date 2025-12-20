
import  express  from 'express'
import { admin, protect } from '../middlewares/authMiddleware.js'
import { addCoupon, getCoupons } from '../controllers/couponController.js'


const router = express.Router()

router.post('/' ,protect , admin , addCoupon)
router.get('/',getCoupons)

export default router