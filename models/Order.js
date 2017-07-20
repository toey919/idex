"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'order',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tokenBuy: Sequelize.TEXT,
    amountBuy: Sequelize.TEXT,
    tokenSell: Sequelize.TEXT,
    amountSell: Sequelize.TEXT,
    expires: Sequelize.INTEGER,
    nonce: Sequelize.INTEGER,
    hash: Sequelize.TEXT,
    user: Sequelize.TEXT,
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT,
    filled: Sequelize.TEXT,
    complete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    cancelled: Sequelize.DATE
  }, 
  options: {
    tableName: 'orders'
  }
};
