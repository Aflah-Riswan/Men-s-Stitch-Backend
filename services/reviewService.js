import mongoose from 'mongoose';
import Reviews from '../models/review.js';
import AppError from '../utils/appError.js';

const getModel = (name) => mongoose.model(name);

export const getFeaturedReviewService = async () => {
  const reviews = await Reviews.aggregate([
    { $match: { rating: 5, isApproved: true } },
    { $sample: { size: 3 } }
  ]);
  if (!reviews || reviews.length === 0) {
    return { success: true, reviews: [] };
  }
  await Reviews.populate(reviews, { path: 'user', select: 'email firstName' });
  return {
    success: true,
    reviews
  };
};
export const postReview = async (userId , productId , orderId ,rating , comment) => {

  const Order = getModel('Order');
  const User = getModel('User');
  const Review = getModel('Review');
  const Product = getModel('Products'); 

 
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(productId)) {
     throw new AppError('Invalid ID format', 400);
  }

  const order = await Order.findById(orderId);
  const user = await User.findById(userId);

  if(user.isBlocked){
    throw new AppError('You Are Blocked ',403,'user_is_blocked')
  }

  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const purchasedItem = order.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!purchasedItem) {
    throw new AppError('Product not found in this order', 404);
  }

  if (purchasedItem.itemStatus !== 'Delivered') {
    throw new AppError('You can only review delivered items', 400);
  }

  const existingReview = await Review.findOne({ user: userId, product: productId, orderId: orderId });
  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const newReview = new Review({
    product: productId,
    user: userId,
    orderId: orderId,
    userName: user.firstName, 
    rating: Number(rating),
    comment: comment,
    isVerifiedPurchase: true,
    isApproved: true
  });

  await newReview.save();

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { 
      $group: { 
        _id: '$product', 
        avgRating: { $avg: '$rating' }, 
        nRating: { $sum: 1 } 
      } 
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': stats[0].avgRating,
      'rating.count': stats[0].nRating
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }

  return newReview;
};