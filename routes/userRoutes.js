import express from 'express';
import { admin, protect } from '../middlewares/authMiddleware.js';
import { getUsers, blockUser, getCustomerAnalytics, getUserInfo } from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/analytics', getCustomerAnalytics);
router.patch('/:id/block', blockUser);
router.get('/info',protect, getUserInfo)

export default router;