

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
export const getCoupons = async (req, res, next) => {
  try {
    const { page ,
       discount , 
       offerLimit , 
       sort, 
       status , 
       search , 
       expiryDate  } = req.query
    const response = await couponService.getCouponService(
      { page ,
        discount , 
        offerLimit , 
        sort, 
        status , 
        search , 
        expiryDate
      })
    return res.json({
      success: true,
      message: ' data fetched succesfully',
      coupons: response
    })
  } catch (error) {
    next(error)
  }
}

export const updateIsActive = async (req, res, next) => {
  try {
    const { couponId } = req.params
    const response = await couponService.updateIsActive(couponId)
    return res.json(response)
  } catch (error) {
    next(error)   
  }
}