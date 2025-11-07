const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // Remove foreign key constraint for now
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    // Remove foreign key constraint for now
  }
}, {
  tableName: 'sectors',
  timestamps: true
});

module.exports = Sector;