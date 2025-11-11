const express = require('express');
const { processUSSD, ussdSession } = require('../controllers/ussdController');

const router = express.Router();

// USSD endpoint with session middleware
router.post('/ussd', ussdSession, processUSSD);

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const { Trader, Transaction } = require('../models');
    
    const totalTraders = await Trader.count();
    const totalTransactions = await Transaction.count();
    
    res.json({
      status: 'OK',
      message: 'SmartTax USSD Backend is running',
      database: {
        traders: totalTraders,
        transactions: totalTransactions
      },
      sessions: global.ussdSessions ? global.ussdSessions.size : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

module.exports = router;