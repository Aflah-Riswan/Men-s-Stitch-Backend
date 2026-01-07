import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/appError.js';
import '../models/order.js';
import '../models/cart.js';
import '../models/products.js';
import '../models/users.js';
import Order from '../models/order.js';
import Products from '../models/products.js';
import Transaction from '../models/transactions.js';
const getModel = (name) => mongoose.model(name);

// --- PLACE ORDER ---
export const placeOrder = async (userId, addressId, paymentMethod, transactionId = null) => {
  const Order = getModel('Order');
  const Cart = getModel('Cart');
  const User = getModel('User');
  const Product = getModel('Products');
  let Coupons;
  let purchasedProduct;
  try { Coupons = getModel('Coupons'); } catch (e) { Coupons = null; }

  const cart = await Cart.findOne({ user: userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const user = await User.findById(userId);
  const selectedAddr = user.addresses.id(addressId);
  if (!selectedAddr) {
    throw new AppError("Delivery address not found", 404);
  }

  if (paymentMethod === 'wallet') {
    if (user.walletBalance < cart.grandTotal) {
      throw new AppError("Insufficient wallet balance", 400);
    }
    user.walletBalance -= cart.grandTotal;
    await user.save();
  }

  const orderItems = [];

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) throw new AppError(`Product not found`, 404);

    const variant = product.variants.id(item.variantId);
    if (!variant) throw new AppError(`Variant not found for ${product.productName}`, 404);

    const currentStock = variant.stock[item.size] || 0;
    if (currentStock < item.quantity) {
      throw new AppError(`Out of stock: ${product.productName} (${item.size})`, 400);
    }

    const stockPath = `variants.$.stock.${item.size}`;
    await Product.findOneAndUpdate(
      { _id: product._id, "variants._id": item.variantId },
      { $inc: { [stockPath]: -item.quantity } }
    );

    let itemImage = "https://placehold.co/150";
    if (variant.variantImages?.length > 0) itemImage = variant.variantImages[0];
    else if (product.coverImages?.length > 0) itemImage = product.coverImages[0];
    purchasedProduct = product.productName
    orderItems.push({
      productId: product._id,
      name: product.productName,
      image: itemImage,
      price: item.price,
      quantity: item.quantity,
      color: variant.productColor,
      size: item.size,
      itemStatus: 'Ordered',
      variantId: item.variantId
    });
  }

  const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;
  const isPaid = paymentMethod === 'wallet' || transactionId;

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
      status: isPaid ? 'paid' : 'pending',
      transactionId: transactionId
    },
    subtotal: cart.subTotal,
    discount: cart.discount,
    shippingFee: cart.shippingFee,
    totalAmount: cart.grandTotal,
    couponCode: cart.couponCode,
    couponId: cart.couponId,
    status: isPaid ? 'Processing' : 'Pending',
    timeline: [
      { status: isPaid ? 'Processing' : 'Pending', comment: isPaid ? `Order placed. Payment ID: ${transactionId || 'Wallet'}` : 'Order placed successfully' }
    ]
  });

  await newOrder.save();

  const newTransaction = new Transaction({
    user: userId,
    order: newOrder._id,
    paymentId: transactionId,
    amount: newOrder.totalAmount,
    transactionType: 'Debit',
    status: 'Success',
    method: paymentMethod,
    description: `payment for ${purchasedProduct}`
  })

  await newTransaction.save()

  if (cart.couponId && Coupons) {
    await Coupons.findByIdAndUpdate(cart.couponId, { $inc: { usedCount: 1 } });
  }

  await Cart.findOneAndDelete({ user: userId });

  return newOrder;
};

