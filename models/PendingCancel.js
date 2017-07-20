"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'pendingCancel',
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
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT,
    from: Sequelize.TEXT,
    transactionHash: Sequelize.TEXT,
    hash: Sequelize.TEXT
  }
};
