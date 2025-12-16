import Reviews from '../models/review.js';

export const getFeaturedReviewService = async () => {
  try {
    const reviews = await Reviews.aggregate([
      { $match: { rating: 5, isApproved: true } }, 
      { $sample: { size: 3 } }
    ]);  
    await Reviews.populate(reviews, { path: 'user', select: 'email firstName' });
    return {
      success: true,
      reviews
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};