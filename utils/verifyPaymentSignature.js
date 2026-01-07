
export const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  console.log("Secret Key Exists:", !!process.env.RAZORPAY_SECRET_KEY);

  // 2. Log the inputs
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  console.log("Generated Body:", body);
  console.log("Received Signature:", razorpay_signature);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest('hex');

  console.log("Calculated Signature:", expectedSignature);

  // 3. Compare
  const isMatch = expectedSignature === razorpay_signature;
  console.log("Signature Match:", isMatch);

  return isMatch;
}