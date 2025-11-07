const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  local_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    // Remove foreign key constraint for now
  }
}, {
  tableName: 'districts',
  timestamps: true
});

module.exports = District;