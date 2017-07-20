'use strict';

const Sequelize = require('sequelize');

module.exports = {
  name: 'transaction',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    transactionHash: Sequelize.TEXT
  } 
};