export const getUserOrders = async (userId) => {
  const Order = getModel('Order');
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const cancelOrder = async (userId, orderId, reason, itemId = null) => {
  const Order = getModel('Order');
  const Products = getModel('Products');
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) throw new AppError('Order not found', 404);

  if (itemId) {
    const item = order.items.id(itemId);
    console.log(" items : ", item)
    if (!item) throw new AppError('Item not found in this order', 404);

    if (item.itemStatus === 'Cancelled') throw new AppError('Item is already cancelled', 400);
    if (item.itemStatus === 'Delivered') throw new AppError('Cannot cancel a delivered item', 400);

    item.itemStatus = 'Cancelled';

    const product = await Products.findById(item.productId)
    if (product) {
      console.log("start of prodct ", product)
      const variant = product.variants.id(item.variantId)
      console.log(" variant : ", variant)
      console.log("start of prodct condotion asin")
      const currentStock = variant.stock[item.size] || 0

      variant.stock[item.size] = currentStock + item.quantity

      product.markModified('variants')

      await product.save()
    }

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
  }

  return await order.save();
};

export const returnOrder = async (userId, orderId, itemId, reason) => {
  const Order = getModel('Order');
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) throw new AppError('Order not found', 404);

  const item = order.items.id(itemId);
  if (!item) throw new AppError('Item not found in this order', 404);

  if (item.itemStatus !== 'Delivered') {
    throw new AppError('Only delivered items can be returned', 400);
  }

  if (item.itemStatus === 'Return Requested' || item.itemStatus === 'Returned') {
    throw new AppError('Return already requested for this item', 400);
  }

  item.itemStatus = 'Return Requested';
  item.returnReason = reason;

  order.timeline.push({
    status: 'Return Requested',
    comment: `Return requested for ${item.name}. Reason: ${reason}`,
    date: new Date()
  });

  return await order.save();
};


export const getOrderDetails = async (orderId) => {
  const Order = getModel('Order');
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
};

export const getAllOrdersService = async (page, limit, status, search) => {
  const query = {};
  const Order = getModel('Order')

  if (status && status !== 'All') {
    if (status === 'Return Requested') {

      query['items.itemStatus'] = 'Return Requested';
    } else {
      query.status = status;
    }
  }

  if (search) {
    query.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { "items.name": { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('user', 'firstName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  console.log("Final Database Query:", JSON.stringify(query));
  const totalDocs = await Order.countDocuments(query);

  return {
    orders,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit),
    currentPage: parseInt(page)
  };
};

export const getOrderStatsService = async () => {
  const Order = getModel('Order')
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalOrders = stats.reduce((acc, curr) => acc + curr.count, 0);
  const delivered = stats.find(s => s._id === 'Delivered')?.count || 0;
  const cancelled = stats.find(s => s._id === 'Cancelled')?.count || 0;
  const pending = stats.find(s => s._id === 'Pending')?.count || 0;

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const newOrders = await Order.countDocuments({ createdAt: { $gte: last7Days } });

  return {
    totalOrders,
    newOrders,
    delivered,
    cancelled,
    pending
  };
};


export const getOrderDetailsAdmin = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('user', 'firstName email phone')
    .populate({
      path: 'items.productId',
      select: 'name image price '
    })
  console.log(order)
  if (!order) throw new AppError('Order is not found ', 404, 'ORDER_IS_NOT_FOUND')
  return order
}

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: status },
    { new: true }
  );
  if (!order) throw new AppError('Order is not found', 404, 'ORDER_IS_NOT_FOUND')
  return order
}

export const updateOrderItemStatus = async (orderId, itemId, status) => {
  const Order = getModel('Order');
  const order = await Order.findById(orderId);

  if (!order) throw new AppError('Order is not found', 404, 'ORDER_IS_NOT_FOUND');

  const item = order.items.id(itemId);
  if (!item) throw new AppError('Ordered item is not found', 404, 'ORDERED_ITEM_IS_NOT_FOUND');

  const oldStatus = item.itemStatus;


  item.itemStatus = status;


  order.timeline.push({
    status: status,
    comment: `Item (${item.name}) status updated from ${oldStatus} to ${status} by Admin`,
    date: new Date()
  });


  const allCompleted = order.items.every(i =>
    ['Returned', 'Cancelled'].includes(i.itemStatus)
  );

  if (allCompleted) {
    order.status = 'Returned';
  }

  await order.save();
  return order;
};