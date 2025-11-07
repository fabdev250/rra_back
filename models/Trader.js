const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Trader = sequelize.define('Trader', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  momo_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('vendor', 'boutique', 'depot', 'restaurant', 'service'),
    allowNull: false
  },
  pin_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sector_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'traders',
  timestamps: true,
  hooks: {
    beforeCreate: async (trader) => {
      if (trader.pin_hash) {
        trader.pin_hash = await bcrypt.hash(trader.pin_hash, 10);
      }
    },
    beforeUpdate: async (trader) => {
      if (trader.changed('pin_hash')) {
        trader.pin_hash = await bcrypt.hash(trader.pin_hash, 10);
      }
    }
  }
});

// Instance method for PIN validation
Trader.prototype.validatePin = async function(pin) {
  return await bcrypt.compare(pin, this.pin_hash);
};

module.exports = Trader;