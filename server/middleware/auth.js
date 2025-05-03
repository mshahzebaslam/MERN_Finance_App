import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
      const authHeader = req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Please authenticate' });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findOne({
          _id: decoded.id,
          'tokens.token': token // Check if token exists in user's tokens
      });

      if (!user) {
          return res.status(401).json({ error: 'Please authenticate' });
      }

      req.token = token;
      req.user = user;
      next();
  } catch (error) {
      console.error('Authentication error:', error);
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
      }
      res.status(401).json({ error: 'Please authenticate' });
  }
};
export const authorize = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findOne({
        _id: req.params[paramName],
        userId: req.user._id
      });

      if (!resource) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};