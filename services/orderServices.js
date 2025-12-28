import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/appError.js';

// --- IMPORTANT: Ensure models are registered ---
// We import these files just to make sure Mongoose knows about them.
import '../models/order.js'; 
import '../models/cart.js';
import '../models/products.js'; 
import '../models/users.js';
// import '../models/coupons.js'; // Uncomment if you have a coupons.js file

// Helper to safely get models (Prevents Circular Dependency Errors)
const getModel = (name) => mongoose.model(name);

// --- 1. Place Order ---
export const placeOrder = async (userId, addressId, paymentMethod) => {
  // We load models HERE, not at the top. This fixes the "Buffering Timeout".
  const Order = getModel('Order');
  const Cart = getModel('Cart');
  const User = getModel('User');
  const Product = getModel('Products'); // Ensure this matches your model definition (Product vs Products)
  
  // Optional: Only load Coupon if the model exists
  let Coupons;
  try { Coupons = getModel('Coupons'); } catch (e) { Coupons = null; }

  // A. Fetch Cart
  const cart = await Cart.findOne({ user: userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // B. Fetch User & Address
  const user = await User.findById(userId);
  const selectedAddr = user.addresses.id(addressId);
  if (!selectedAddr) {
    throw new AppError("Delivery address not found", 404);
  }

  // C. Wallet Payment Logic
  if (paymentMethod === 'wallet') {
    if (user.walletBalance < cart.grandTotal) {
      throw new AppError("Insufficient wallet balance", 400);
    }
    user.walletBalance -= cart.grandTotal;
    await user.save();
  }

  // D. Build Order Items & Check Stock
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) throw new AppError(`Product not found`, 404);

    const variant = product.variants.id(item.variantId);
    if (!variant) throw new AppError(`Variant not found for ${product.productName}`, 404);

    // Stock Check
    const currentStock = variant.stock[item.size] || 0;
    if (currentStock < item.quantity) {
      throw new AppError(`Out of stock: ${product.productName} (${item.size})`, 400);
    }

    // Deduct Stock
    const stockPath = `variants.$.stock.${item.size}`;
    await Product.findOneAndUpdate(
      { _id: product._id, "variants._id": item.variantId },
      { $inc: { [stockPath]: -item.quantity } }
    );

    // Resolve Image
    let itemImage = "https://placehold.co/150";
    if (variant.variantImages?.length > 0) itemImage = variant.variantImages[0];
    else if (product.coverImages?.length > 0) itemImage = product.coverImages[0];

    orderItems.push({
      productId: product._id,
      name: product.productName,
      image: itemImage,
      price: item.price,
      quantity: item.quantity,
      color: variant.productColor,
      size: item.size,
      itemStatus: 'Ordered'
    });
  }

  // E. Create the Order
  const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
  
  const newOrder = new Order({
    user: userId,
    orderId: orderId,
    items: orderItems,
    shippingAddress: {
      fullName: `${selectedAddr.firstName} ${selectedAddr.lastName}`,
      phone: selectedAddr.phoneNumber,
      street: `${selectedAddr.addressLine1} ${selectedAddr.addressLine2 || ''}`.trim(),
      city: selectedAddr.city,
      state: selectedAddr.state,
      country: selectedAddr.country,
      pincode: selectedAddr.pincode
    },
    payment: {
      method: paymentMethod,
      status: (paymentMethod === 'cod') ? 'pending' : 'paid',
      transactionId: null 
    },
    subtotal: cart.subTotal,
    discount: cart.discount,
    shippingFee: cart.shippingFee,
    totalAmount: cart.grandTotal,
    couponCode: cart.couponCode,
    couponId: cart.couponId,
    status: 'Pending',
    timeline: [
      { status: 'Pending', comment: 'Order placed successfully' }
    ]
  });

  await newOrder.save();

  // F. Update Coupon Usage
  if (cart.couponId && Coupons) {
    await Coupons.findByIdAndUpdate(cart.couponId, { $inc: { usedCount: 1 } });
  }

  // G. Clear Cart
  await Cart.findOneAndDelete({ user: userId });

  return newOrder;
};

// --- 2. Get User Orders ---
export const getUserOrders = async (userId) => {
  const Order = getModel('Order');
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

// --- 3. Cancel Order (UPDATED: Supports Item-Level Cancellation) ---
export const cancelOrder = async (userId, orderId, reason, itemId = null) => {
  const Order = getModel('Order');
  const order = await Order.findOne({ _id: orderId, user: userId });
  
  if (!order) throw new AppError('Order not found', 404);

  // A. Cancel Specific Item (If itemId is provided)
  if (itemId) {
      const item = order.items.id(itemId);
      if (!item) throw new AppError('Item not found in this order', 404);

      if (item.itemStatus === 'Cancelled') throw new AppError('Item is already cancelled', 400);
      if (item.itemStatus === 'Delivered') throw new AppError('Cannot cancel a delivered item', 400);

      // Update the specific Item Status
      item.itemStatus = 'Cancelled';

      // Check if ALL items are now cancelled. If so, update the parent order status.
      const allCancelled = order.items.every(i => i.itemStatus === 'Cancelled');
      if (allCancelled) {
          order.status = 'Cancelled';
          order.cancellationReason = 'All items cancelled by user';
      }

      order.timeline.push({ 
        status: allCancelled ? 'Cancelled' : 'Updated', 
        comment: `Item (${item.name}) cancelled by user`, 
        date: new Date() 
      });

      // NOTE: If you need to refund to wallet, add logic here:
      // if (order.payment.status === 'paid') { ...refund logic... }
  } 
  
  
  return await order.save();
};