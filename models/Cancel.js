"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'cancel',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user: Sequelize.TEXT,
    v: Sequelize.INTEGER,
    r: Sequelize.TEXT,
    s: Sequelize.TEXT,
    hash: Sequelize.TEXT,
    time: Sequelize.DATE
  }, 
  options: {
    tableName: 'cancels'
  }
};
