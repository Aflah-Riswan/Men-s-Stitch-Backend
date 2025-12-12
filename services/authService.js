const User = require("../models/users")
const { sendEmail } = require("../utils/sendEmail")
const { validateUserLogin, validateUserSignup } = require("../utils/userValidate")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const genearteAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' })
}
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' })
}
const loginService = async (userData) => {
  try {
    console.log("inside login service services file")
    const { error } = validateUserLogin(userData)

    if (error) return { success: false, error: error.details[0].message }
    const { email, password } = userData
    const user = await User.findOne({ email })
    if (!user) return { success: false, error: " user is not existed " }
    const isMatch = await bcrypt.compare(password, user.password)
    if (isMatch) {
      const accessToken = genearteAccessToken(user)
      console.log("accesstoken : ", accessToken)

      const refreshToken = generateRefreshToken(user)
      console.log("refreshtoken : ", refreshToken)
      const updated = await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken })
      console.log(updated)

      console.log("completed saving")
      return { success: true, message: " Welcome to dashboard ", accessToken, refreshToken, role: user.role }
    }
    else return { success: false, error: 'Invalid credentials', }
  } catch (error) {
    console.log(error)
  }

}

const refreshAccessTokenService = async (refreshToken) => {

  try {
    if (!refreshToken) {
      return { success: false, message: "no refresh token" }
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY)
    const user = await User.findById(decoded.id)
    if (!user) return { succeess: false, message: "user is not found " }
    if (user.refreshToken !== refreshToken) return { success: false, message: 'invalid refresh token' }
    const newAccessToken = genearteAccessToken(user)
    return { success: true, accessToken: newAccessToken }

  } catch (error) {
    console.log(" found error in refreshServie : ", error)
  }
}

const createUserService = async (data) => {
  try {
    const { error, value } = validateUserSignup(data)
    if (error) return { success: false, message: error.details[0].message }
    console.log("value : ", value)
    const { firstName, lastName, phone, email, password } = value
    const isExisted = await User.findOne({ email })
    console.log("isEXISTED : ", isExisted)
    if (isExisted) return { success: false, message: ' user already existed ' }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      isPhoneVerified: true
    })

    const accessToken = genearteAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)
    newUser.refreshToken = refreshToken

    const savedUser = await newUser.save()

    if (savedUser) {
      return {
        success: true,
        message: 'account created succesfully',
        accessToken,
        refreshToken,
        user: savedUser
      }
    } else {
      return {
        success: false,
        message: 'cant create an account'
      }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

const forgotPassWordService = async (email) => {
  try {
    const user = await User.findOne({ email })
    if (!user) return { success: false, message: 'The user in not already exist' }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.resetPasswordOTP = otp
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save()

    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Verification Code</h2>
          <p>Please use the following code to sign in:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
    `;

    const emailRespond = await sendEmail(user.email, 'Your OTP for Verification', htmlMessage)
    if (emailRespond) {
      return { success: emailRespond.success, message: emailRespond.message }
    }
  } catch (error) {
    console.log(error)
  }
}

const verifyOtpService = async (email, inputOtp) => {
  try {
    const user = await User.findOne({ email })
    if (!user) return { success: false, message: 'user is not found' }
    if (user.resetPasswordExpires > Date.now()) {
      console.log(inputOtp)
      console.log(user.resetPasswordOTP)
      if (user.resetPasswordOTP === inputOtp) {

        return { success: true, message: 'successfull verified' }

      } else {

        return { success: false, message: 'invalid otp code' }

      }
    } else {

      return { success: false, message: 'time is expired resend otp' }

    }
  } catch (error) {
    console.log(error)
    return { success: false, message: error.message }
  }
}

const resetPasswordService = async (email, password) => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } }, { $new: true })
    if (user) {
      return { success: true, message: ' updated succesfully' }
    } else {
      return { success: false, message: ' cant find the user' }
    }
  } catch (error) {
    return {success:false,message : error.message}
  }
}

module.exports = { loginService, refreshAccessTokenService, createUserService, forgotPassWordService, verifyOtpService , resetPasswordService}