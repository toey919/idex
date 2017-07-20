'use strict';

const Sequelize = require('sequelize');

module.exports = {
  name: 'node',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    targetId: Sequelize.INTEGER,
    type: Sequelize.TEXT,
    complete: Sequelize.DATE,
    cancelled: Sequelize.DATE,
    dispatched: Sequelize.DATE,
    sender: Sequelize.TEXT,
    transactionHash: Sequelize.TEXT
  } 
};
