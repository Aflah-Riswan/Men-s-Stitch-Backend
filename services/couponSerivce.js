
import Coupons from "../models/coupons.js";
import AppError from "../utils/appError.js";


export const addCouponService = async (data) => {
  console.log(data)
  const isExist = await Coupons.findOne({ couponCode: data.couponCode })
  console.log("isExist : ", isExist)
  if (isExist) throw new AppError('Coupon already exist', 409, 'COUPON_ALREADY_EXISTED')
  const coupon = new Coupons(data)
  const savedCoupon = await coupon.save()
  return {
    success: true,
    message: ' coupon added succesfully ',
  }

}


export const getCouponService = async (data) => {
  const {
    page = Number(data.page) || 1,
    limit = Number(data.limit) || 5,
    search = '',
    offerLimit,
    status,
    sort,
    discount,
    expiryDate
  } = data;

  const skip = (page - 1) * limit;

  const filter = {isDeleted : false};

  if (search) {
    filter.$or = [{ couponCode: { $regex: search, $options: 'i' } }];
  }

  if (status) {
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
  }

  if (discount) {
    filter.discountType = discount;
  }

  if (expiryDate) {
    const searchDate = new Date(expiryDate);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);
    filter.expiryDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  if (offerLimit) {
    if (offerLimit === 'unlimited') filter.isUnlimited = true;
    else filter.isUnlimited = false;
  }

  let sortQuery = { createdAt: -1 };

  if (sort === 'newest') sortQuery = { createdAt: -1 };
  if (sort === 'oldest') sortQuery = { createdAt: 1 };

  if (sort === 'discount-high') sortQuery = { discountValue: -1 };
  if (sort === 'discount-low') sortQuery = { discountValue: 1 };

  const coupons = await Coupons.find(filter)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);


  const total = await Coupons.countDocuments(filter);

  return coupons;
}


export const updateIsActive = async (couponId) => {
  const couponToEdit = await Coupons.findOne({ _id: couponId })
  if (!couponToEdit) throw new AppError('Coupon is not found ', 404, 'COUPON_IS_NOT_FOUND')
  couponToEdit.isActive = !couponToEdit.isActive
  await couponToEdit.save()
  return {
    success: true,
    message: 'updated Succesfully'
  }
}
export const getCouponById = async (couponId) => {
  if (!couponId) throw new AppError('Coupon Id is Missing ', 400, 'COUPON_ID_ IS_MISSING')
  const coupon = await Coupons.findOne({ _id: couponId })
  if (!coupon) throw new AppError('Coupon is not found', 404, 'COUPON_IS_NOT_FOUND')
  return coupon
}
export const updateCoupon = async (couponId, data) => {
  const isExisted = await Coupons.findOne({ _id: couponId })
  if (!isExisted) throw new AppError('Coupon is not found', 404, 'COUPON_IS_NOT_FOUND')
  const response = await Coupons.findByIdAndUpdate(couponId, { $set: data }, { new: true, runValidators: true }
  );
  return response
}
export const deleteCoupon = async (couponId) => {
  const couponToDelete = await Coupons.findOne({ _id: couponId })
  if (!couponToDelete) throw new AppError('Coupon is not found ', 404, 'COUPON_IS_NOT_FOUND')
  couponToDelete.isDeleted = true
  await couponToDelete.save()
  return {
    success: true,
    message: 'deleted Succesfully'
  }
}

