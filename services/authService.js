const User = require("../models/users")
const { validateUserLogin } = require("../utils/userValidate")
const bcrypt = require('bcrypt')
const express= require('express')
const app= express()

app.use(express.json())

const loginService = async (userData) =>{

  const { err } =validateUserLogin(userData)
  if(err) return {success:false,error :err.details[0].message}
  const {email,password} = userData
  const user = await User.findOne({email})
  if(!user) return {success:false,error: " user is not existed "}
  const isMatch =await bcrypt.compare(password,user.password)
  if(isMatch) return {success:true,message:" Welcome to dashboard "}
  else return {success:false,error : 'Invalid credentials',}

}

module.exports={loginService}