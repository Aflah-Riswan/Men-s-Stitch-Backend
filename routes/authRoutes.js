
const express= require('express')
const router= express.Router()
const { loginUser, refreshAccessToken, createUser,  } = require('../controllers/authController')



router.post('/login',loginUser)
router.post('/signup',createUser)
router.post('/refresh-token',refreshAccessToken)

module.exports=router