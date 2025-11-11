// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database'); // or your database config

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Tax = require('./Tax')(sequelize, Sequelize);

// Define associations if any
db.User.hasMany(db.Tax);
db.Tax.belongsTo(db.User);

module.exports = db;