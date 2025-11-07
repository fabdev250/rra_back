const express = require('express');
const jwt = require('jsonwebtoken');
const { Trader } = require('../models');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smarttax_secret', {
    expiresIn: '30d',
  });
};

// Trader Login
router.post('/trader/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ message: 'Phone and PIN are required' });
    }

    const trader = await Trader.findOne({ where: { phone } });
    
    if (trader && await trader.validatePin(pin)) {
      res.json({
        id: trader.id,
        full_name: trader.full_name,
        phone: trader.phone,
        category: trader.category,
        token: generateToken(trader.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone or PIN' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Trader Registration
router.post('/trader/register', async (req, res) => {
  try {
    const { full_name, phone, momo_number, category, pin, district, sector } = req.body;

    // Validate required fields
    if (!full_name || !phone || !momo_number || !category || !pin) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const traderExists = await Trader.findOne({ where: { phone } });
    if (traderExists) {
      return res.status(400).json({ message: 'Trader already exists with this phone' });
    }

    const trader = await Trader.create({
      full_name,
      phone,
      momo_number,
      category,
      pin_hash: pin,
      district,
      sector
    });

    if (trader) {
      res.status(201).json({
        id: trader.id,
        full_name: trader.full_name,
        phone: trader.phone,
        category: trader.category,
        token: generateToken(trader.id)
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Invalid trader data: ' + error.message });
  }
});

module.exports = router;