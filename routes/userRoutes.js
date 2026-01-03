import express from 'express';
import { admin, protect } from '../middlewares/authMiddleware.js';
import { getUsers, blockUser, getCustomerAnalytics, getUserInfo, updateUserDetails, changeUserPassword, updatePhoneNumber } from '../controllers/userController.js';
import { upload } from '../config/configAws.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/analytics', getCustomerAnalytics);
router.patch('/:id/block', blockUser);
router.get('/info',protect, getUserInfo)
router.put('/update-details',protect,upload.single('profilePic'), updateUserDetails)
router.patch('/update/password' , protect , changeUserPassword)
router.patch('/phone/update',protect ,updatePhoneNumber)
export default router; 