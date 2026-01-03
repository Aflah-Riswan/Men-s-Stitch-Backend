import User from '../models/users.js';
import Users from '../models/users.js';
import AppError from '../utils/appError.js';
import bcrypt from 'bcrypt';
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
export const getUserInfo = async (userId) => {
  console.log("id : ", userId)
  const user = await User.findById(userId)
  if (!user) throw new AppError("User is not found ", 404, "USER_IS_NOT_FOUND")
  console.log("user : ", user)
  return user
}
export const updateUserDetails = async (userId, data) => {
  console.log(data)
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true })
  if (!user) throw new AppError("User is not found ", 404, "USER_IS_NOT_FOUND")
  return user
}
export const changePasswordService = async (userId, currentPassword, newPassword) => {

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect current password", 400, "INVALID_PASSWORD");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  return user;
};

export const updatePhoneNumber = async (userId, phone) => {
  const user = await User.findById(userId )
  if (!user) throw new AppError('User is not found', 404, 'USER_IS_NOT_FOUND')
  user.phone = phone
  user.isPhoneVerified = true
  await user.save()
  return { success: true , message :' updated phone number', phone:user.phone , isPhoneVerified : user.isPhoneVerified }
}