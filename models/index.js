const sequelize = require('../config/database');

// Import models
const Trader = require('./Trader');
const Transaction = require('./Transaction');
const Admin = require('./Admin');
const District = require('./District');
const Sector = require('./Sector');

// Define all associations
const defineAssociations = () => {
  try {
    // Trader - Transaction associations
    Trader.hasMany(Transaction, { 
      foreignKey: 'trader_id',
      onDelete: 'CASCADE'
    });
    Transaction.belongsTo(Trader, { 
      foreignKey: 'trader_id'
    });

    // District - Trader associations
    District.hasMany(Trader, { 
      foreignKey: 'district_id',
      onDelete: 'SET NULL'
    });
    Trader.belongsTo(District, { 
      foreignKey: 'district_id'
    });

    // Sector - Trader associations
    Sector.hasMany(Trader, { 
      foreignKey: 'sector_id',
      onDelete: 'SET NULL'
    });
    Trader.belongsTo(Sector, { 
      foreignKey: 'sector_id'
    });

    // District - Sector associations (if sectors belong to districts)
    District.hasMany(Sector, { 
      foreignKey: 'district_id',
      onDelete: 'CASCADE'
    });
    Sector.belongsTo(District, { 
      foreignKey: 'district_id'
    });

    console.log('✅ All associations defined successfully');
  } catch (error) {
    console.error('❌ Error defining associations:', error);
  }
};

// Sync function with proper table creation order
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Create tables in correct order (parents first, then children)
    await District.sync({ force: false });
    console.log('✅ Districts table synced');
    
    await Sector.sync({ force: false });
    console.log('✅ Sectors table synced');
    
    await Admin.sync({ force: false });
    console.log('✅ Admins table synced');
    
    await Trader.sync({ force: false });
    console.log('✅ Traders table synced');
    
    await Transaction.sync({ force: false });
    console.log('✅ Transactions table synced');
    
    // Now define associations after all tables are created
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