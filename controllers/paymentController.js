
import * as paymentService from '../services/paymentService.js'

export const createRazorPayOrderId = async (req, res, next) => {
  try {
    console.log(" inside controller")
    const { amount } = req.body
    console.log(" ampunt : ", amount)
    const response = await paymentService.createRazorPayOrderId(amount)

    return res.json(response)
  } catch (error) {
    next(error)
  }
}

export const placeOnlineOrder = async (req, res, next) => {

  try {
    const userId = req.user._id
    const data = req.body
    const response = await paymentService.placeOnlineOrder(userId, data)
  } catch (error) {
    next(error)
  }

}