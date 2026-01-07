import Transaction from "../models/transactions.js"
import User from "../models/users.js"
import AppError from "../utils/appError.js"
import { verifyPaymentSignature } from "../utils/verifyPaymentSignature.js"

export const getMyWallet = async (userId) => {

  const user = await User.findById(userId)
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  const transaction = await Transaction.find({ user: userId })
  if (!transaction) throw new AppError('Transaction Details is not found', 404, 'TRANSACTION DETAILS IS NOT FOUND')
  return {
    walletBalance: user.walletBalance || 5000,
    transactionDetails: transaction
  }
}
export const addMoneyToWallet = async (userId, data) => {
  const { amount, razorpay_payment_id, razorpay_order_id, razorpay_signature, description } = data
  const isVerified = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isVerified) throw new AppError('razorpay verification is failed', 400, 'RAZORPAY_VERIFICATION_IS FAILED')

  const newTransaction = new Transaction({
    user: userId,
    order: newOrder._id,
    paymentId,
    amount,
    transactionType: 'Credit',
    status: 'Success',
    method: 'Razorpay',
    description: description
  })
  newTransaction.save()
 return { success : true , message : ' added succesfully'}
}