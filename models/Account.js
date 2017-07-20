"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'account',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    address: Sequelize.TEXT,
    nonce: Sequelize.TEXT
  }, 
  options: {
    tableName: 'accounts'
  }
};
