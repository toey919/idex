'use strict';

const Sequelize = require('sequelize');

module.exports = {
  name: 'edge',
  fields: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    incoming: Sequelize.INTEGER,
    outgoing: Sequelize.INTEGER
  } 
};
