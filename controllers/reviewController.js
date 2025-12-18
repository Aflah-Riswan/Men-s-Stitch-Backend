import * as reviewService from '../services/reviewService.js';

export const getFeaturedReview = async (req, res, next) => {
  try {
    const response = await reviewService.getFeaturedReviewService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getFeaturedReview controller:", error);
    next(error);
  }
};