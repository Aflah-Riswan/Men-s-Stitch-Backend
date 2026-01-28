import { razorpayInstance } from "../config/razorpay.js"
import Order from "../models/order.js";
import AppError from "../utils/appError.js";
import crypto from 'crypto'
import { placeOrder } from "./orderServices.js";

const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  console.log("Secret Key Exists:", !!process.env.RAZORPAY_SECRET_KEY);

 
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  console.log("Generated Body:", body);
  console.log("Received Signature:", razorpay_signature);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest('hex');

  console.log("Calculated Signature:", expectedSignature);


  const isMatch = expectedSignature === razorpay_signature;
  console.log("Signature Match:", isMatch);

  return isMatch;
}

export const createRazorPayOrderId = async (amount) => {
  console.log(" amount trypw : ",typeof amount)
  if (!amount || isNaN(amount)) {
    throw new AppError("Invalid amount passed to payment service", 404, 'Invalid amount passed to payment service');
  }
  try {
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);
    return {
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
    };

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Razorpay Order Creation Failed");
  }
}

export const placeOnlineOrder = async (userId, data) => {

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    shippingAddress
  } = data
  const isSignatureValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isSignatureValid) throw new AppError('Payment verification failed', 403, 'VERFICATION FAILED')

  return await placeOrder(userId, shippingAddress, 'razorpay', razorpay_payment_id);
}
