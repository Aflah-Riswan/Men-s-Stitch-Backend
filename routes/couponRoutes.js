
import  express  from 'express'
import { admin, protect } from '../middlewares/authMiddleware.js'
import { addCoupon, deleteCoupon, getAvailableCoupons, getCouponById, getCoupons, updateCoupon, updateIsActive } from '../controllers/couponController.js'
import { validateCoupon } from '../middlewares/validateCoupon.js'



const router = express.Router()

// router.post('/' ,protect , admin ,validateCoupon,addCoupon)
// router.get('/',getCoupons)
router.get('/user-coupons', protect, getAvailableCoupons);
// router.get('/:couponId/edit',protect, admin , getCouponById)
// router.patch('/:couponId/edit',protect , admin , updateIsActive)
// router.put('/:couponId/edit',protect , admin ,validateCoupon ,updateCoupon)
// router.patch('/:couponId/delete',protect , admin ,deleteCoupon )



export default router