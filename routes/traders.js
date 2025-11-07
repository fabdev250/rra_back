const express = require('express');
const { Trader } = require('../models');

const router = express.Router();

// Simple auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'smarttax_secret');
    const trader = await Trader.findByPk(decoded.id);
    
    if (!trader) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.trader = trader;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get trader profile
router.get('/profile', auth, async (req, res) => {
  try {
    const trader = await Trader.findByPk(req.trader.id, {
      attributes: { exclude: ['pin_hash'] }
    });
    
    if (!trader) {
      return res.status(404).json({ message: 'Trader not found' });
    }
    
    res.json(trader);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get all traders (simple version)
router.get('/', auth, async (req, res) => {
  try {
    const traders = await Trader.findAll({
      attributes: { exclude: ['pin_hash'] },
      limit: 50,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      traders: traders,
      totalTraders: traders.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;