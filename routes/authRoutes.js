
const express= require('express')
const router= express.Router()
const { loginUser, refreshAccessToken, createUser, forgotPassword, verifyOtp, resetPassword,  } = require('../controllers/authController')



router.post('/login',loginUser)
router.post('/signup',createUser)
router.post('/refresh-token',refreshAccessToken)
router.post('/forgot-password',forgotPassword)
router.post('/verify-otp',verifyOtp)
router.patch('/reset-password',resetPassword)

module.exports=router