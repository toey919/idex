'use strict';

const singular = require('singular');
const winston = require('winston');
const {
  mkdirp,
  pathExists
} = require('./fs');
const exportSingleton = require('./singleton');
const { join } = require('path');
const {
  partial,
  isFunction
} = require('lodash');

const joinToHome = partial(join, process.env.HOME);
const idexPath = join(process.env.HOME, '.v1');
const joinToIDEXPath = partial(join, idexPath);
const { getOwnPropertyNames } = Object;
const assign = require('object-assign');

let instance;

const getLogger = () => instance;

const instantiateLogger = () => pathExists(idexPath).then((exists) => {
  if (!exists) return mkdirp(idexPath);
  else return Promise.resolve();
}).then(() => (instance = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: joinToIDEXPath('idex.log') })
  ]
})));

const dummyLogger = new winston.Logger({
  transports: [
    new winston.transports.Console()
  ]
});

const methods = getOwnPropertyNames(dummyLogger).filter((v) => isFunction(dummyLogger[v])).reduce((r, v) => {
  r[v] = (...args) => instance[v](...args);
  return r;
}, {});

assign(module.exports, exportSingleton(getLogger, winston.Logger.prototype, assign({
  getLogger,
  instantiateLogger
}, methods)));
