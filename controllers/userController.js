import { uploadSingleFileService } from '../services/uploadService.js';
import * as userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = '',
      sort = '',
      active = ''
    } = req.query;

    const response = await userService.getUserService({ page, limit, search, sort, active });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await userService.blockUserService(id);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const response = await userService.analyticsService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("Analytics Controller Error:", error);
    next(error);
  }
};
export const getUserInfo = async (req, res, next) => {
  try {
    console.log("reache here")
    const userId = req.user._id
    const response = await userService.getUserInfo(userId)
    console.log("response", response)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const updateUserDetails = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { firstName, lastName } = req.body
    const userData = {
      firstName,
      lastName,
    }
    console.log("File received by Controller:", req.file);
    if (req.file) {
      const { imageUrl } = await uploadSingleFileService(req.file);
      userData.profilePic = imageUrl;
    }

    const updatedData = await userService.updateUserDetails(userId, userData)
    return res.json({ success: true, message: ' updated succesfully ', updatedData })
  } catch (error) {
    next(error)
  }
}
export const changeUserPassword = async (req,res,next) =>{
  try {
    const userId = req.user._id
    const { currentPassword , newPassword } = req.body
    const response = await userService.changePasswordService(userId ,currentPassword , newPassword )
    return res.json({ success: true , message : ' updated succesfully'})
  } catch (error) {
    next(error)
  }
}