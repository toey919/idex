'use strict';

const bindKey = require('lodash/bindKey');

const stringify = bindKey(JSON, 'stringify');
const parse = bindKey(JSON, 'parse');

const { assign } = Object;

assign(module.exports, {
  stringify,
  parse
});
