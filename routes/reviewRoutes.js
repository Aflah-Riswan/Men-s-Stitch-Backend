import express from 'express';
import { getFeaturedReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/featured', getFeaturedReview);

export default router;