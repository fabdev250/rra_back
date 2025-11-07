const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smarttax_secret');
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || !admin.is_active) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { adminAuth, requireRole };