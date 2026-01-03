import User from '../models/users.js';
import { sendEmail } from '../utils/sendEmail.js';
import { validateUserLogin, validateUserSignup } from '../utils/userValidate.js';
import Otp from '../models/OtpTemp.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import { OAuth2Client } from 'google-auth-library';
import Cart from '../models/cart.js';

const genearteAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' });
};

export const loginService = async (userData) => {

  const { error } = validateUserLogin(userData);
  if (error) throw new AppError(error.details[0].message, 400, 'VALIDATION_ERROR');

  const { email, password } = userData;
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User does not find', 404, 'USER_NOT_FOUND')

  if (!user.password) {
    throw new AppError(
      'This account was created with Google. Please sign in with Google.',
      400,
      'INVALID_LOGIN_METHOD'
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid Email or Password ', 401, 'INVALID_CREDENTIALS')

  const accessToken = genearteAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const updated = await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });

  return { success: true, message: " Welcome to dashboard ", accessToken, refreshToken, role: user.role };


};

export const refreshAccessTokenService = async (refreshToken) => {

  if (!refreshToken) throw new AppError('Session Expired Please Login again ', 401, 'NO_REFERESH_TOKEN')

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid Session', 403, 'INVALID_REFRESH_TOKEN')
  const newAccessToken = genearteAccessToken(user);
  return { success: true, accessToken: newAccessToken };

};

export const createUserService = async (data) => {

  const { error, value } = validateUserSignup(data);
  if (error) throw new AppError(error.details[0].message, 400, 'VALIDATION ERROR')

  const { firstName, lastName, phone, email, password } = value;
  const isExisted = await User.findOne({ email });

  if (isExisted) throw new AppError('User already exists with this email ', 409, ' USER_ALREADY_EXIST')

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    firstName,
    lastName,
    phone,
    email,
    password: hashedPassword,
    isPhoneVerified: phone ? true : false
  });

  const accessToken = genearteAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);
  newUser.refreshToken = refreshToken;

  const savedUser = await newUser.save();

  if (savedUser) {
    return {
      success: true,
      message: 'account created succesfully',
      accessToken,
      refreshToken,
      user: savedUser
    };
  }

};

export const forgotPassWordService = async (email) => {


  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid or expired OTP", 400, 'INVALID_OTP');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email: email });

  await Otp.create({
    email: email,
    otp: otp
  });


  const htmlMessage = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Verification Code</h2>
          <p>Please use the following code to reset your password:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        </div>
    `;

  const emailRespond = await sendEmail(user.email, 'Your OTP for Verification', htmlMessage);
  if (!emailRespond) throw new AppError('Failed to send email. Please try again later.', 500, 'EMAIL_SEND_FAILED')

  return { success: true, message: 'OTP sent successfully to your email' }

};

export const verifyOtpService = async (email, inputOtp) => {

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404, 'USER_NOT_FOUND');

  const otpRecord = await Otp.findOne({ email: email, otp: inputOtp });
  if (!otpRecord) throw new AppError("Invalid or expired OTP code", 400, 'INVALID_OTP');

  await Otp.deleteOne({ _id: otpRecord._id });
  return { success: true, message: 'Successfully verified' };



};

export const resetPasswordService = async (email, password) => {

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } }, { $new: true });
  if (!user) throw new AppError('Could not reset password. User not found.', 404, 'USER_NOT_FOUND');
  return { success: true, message: ' updated succesfully' }

};

export const googleLogin = async (token) => {
  try {
    if (!token) return { success: false, message: ' token is required ' }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const userInfo = ticket.getPayload()
    const { email, name, picture, sub, given_name, family_name, } = userInfo
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        name,
        email,
        firstName: given_name,
        lastName: family_name,
        profilePic: picture,
        googleId: sub,
        password: null,
      })

      await Cart.create({
        user: user._id,
        items: [],
        totalPrice: 0,
        grandTotal: 0
      });
      
    } else {

      if (!user.googleId) {
        user.googleId = sub
        user.profilePic = picture
        await user.save()
      }
    }
    const accessToken = genearteAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken
    const savedUser = await user.save()
    return {

      success: true,
      message: 'account created succesfully',
      accessToken,
      refreshToken,
      user: savedUser

    }
  } catch (error) {
    console.log("error found in : ", error)
    throw new AppError('Google authentication failed', 400, 'GOOGLE_AUTH_FAILED');
  }
}