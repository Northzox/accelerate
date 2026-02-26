const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user from JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user has specific role or higher
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const roleHierarchy = {
      'User': 0,
      'Official Member': 1,
      'Co-Leader': 2,
      'Leader': 3,
      'Admin': 4
    };

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredRoleLevel = Math.max(...roles.map(role => roleHierarchy[role] || 0));

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole(['Admin']);

// Check if user is leader or higher
const requireLeader = requireRole(['Leader', 'Admin']);

// Check if user is co-leader or higher
const requireCoLeader = requireRole(['Co-Leader', 'Leader', 'Admin']);

// Check if user is official member or higher
const requireOfficialMember = requireRole(['Official Member', 'Co-Leader', 'Leader', 'Admin']);

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireLeader,
  requireCoLeader,
  requireOfficialMember,
  optionalAuth
};
