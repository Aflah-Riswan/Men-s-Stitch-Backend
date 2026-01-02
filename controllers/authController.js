import * as authService from '../services/authService.js';

export const loginUser = async (req, res, next) => {

  try {
    const result = await authService.loginService(req.body);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });

    return res.json({ success: true, message: result.message, accessToken: result.accessToken, role: result.role });

  } catch (error) {
    next(error)
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const result = await authService.refreshAccessTokenService(refreshToken);

    return res.json({
      success: true,
      accessToken: result.accessToken
    });

  } catch (error) {
    next(error)
  }
};

export const createUser = async (req, res, next) => {
  try {

    const response = await authService.createUserService(req.body);
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    return res.json({
      success: true, message: response.message,
      accessToken: response.accessToken, role: response.user.role
    });

  } catch (error) {
    next(error)
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    const response = await authService.forgotPassWordService(email);
    return res.json({ success: response.success, message: response.message });
  } catch (error) {
    next(error)
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, inputOtp } = req.body;
    const response = await authService.verifyOtpService(email, inputOtp);
    return res.json(response);
  } catch (error) {
    next(error)
  }
};

export const resetPassword = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const response = await authService.resetPasswordService(email, password);
      return res.json(response);
    
  } catch (error) {
    next(error)
  }
};

export const googleLogin  = async  (req,res, next) =>{
  try {
    const { token } = req.body
    const response = await authService.googleLogin(token)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}