'use strict';

const Sequelize = require('sequelize');

module.exports = {
  name: 'withdrawal',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    token: Sequelize.TEXT,
    amount: Sequelize.TEXT,
    nonce: Sequelize.INTEGER,
    hash: Sequelize.TEXT,
    user: Sequelize.TEXT,
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT
  },
};
