import * as orderService from '../services/orderServices.js';

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod , trasancationId , paymentStatus } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Address and Payment Method are required" });
    }

    const order = await orderService.placeOrder(userId, addressId, paymentMethod ,trasancationId, paymentStatus );

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

export const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;
    const { reason, itemId } = req.body;

    const order = await orderService.cancelOrder(userId, orderId, reason, itemId);

    res.status(200).json({
      success: true,
      message: itemId ? 'Item cancelled successfully' : 'Entire order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const order = await orderService.getOrderDetails(orderId)
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error)
  }
}


export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const result = await orderService.getAllOrdersService(page, limit, status, search);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const stats = await orderService.getOrderStatsService();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};


export const orderDetailsAdmin = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const order = await orderService.getOrderDetailsAdmin(orderId)
    return res.json({
      success: true,
      order
    })
  } catch (error) {
    next(error)
  }
}


export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const order = await orderService.updateOrderStatus(orderId, status)
    return res.json({ success: true, message: 'Status updated succesfully', order })
  } catch (error) {
    next(error)
  }
}


export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { itemId, status } = req.body
    const order = await orderService.updateOrderItemStatus(orderId, itemId, status)
    return res.json({ success: true, message: 'Item status updated succesfully', order })
  } catch (error) {
    next(error)
  }
}


export const returnOrderItem = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const updatedOrder = await orderService.returnOrder(userId, orderId, itemId, reason);

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};