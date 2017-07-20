"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'balance',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    address: Sequelize.TEXT,
    token: Sequelize.TEXT,
    balance: Sequelize.TEXT
  }
};
