
import  express  from 'express'
import { admin, protect } from '../middlewares/authMiddleware.js'
import { addCoupon, getCoupons, updateIsActive } from '../controllers/couponController.js'


const router = express.Router()

router.post('/' ,protect , admin , addCoupon)
router.get('/',getCoupons)
router.patch('/:couponId/edit',protect , admin , updateIsActive)


export default router