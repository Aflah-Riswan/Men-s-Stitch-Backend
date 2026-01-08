import Order from "../models/order.js";



const getDateRange = (period, from, to) => {
  const today = new Date();
  let startDate, endDate;

  if (period === 'daily') {
    startDate = new Date(today.setHours(0, 0, 0, 0));
    endDate = new Date(today.setHours(23, 59, 59, 999));
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


export const generateSalesReport = async (query) => {
  const { from, to, period } = query;
  
  const { startDate, endDate } = getDateRange(period, from, to);

  const salesData = await Order.aggregate([
    {
      $match: {
        status: 'Delivered', 
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$totalAmount" },
        totalDiscount: { $sum: "$discount" } 
      }
    }
  ]);

  const orders = await Order.find({
    status: 'Delivered',
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .populate('user', 'firstName email')
  .sort({ createdAt: -1 });

  return {
    summary: salesData[0] || { totalOrders: 0, totalSales: 0, totalDiscount: 0 },
    orders: orders,
    dateRange: { startDate, endDate }
  };
};

