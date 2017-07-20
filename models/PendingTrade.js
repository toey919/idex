"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'pendingTrade',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tokenGet: Sequelize.TEXT,
    amountGet: Sequelize.TEXT,
    tokenGive: Sequelize.TEXT,
    amountGive: Sequelize.TEXT,
    expires: Sequelize.TEXT,
    nonce: Sequelize.TEXT,
    user: Sequelize.TEXT,
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT,
    amount: Sequelize.TEXT,
    from: Sequelize.TEXT,
    hash: Sequelize.TEXT,
    transactionHash: Sequelize.TEXT,
    amountGiveAdjusted: Sequelize.TEXT
  }
};
