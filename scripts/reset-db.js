const { sequelize } = require('../models');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    // Drop all tables
    await sequelize.drop();
    console.log('✅ All tables dropped');
    
    // Sync fresh tables
    await sequelize.sync({ force: false });
    console.log('✅ Fresh tables created');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();