
import * as wishListService from '../services/wishListServices.js'

export const addToWishList = async (req, res, next) => {
  try {
    const wishListData = req.body.data
    const userId = req.user._id
    const response = await wishListService.addToWishList(wishListData, userId)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { itemId } = req.params
    const userId = req.user._id
    const response = await wishListService.removeFromWishlist(userId, itemId)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id
    const response = await wishListService.getWishlist(userId)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}