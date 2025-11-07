const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { syncDatabase } = require('./models');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const tradersRoutes = require('./routes/traders');
const transactionsRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/traders', tradersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', require('./routes/ussd'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartTax Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { Trader, Admin, Transaction } = require('./models');
    
    const tradersCount = await Trader.count();
    const adminsCount = await Admin.count();
    const transactionsCount = await Transaction.count();
    
    res.json({
      database: 'Connected',
      traders: tradersCount,
      admins: adminsCount,
      transactions: transactionsCount,
      status: 'All systems operational'
    });
  } catch (error) {
    res.status(500).json({
      database: 'Error',
      error: error.message
    });
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Starting database synchronization...');
    await syncDatabase();
    console.log('✅ Database synchronized successfully');
    
    // Create default super admin if not exists
    const { Admin } = require('./models');
    const superAdminExists = await Admin.findOne({ where: { role: 'super_admin' } });
    if (!superAdminExists) {
      await Admin.create({
        name: 'Super Admin',
        email: 'superadmin@smarttax.gov.rw',
        password_hash: 'admin123',
        role: 'super_admin'
      });
      console.log('✅ Default super admin created');
    }
    
    // Create sample data for testing
    const { Trader, Transaction } = require('./models');
    const sampleTraderExists = await Trader.findOne({ where: { phone: '250788123456' } });
    if (!sampleTraderExists) {
      const sampleTrader = await Trader.create({
        full_name: 'Sample Trader',
        phone: '250788123456',
        momo_number: '250788123456',
        category: 'vendor',
        pin_hash: '1234'
      });
      
      await Transaction.create({
        trader_id: sampleTrader.id,
        product_name: 'Test Product',
        product_price: 1000,
        total_amount: 1000,
        tax_amount: 20,
        trader_amount: 980,
        payment_status: 'paid'
      });
      
      console.log('✅ Sample data created');
    }

    app.listen(PORT, () => {
      console.log(`🚀 SmartTax Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Test DB: http://localhost:${PORT}/api/test-db`);
      console.log(`👤 Default Admin: superadmin@smarttax.gov.rw / admin123`);
      console.log(`📱 Sample Trader: 250788123456 / 1234`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();