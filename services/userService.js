
const Users = require('../models/users')

const getUserService = async (data) => {
  try {
    const {
      page = Number(data.page) || 1,
      limit = Number(data.limit) || 5,
      sort,
      active,
      search
    } = data

    const skip = (page - 1) * limit

    let = filter = { role: 'user' }
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ]
    if (active === 'active') filter.isBlocked = false
    if (active === 'inactive') filter.isBlocked = true

    let sortQuery = { createdAt: -1 }
    if (sort === 'oldest') sortQuery = { createdAt: 1 }
    if (sort === 'newest') sortQuery = { createdAt: -1 }
    if (sort === 'a-z') sortQuery = { firstName: 1 }
    if (sort === 'z-a') sortQuery = { firstName: -1 }

    const users = await Users.find(filter).sort(sortQuery).skip(skip).limit(limit)

    const totalUsers = await Users.countDocuments(filter)
    if (users) {
      return {
        success: true,
        message: 'data fetched succesfully',
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page
      }
    } else {
      return { success: false, message: ' cant to fetch data ' }
    }

  } catch (error) {
    console.log(error)
    return { success: false, message: ' something went wrong ' }
  }
}

const blockUserService = async (userId) => {
  try {
    const user = await Users.findOne({ _id: userId })
    if (!user) return { success: false, message: ' user is not found' }
    user.isBlocked = !user.isBlocked
    await user.save()
    return { success: true, message: 'updated succesfully' }
  } catch (error) {
    return { success: false, message: ' something went wrong' }
  }
}

const analyticsService = async () => {
  try {
    const sevenDaysAgo = new Date()
    console.log(sevenDaysAgo)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1)
    const totalCustomers = await Users.countDocuments({ role: 'user' })
    const newCustomers = await Users.countDocuments({ role: 'user', createdAt: { $gte: sevenDaysAgo } })
    const blockedCustomers = await Users.countDocuments({ isBlocked: true })
    const chartDataRaw = await Users.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: sevenDaysAgo }
        }
      }, {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
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
    }
  } catch (error) {
    return { success: false, message: 'something went wrong' }
  }
}
module.exports = { getUserService, blockUserService, analyticsService }