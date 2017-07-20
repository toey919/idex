"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'trade',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    hash: Sequelize.TEXT,
    tokenBuy: Sequelize.TEXT,
    tokenSell: Sequelize.TEXT,
    buy: Sequelize.TEXT,
    sell: Sequelize.TEXT,
    amount: Sequelize.TEXT,
    nonce: Sequelize.TEXT,
    user: Sequelize.TEXT,
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT,
    feeMake: Sequelize.TEXT,
    feeTake: Sequelize.TEXT,
  }, 
  options: {
    tableName: 'trades'
  }
};
