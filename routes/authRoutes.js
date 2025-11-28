
const express= require('express')
const router= express.Router()
const { loginUser, refreshAccessToken } = require('../controllers/authController')



router.post('/login',(req,res,next)=>{
  console.log(" inside authRoutes")
  next()
}, loginUser)
router.post('/refresh-token',refreshAccessToken)

module.exports=router