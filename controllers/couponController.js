

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
    const { page=1,
      discount=0,
      offerLimit=0,
      sort='',
      status='active',
      search='',
      expiryDate} = req.query
    const response = await couponService.getCouponService(
      {
        page,
        discount,
        offerLimit,
        sort,
        status,
        search,
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

export const getCouponById = async (req, res, next) => {
  try {
    const { couponId } = req.params
    const response = await couponService.getCouponById(couponId)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const updateCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.params
    const data = req.body
    const response = await couponService.updateCoupon(couponId , data )
    console.log(response)
    return res.json({
      success : true,
      message : ' updated succesfully'
    })
  } catch (error) {
    next(error)
  }
}
export const deleteCoupon = async (req,res ,next) =>{
  try {
    const { couponId } = req.params
    const response = await couponService.deleteCoupon(couponId)
    return res.json({
      success : true ,
      message :'  delete successfully'
    })
  } catch (error) {
    next(error)
  }
}
export const getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await couponService.fetchAvailableCoupons();
    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
}