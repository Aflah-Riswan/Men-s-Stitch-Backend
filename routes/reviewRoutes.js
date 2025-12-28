import express from 'express';
import { getFeaturedReview, postReview } from '../controllers/reviewController.js';
import  { protect } from '../middlewares/authMiddleware.js'
const router = express.Router();

router.get('/featured', getFeaturedReview);
router.post('/',protect , postReview )
export default router;