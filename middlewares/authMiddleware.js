import jwt from 'jsonwebtoken';
import User from '../models/users.js';

export const protect = async (req, res, next) => {
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      if(req.user.isBlocked && req.user.role === 'user'){
         return res.status(403).json({ message: 'Not authorized, You are Blocked' });
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.name);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } 
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role === 'admin') {
      next();
    } else {
      console.log(" error found ")
      return res.status(403).json({ error: 'Not authorized as admin' });
    }
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};