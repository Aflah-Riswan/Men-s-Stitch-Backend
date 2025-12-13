
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
    return { success : true , message : 'updated succesfully'}
  } catch (error) {
     return { success: false ,message : ' something went wrong'} 
  }


}
module.exports = { getUserService , blockUserService }