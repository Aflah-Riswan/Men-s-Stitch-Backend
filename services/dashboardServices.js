import Order from "../models/order.js";
import Product from "../models/products.js";
import User from "../models/users.js";

export const getDashboardStatsService = async (filter = 'monthly') => {
  const today = new Date();
  let startDate;
  let groupingFormat;

  // 1. Dynamic Filter Logic
  switch (filter) {
    case 'weekly':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      groupingFormat = "%Y-%m-%d";
      break;
    case 'yearly':
      startDate = new Date(today.getFullYear(), 0, 1);
      groupingFormat = "%Y-%m";
      break;
    case 'monthly':
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      groupingFormat = "%Y-%m-%d";
      break;
  }


  // Sales Chart
  const salesChartPromise = Order.aggregate([
    { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startDate } } },
    { $group: {
        _id: { $dateToString: { format: groupingFormat, date: "$createdAt" } },
        sales: { $sum: "$totalAmount" }
    }},
    { $sort: { _id: 1 } }
  ]);

  // Dynamic Top Categories (Filtered by startDate)
  const topCategoriesPromise = Order.aggregate([
    { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startDate } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "productDetails" } },
    { $unwind: "$productDetails" },
    { $lookup: { from: "categories", localField: "productDetails.mainCategory", foreignField: "_id", as: "categoryDetails" } },
    { $unwind: "$categoryDetails" },
    { $group: { _id: "$categoryDetails.categoryName", count: { $sum: "$items.quantity" } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Dynamic Top Selling Products (Filtered by startDate)
  const topProductsPromise = Order.aggregate([
    { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startDate } } },
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

  // Live Activity (Always shows the 5 most recent overall)
  const recentOrdersPromise = Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName')
    .select('orderId totalAmount status createdAt user');

  // --- 3. EXECUTE PARALLEL QUERIES ---
  const [
    salesDataRaw,
    topProducts,
    topCategories,
    totalOrd,
    totalProd,
    totalUsr,
    recentOrders
  ] = await Promise.all([
    salesChartPromise,
    topProductsPromise,
    topCategoriesPromise,
    Order.countDocuments({}),
    Product.countDocuments({ isDeleted: false }),
    User.countDocuments({ isBlocked: false }),
    recentOrdersPromise
  ]);

  return {
    stats: [
        { title: 'Total Revenue', value: salesDataRaw.reduce((acc, curr) => acc + curr.sales, 0) },
        { title: 'Orders in Period', value: totalOrd },
        { title: 'Total Users', value: totalUsr }
    ],
    salesData: salesDataRaw,
    topProducts,
    topCategories,
    recentOrders
  };
};