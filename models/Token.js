"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'token',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: 'token_id',
      autoIncrement: true,
      allowNull: false
    },
    address: Sequelize.TEXT,
    name: Sequelize.TEXT,
    removed: Sequelize.BOOLEAN,
    decimals: Sequelize.INTEGER,
    symbol: Sequelize.TEXT
  }, 
  options: {
    tableName: 'tokens'
  }
};
