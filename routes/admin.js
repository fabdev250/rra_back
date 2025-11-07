const express = require('express');
const jwt = require('jsonwebtoken');
const { Trader, Transaction, Admin } = require('../models');

const router = express.Router();

// Admin auth middleware
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

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ where: { email, is_active: true } });
    if (admin && await admin.validatePassword(password)) {
      const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET || 'smarttax_secret',
        { expiresIn: '24h' }
      );

      res.json({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const totalTraders = await Trader.count();
    const totalTransactions = await Transaction.count();
    const totalRevenue = await Transaction.sum('total_amount') || 0;
    const totalTax = await Transaction.sum('tax_amount') || 0;

    res.json({
      totalTraders,
      totalTransactions,
      totalRevenue,
      totalTax
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get all traders
router.get('/traders', adminAuth, async (req, res) => {
  try {
    const traders = await Trader.findAll({
      attributes: { exclude: ['pin_hash'] },
      limit: 100,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      traders: traders,
      totalTraders: traders.length
    });
  } catch (error) {
    console.error('Get traders error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get all transactions
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{
        model: Trader,
        attributes: ['full_name', 'phone', 'category']
      }],
      limit: 100,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      transactions: transactions,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;