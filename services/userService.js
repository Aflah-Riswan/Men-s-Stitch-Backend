import Users from '../models/users.js';
import AppError from '../utils/appError.js';

export const getUserService = async (data) => {
  const {
    page = Number(data.page) || 1,
    limit = Number(data.limit) || 5,
    sort,
    active,
    search = ''
  } = data;

  const skip = (page - 1) * limit;
  let filter = { role: 'user' };
  if (search.trim()) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (active === 'active') filter.isBlocked = false;
  if (active === 'inactive') filter.isBlocked = true;

  let sortQuery = { createdAt: -1 };
  if (sort === 'oldest') sortQuery = { createdAt: 1 };
  if (sort === 'newest') sortQuery = { createdAt: -1 };
  if (sort === 'a-z') sortQuery = { firstName: 1 };
  if (sort === 'z-a') sortQuery = { firstName: -1 };

  const users = await Users.find(filter).sort(sortQuery).skip(skip).limit(limit);
  const totalUsers = await Users.countDocuments(filter);
  return {
    success: true,
    message: 'Data fetched successfully',
    users,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page
  };
};

export const blockUserService = async (userId) => {
  const user = await Users.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return { 
    success: true, 
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    isBlocked: user.isBlocked 
  };
};

export const analyticsService = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const totalCustomers = await Users.countDocuments({ role: 'user' });
  const newCustomers = await Users.countDocuments({ role: 'user', createdAt: { $gte: sevenDaysAgo } });
  const blockedCustomers = await Users.countDocuments({ isBlocked: true });
  
  const chartDataRaw = await Users.aggregate([
    {
      $match: {
        role: 'user',
        createdAt: { $gte: sevenDaysAgo }
      }
    }, 
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    const found = chartDataRaw.find(item => item._id === dateString);

    chartData.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value: found ? found.count : 0,
      fullDate: dateString
    });
  }
  
  return {
    success: true,
    stats: {
      total: totalCustomers,
      new: newCustomers,
      blocked: blockedCustomers,
    },
    chart: chartData
  };
};