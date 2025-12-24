
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
export const getAddress = async (req, res, next) => {
  try {
    const userId = req.user._id
    const addresses = await addressService.getAddress(userId)
    return res.status(200).json({
      success: true,
      message: 'Address fetched successfully',
      addresses
    });
  } catch (error) {
    next(error)
  }
}

export const updateAddress = async (req,res,next) =>{
  try {
    const userId = req.user._id
    const address = req.body
    const { addressId } = req.params
    const response = await addressService.updateAddress(userId , addressId , address)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}