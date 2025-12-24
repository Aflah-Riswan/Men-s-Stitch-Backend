import mongoose from 'mongoose';

const itemsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true } 
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
  items: [itemsSchema], 
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupons', default: null },
  couponCode: { type: String, default: null }, 
  discount: { type: Number, required: true, default: 0 },
  subTotal: { type: Number, required: true, default: 0 },
  shippingFee: { type: Number, required: true, default: 0 }, 
  grandTotal: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;