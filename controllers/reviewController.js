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

export const postReview = async (req,res,next) =>{
  try {
    const userId = req.user._id
    const { productId , orderId, rating , comment  } = req.body
    const response = await reviewService.postReview(userId , productId , orderId ,rating , comment)
    return res.json({
      success : true ,
      message :' Your review submitted Successfully'
    })
  } catch (error) {
    next(error)
  }
}