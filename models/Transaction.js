const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trader_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  product_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 2.0
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  trader_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  momo_transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;