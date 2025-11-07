const express = require('express');
const { Transaction, Trader } = require('../models');
const mobileMoneyService = require('../services/mobileMoneyService');

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

// Create new sale transaction
router.post('/create', auth, async (req, res) => {
  try {
    const { product_name, product_price, customer_phone } = req.body;
    const trader_id = req.trader.id;

    // Validate input
    if (!product_name || !product_price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    // Split payment
    const { taxAmount, traderAmount, taxRate } = mobileMoneyService.splitPayment(parseFloat(product_price));

    // Create transaction record
    const transaction = await Transaction.create({
      trader_id,
      product_name,
      product_price: parseFloat(product_price),
      total_amount: parseFloat(product_price),
      tax_rate: taxRate,
      tax_amount: taxAmount,
      trader_amount: traderAmount,
      customer_phone,
      payment_status: 'paid' // For demo, mark as paid immediately
    });

    res.json({
      success: true,
      transaction,
      message: 'Sale recorded successfully'
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Error creating transaction: ' + error.message });
  }
});

// Get trader's transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { trader_id: req.trader.id },
      limit: 50,
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