
import * as wishListService from '../services/wishListServices.js'

export const addToWishList = async (req, res, next) => {
  try {
    const { productId } = req.body
    const userId = req.user._id
    const response = await wishListService.addToWishList(productId, userId)
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