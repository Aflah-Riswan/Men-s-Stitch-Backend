import Order from "../models/order.js";

// Helper to determine date range
const getDateRange = (period, from, to) => {
  const today = new Date();
  let startDate, endDate;

  if (period === 'daily') {
    startDate = new Date(today.setHours(0, 0, 0, 0));
    endDate = new Date(new Date().setHours(23, 59, 59, 999));
  } else if (period === 'weekly') {
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    startDate = new Date(lastWeek.setHours(0, 0, 0, 0));
    endDate = new Date(new Date().setHours(23, 59, 59, 999));
  } else if (period === 'monthly') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = new Date(firstDay.setHours(0, 0, 0, 0));
    endDate = new Date(new Date().setHours(23, 59, 59, 999));
  } else if (period === 'yearly') {
    const firstDay = new Date(today.getFullYear(), 0, 1);
    startDate = new Date(firstDay.setHours(0, 0, 0, 0));
    endDate = new Date(new Date().setHours(23, 59, 59, 999));
  } else if (from && to) {
    startDate = new Date(new Date(from).setHours(0, 0, 0, 0));
    endDate = new Date(new Date(to).setHours(23, 59, 59, 999));
  } else {
    startDate = new Date(0);
    endDate = new Date();
  }

  return { startDate, endDate };
};

// --- MAIN FUNCTION (Renamed back to generateSalesReport) ---
export const generateSalesReport = async (query) => {
  const { from, to, period } = query;
  const { startDate, endDate } = getDateRange(period, from, to);

  // 1. Aggregation for Summary Cards
  const salesData = await Order.aggregate([
    {
      $match: {
        status: { 
          $in: [
            'Delivered', 'Shipped', 'Processing', 'Ordered', 
            'Cancelled', 'Returned', 'Return Approved'
          ] 
        },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 }, 

        cancelledOrders: { 
          $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } 
        },
        returnedOrders: { 
          $sum: { $cond: [{ $in: ["$status", ["Returned", "Return Approved"]] }, 1, 0] } 
        },
        grossSales: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Delivered", "Shipped", "Processing", "Ordered"]] },
              "$totalAmount",
              0
            ]
          }
        },
        totalRefunds: {
          $sum: {
            $cond: [
              { $eq: ["$payment.status", "refunded"] },
              "$totalAmount",
              0
            ]
          }
        },
        totalDiscount: { $sum: "$discount" }
      }
    },
    {
      $addFields: {
        netSales: "$grossSales" 
      }
    },
  ]);

  // 2. Fetch Detailed Orders for Table/Download
  const orders = await Order.find({
    status: { 
      $in: [
        'Delivered', 'Shipped', 'Processing', 'Ordered', 
        'Cancelled', 'Returned', 'Return Approved'
      ] 
    },
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .populate('user', 'firstName email')
    .sort({ createdAt: -1 });

  // 3. Handle Empty Data Case
  const stats = salesData[0] || {
    totalOrders: 0,
    grossSales: 0,
    netSales: 0,
    totalRefunds: 0,
    totalDiscount: 0,
    cancelledOrders: 0,
    returnedOrders: 0
  };

  return {
    summary: stats,
    orders: orders,
    dateRange: { startDate, endDate }
  };
};