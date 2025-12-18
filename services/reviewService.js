import Reviews from '../models/review.js';

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