

import * as couponService from '../services/couponSerivce.js';

export const addCoupon = async (req, res, next) => {
console.log("reached here")
  try {
    const data = req.body
    const response = await couponService.addCouponService(data)
   console.log(response)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const getCoupons = async (req,res,next) =>{
  try {
    const response = await couponService.getCouponService()
    return res.json({
      success : true,
      message :' data fetched succesfully',
      data: response
    })
  } catch (error) {
    next(error)
  }
}