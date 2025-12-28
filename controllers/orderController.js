
import * as orderService from '../services/orderServices.js';

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Address and Payment Method are required" });
    }

    const order = await orderService.placeOrder(userId, addressId, paymentMethod);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order
    });
  } catch (error) {
    next(error);
  }
};
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await orderService.getUserOrders(userId);

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// --- 2. Cancel Order ---
export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;
    const { reason ,  itemId} = req.body; 

    const order = await orderService.cancelOrder(userId, orderId, reason , itemId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};