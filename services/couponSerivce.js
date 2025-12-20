
import Coupons from "../models/coupons.js";
import AppError from "../utils/appError.js";


export const addCouponService = async (data) => {
 console.log(data)
  const isExist = await Coupons.findOne({ couponCode: data.couponCode })
  console.log("isExist : ",isExist)
  if (isExist) throw new AppError('Coupon already exist', 409, 'COUPON_ALREADY_EXISTED')
  const coupon = new Coupons(data)
  const savedCoupon = await coupon.save()
  return {
    success: true,
    message: ' coupon added succesfully ',
  }

}
export const getCouponService = async () =>{
  const coupons = await Coupons.find()
  return coupons
}