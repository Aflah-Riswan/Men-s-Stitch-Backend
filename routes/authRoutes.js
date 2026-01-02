import express from 'express';
import { 
  loginUser, 
  refreshAccessToken, 
  createUser, 
  forgotPassword, 
  verifyOtp, 
  resetPassword, 
  googleLogin
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', createUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.patch('/reset-password', resetPassword);
router.post('/google/login',googleLogin)
export default router;