
const jwt = require('jsonwebtoken')
const User = require('../models/users')

const protect = async (req, res, next) => {
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    try {
      token = req.headers.authorization.split(' ')[1]
      console.log("token is : ",token)
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)
      req.user = await User.findById(decoded.id).select('-password')
      
      next()
    } catch (error) {
     console.error("Auth Error:", error.name);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    
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
   console.error("Auth Error:", error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
  }
  
}
module.exports ={protect,admin}