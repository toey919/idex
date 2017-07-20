"use strict";

const Sequelize = require('sequelize');

module.exports = {
  name: 'invalidPending',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    hash: Sequelize.TEXT
  }
};
