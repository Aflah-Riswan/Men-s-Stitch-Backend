import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  itemStatus: { type: String, default: 'Ordered' } // Individual item status (e.g., Cancelled, Returned)
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, unique: true, required: true }, // Unique ID like ORD_123456
  
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
    method: { type: String, enum: ['cod', 'card', 'wallet', 'upi'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String, default: null }
  },
  
  // Financials
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Coupon Info
  couponCode: { type: String, default: null },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupons', default: null },
  
  // Overall Status
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], 
    default: 'Pending' 
  },
  cancellationReason: { type: String, default: null },
  
  timeline: [timelineSchema]

}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;