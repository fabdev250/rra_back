const express = require('express');
const { Trader, Transaction, Admin } = require('../models');
const router = express.Router();

// Simple test route to check if models work
router.get('/setup', async (req, res) => {
  try {
    // Create a test trader
    const testTrader = await Trader.create({
      full_name: 'Test Trader',
      phone: '250788123456',
      momo_number: '250788123456',
      category: 'vendor',
      pin_hash: '1234'
    });

    // Create a test transaction
    const testTransaction = await Transaction.create({
      trader_id: testTrader.id,
      product_name: 'Test Product',
      product_price: 1000,
      total_amount: 1000,
      tax_amount: 20,
      trader_amount: 980,
      payment_status: 'paid'
    });

    // Check if super admin exists, if not create one
    let superAdmin = await Admin.findOne({ where: { role: 'super_admin' } });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        name: 'Super Admin',
        email: 'superadmin@smarttax.gov.rw',
        password_hash: 'admin123',
        role: 'super_admin'
      });
    }

    res.json({
      message: 'Test data created successfully',
      trader: {
        id: testTrader.id,
        name: testTrader.full_name,
        phone: testTrader.phone
      },
      transaction: {
        id: testTransaction.id,
        product: testTransaction.product_name,
        amount: testTransaction.total_amount
      },
      admin: {
        id: superAdmin.id,
        name: superAdmin.name,
        role: superAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating test data', 
      error: error.message 
    });
  }
});

module.exports = router;