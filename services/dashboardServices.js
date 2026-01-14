
import Order from "../models/order.js";
import Product from "../models/products.js";
import User from "../models/users.js";

export const getDashboardStatsService = async () => {
  // 1. Date Calculations
  const today = new Date();
  const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  
  // Set to 7 days ago (reset time to 00:00:00 for accurate chart)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // --- 2. DEFINE QUERIES ---

  // A. Total Revenue (Lifetime)
  const totalRevenuePromise = Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  // B. Counts (Lifetime)
  const totalOrdersPromise = Order.countDocuments({});
  const totalProductsPromise = Product.countDocuments({ isDeleted: false });
  const totalUsersPromise = User.countDocuments({ isBlocked: false });

  // C. Monthly Stats (For Growth %)
  const currentMonthRevenuePromise = Order.aggregate([
    { $match: { 
        status: { $ne: "Cancelled" },
        createdAt: { $gte: firstDayCurrentMonth } 
    }},
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  const lastMonthRevenuePromise = Order.aggregate([
    { $match: { 
        status: { $ne: "Cancelled" },
        createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } 
    }},
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  // D. Sales Chart Data (Last 7 Days)
  const salesChartPromise = Order.aggregate([
    { $match: { 
        status: { $ne: "Cancelled" },
        createdAt: { $gte: sevenDaysAgo } 
    }},
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$totalAmount" }
    }},
    { $sort: { _id: 1 } }
  ]);

  // E. Top Selling Products
  const topProductsPromise = Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    { $unwind: "$items" },
    { $group: {
        _id: "$items.productId", 
        name: { $first: "$items.name" }, 
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  // F. Recent Orders
  const recentOrdersPromise = Order.find()
    .select('orderId totalAmount status createdAt user')
    .populate('user', 'firstName email')
    .sort({ createdAt: -1 })
    .limit(5);


  // --- 3. EXECUTE PARALLEL QUERIES ---
  const [
    totalRevData, 
    totalOrd, 
    totalProd, 
    totalUsr,
    currMonthRevData,
    lastMonthRevData,
    salesDataRaw,
    topProducts,
    recentOrders
  ] = await Promise.all([
    totalRevenuePromise,
    totalOrdersPromise,
    totalProductsPromise,
    totalUsersPromise,
    currentMonthRevenuePromise,
    lastMonthRevenuePromise,
    salesChartPromise,
    topProductsPromise,
    recentOrdersPromise
  ]);

  // --- 4. DATA PROCESSING & FORMATTING ---

  // Calculate Revenue Growth
  const currentRev = currMonthRevData[0]?.total || 0;
  const lastRev = lastMonthRevData[0]?.total || 0;
  
  let growthPercent = 0;
  if (lastRev > 0) {
    growthPercent = ((currentRev - lastRev) / lastRev) * 100;
  } else if (currentRev > 0) {
    growthPercent = 100;
  }

  // Format Chart Data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const salesData = salesDataRaw.map(item => {
    const d = new Date(item._id);
    return {
      name: days[d.getDay()], // "Mon"
      date: item._id,         // "2023-10-01"
      sales: item.sales
    };
  });

  // Construct Stats Array
  const stats = [
    {
      title: 'Total Revenue',
      value: totalRevData[0]?.total || 0,
      change: growthPercent.toFixed(1) + '%',
      isPositive: growthPercent >= 0,
    },
    {
      title: 'Total Orders',
      value: totalOrd,
      change: '+0%', // Placeholder logic
      isPositive: true,
    },
    {
      title: 'Total Products',
      value: totalProd,
      change: '0%',
      isPositive: true,
    },
    {
      title: 'Total Users',
      value: totalUsr,
      change: '+5%',
      isPositive: true,
    }
  ];

  return {
    stats,
    salesData,
    topProducts,
    recentOrders
  };
};