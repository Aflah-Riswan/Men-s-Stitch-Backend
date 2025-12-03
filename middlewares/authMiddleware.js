
const jwt = require('jsonwebtoken')
const User = require('../models/users')

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    try {
      token = req.headers.authorization.split(' ')[1]
      console.log(token)
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      console.log("error in authMiddleware", error)
    }
  }
}

const admin = async (req, res, next) => {
  try {
    const user = req.user
    if (user && user.role === 'admin') {
      next()
    }
    else {
      return res.json({ error :'no authorization'})
    }
  } catch (error) {
    console.log("error in admin checking function ",error)
  }
}
module.exports ={protect,admin}