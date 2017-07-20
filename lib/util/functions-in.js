'use strict';

const { isFunction } = require('lodash');
const keysIn = require('./keys-in');

module.exports = (o) => keysIn(o).filter((v) => isFunction(o[v]));
