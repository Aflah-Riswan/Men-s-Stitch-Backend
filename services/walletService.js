import Transaction from "../models/transactions.js"
import User from "../models/users.js"
import AppError from "../utils/appError.js"
import { verifyPaymentSignature } from "../utils/verifyPaymentSignature.js"

export const getMyWallet = async (userId) => {

  const user = await User.findById(userId)
  if (user.isBlocked) throw new AppError('You are Blocked', 403, 'USER_IS_BLOCKED')
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  const transaction = await Transaction.find({ 
    user: userId, 
   $or : [
    { method : 'wallet' },
    { method : 'Wallet' },
    {method : 'wallet' , transactionType : 'Credit'}
   ]
}).sort({ createdAt: -1 });
  if (!transaction) throw new AppError('Transaction Details is not found', 404, 'TRANSACTION DETAILS IS NOT FOUND')
  return {
    walletBalance: user.walletBalance || 1,
    transactionDetails: transaction,
    referralCode: user.referralCode
  }
}
export const addMoneyToWallet = async (userId, data) => {
  const { amount, razorpay_payment_id, razorpay_order_id, razorpay_signature, description } = data
  const isVerified = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isVerified) throw new AppError('razorpay verification is failed', 400, 'RAZORPAY_VERIFICATION_IS FAILED')
  const user = await User.findOne({ _id: userId })
  const newTransaction = new Transaction({
    user: userId,
    paymentId: razorpay_payment_id,
    amount,
    transactionType: 'Credit',
    status: 'Success',
    method: 'Razorpay',
    description: description
  })
  user.walletBalance = (user.walletBalance || 0) + Number(amount)
  user.save()
  newTransaction.save()
  return { success: true, message: ' added succesfully' }
}