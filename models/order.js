import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  returnReason: { type: String, default: null },
  itemStatus: { type: String, default: 'Ordered' } 
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, unique: true, required: true }, 
  
  items: [orderItemSchema],
  
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  
  payment: {
    method: { type: String, enum: ['cod', 'razorpay', 'wallet'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String, default: null }
  },
  

  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  

  couponCode: { type: String, default: null },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupons', default: null },
  
  
  status: { 
    type: String, 

    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return Requested'], 
    default: 'Pending' 
  },
  cancellationReason: { type: String, default: null },
  
  timeline: [timelineSchema]

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;