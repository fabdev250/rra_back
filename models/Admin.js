const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'rra_admin', 'local_admin', 'agent'),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    // Remove self-referential foreign key for now
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
  tableName: 'admins',
  timestamps: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password_hash) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password_hash')) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
      }
    }
  }
});

// Instance method for password validation
Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = Admin;