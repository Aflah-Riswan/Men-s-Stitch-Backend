import * as walletService from '../services/walletService.js'

export const addMoneyToWallet = async (req , res , next) =>{
  try {
    const data = req.body
    console.log(" data : ",data)
    const userId = req.user._id
    const response = await walletService.addMoneyToWallet(userId , data)
    
    return res.json(response)
  } catch (error) {
    next(error)
  }
}
export const getMyWallet = async (req,res ,next) =>{
  try {
    const user = req.user._id
    const response = await walletService.getMyWallet(user)
    return res.json(response)
  } catch (error) {
    next(error)
  }
}