
import * as addressService from '../services/addressService.js'


export const addAddress = async (req, res, next) => {
  try {
    const addressData = req.body
    const userId = req.user._id
    const response = await addressService.addNewAddress(addressData, userId)
    console.log(response)
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: response
    });
  } catch (error) {
    next(error)
  }
}