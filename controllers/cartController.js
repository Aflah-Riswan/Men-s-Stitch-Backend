
import * as cartService from '../services/cartService.js'

export const addToCart = async (req, res , next) =>{
  try {
    console.log("hellooo")
    const cartItem = req.body
    const userId = req.user._id
    const response = await cartService.addToCart(userId , cartItem)
     return res.json({updatedCart : response})
  } catch (error) {
    next(error)
  }
}
export const getCartItems = async(req,res,next)=>{
  try {
    const userId = req.user._id
    const response = await cartService.getCartItems(userId)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}