"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'state',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    key: Sequelize.TEXT,
    value: Sequelize.TEXT
  }, 
  options: {
    tableName: 'state'
  }
};
