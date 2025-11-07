const sequelize = require('../config/database');

// Import models
const Trader = require('./Trader');
const Transaction = require('./Transaction');
const Admin = require('./Admin');
const District = require('./District');
const Sector = require('./Sector');

// Define only basic associations
const defineAssociations = () => {
  try {
    // Only define essential associations for now
    Trader.hasMany(Transaction, { 
      foreignKey: 'trader_id',
      onDelete: 'CASCADE'
    });
    Transaction.belongsTo(Trader, { 
      foreignKey: 'trader_id'
    });

    console.log('✅ Basic associations defined successfully');
  } catch (error) {
    console.error('❌ Error defining associations:', error);
  }
};

// Sync function with proper table creation order
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Create tables in correct order (without foreign keys first)
    await Admin.sync({ force: false });
    console.log('✅ Admins table synced');
    
    await Trader.sync({ force: false });
    console.log('✅ Traders table synced');
    
    await Transaction.sync({ force: false });
    console.log('✅ Transactions table synced');
    
    await District.sync({ force: false });
    console.log('✅ Districts table synced');
    
    await Sector.sync({ force: false });
    console.log('✅ Sectors table synced');
    
    // Now define associations
    defineAssociations();
    
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Trader,
  Transaction,
  Admin,
  District,
  Sector,
  syncDatabase
};