const User = require("../models/users")
const { validateUserLogin } = require("../utils/userValidate")
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')

const genearteAccessToken = (user)=>{
  return jwt.sign({id:user._id,role:user.role},process.env.ACCESS_TOKEN_KEY,{expiresIn:'5m'})
}
const generateRefreshToken = (user) =>{
   return jwt.sign({id:user._id,role:user.role},process.env.REFRESH_TOKEN_KEY,{expiresIn:'7d'})
}
const loginService = async (userData) =>{
  try {
  console.log("inside login service services file")
  const { error } =validateUserLogin(userData)
  
  if(error) return {success:false,error :error.details[0].message}
  const {email,password} = userData
  const user = await User.findOne({email})
  if(!user) return {success:false,error: " user is not existed "}
  const isMatch =await bcrypt.compare(password,user.password)
  if(isMatch){
    const accessToken=genearteAccessToken(user)
    console.log("accesstoken : ",accessToken)
    
    const refreshToken=generateRefreshToken(user)
    console.log("refreshtoken : ",refreshToken)
    const updated = User.findByIdAndUpdate(user._id,{refreshToken:refreshToken})
    console.log(updated)
   
    console.log("completed saving")
   return {success:true,message:" Welcome to dashboard ",accessToken,refreshToken,role:user.role}
  } 
  else return {success:false,error : 'Invalid credentials',}
  } catch (error) {
    console.log(error)
  }

}

const refreshAccessTokenService = async (refreshToken) =>{
  
  try {
    if(!refreshToken){
      return {success:false ,message : "no refresh token"}
    }
    const decoded = await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_KEY)
    const user = await User.findById(decoded.id)
    if(!user) return {succeess: false , message : "user is not found "}
    if(user.refreshToken !== refreshToken ) return { success : false ,message:'invalid refresh token'}
    const newAccessToken = genearteAccessToken(user)
    return {success:true,accessToken : newAccessToken}
  
  } catch (error) {
    console.log(" found error in refreshServie : ",error)
  }
}

module.exports={loginService,refreshAccessTokenService}