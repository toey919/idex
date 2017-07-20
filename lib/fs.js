'use strict';

const {
  bindKey,
  mapValues,
  omitBy
} = require('lodash');
const { promisify } = require('bluebird');
const es6Promisify = require('es6-promisify');
const fs = require('fs');
const mkdirp = es6Promisify(require('mkdirp'));
const pathExists = es6Promisify(require('path-exists'));
const assign = require('object-assign');

const isCapitalized = bindKey(/^[A-Z]/, 'test');
const isSync = bindKey(/Sync$/, 'test');

assign(module.exports, {
  mkdirp,
  pathExists
}, mapValues(omitBy(fs, (_, key) => isCapitalized(key) || isSync(key) || key === 'constants'), (value) => promisify(value)));
