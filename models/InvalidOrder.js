'use strict';

const Sequelize = require('sequelize');

module.exports = {
  name: 'invalidOrder',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    expires: Sequelize.INTEGER,
    hash: Sequelize.TEXT
  }
};
