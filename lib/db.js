'use strict';

const Sequelize = require('sequelize');
const config = require('../config');
const { readdir } = require('./fs');
const assign = require('object-assign');
const { partial, mapValues } = require('lodash');
const { join, parse } = require('path');
const exportSingleton = require('./singleton');
const { method } = require('lodash');

const modelPath = join(__dirname, '..', 'models');
const joinToModelPath = partial(join, modelPath);
const plainObject = { plain: true };

const toPlain = method('get', plainObject);
const { keys } = Object;

let instance;

const getInstance = () => instance;

const initializeDatabase = () => readdir(modelPath).then((paths) => {
  instance = new Database(paths.reduce((r, v) => {
    const { name } = parse(v);
    r[name] = require(joinToModelPath(name));
    return r;
  }, {}));
  return instance;
});

class ModelCollection {
  constructor(models) {
    assign(this, models);
  }
  getByName(n) {
    const key = keys(this).find((name) => this[name].name === n);
    if (!key) throw Error('no model by name ' + n + ' found');
    return this[key];
  }
}

class Database extends Sequelize {
  constructor(models) {
    super(config.mysql.database, config.mysql.user, config.mysql.password, {
      host: config.mysql.host,
      logging: false,
      dialect: 'mysql',
      omitNull: true
    });
    this._models = new ModelCollection(mapValues(models || {}, (value, key) => {
      const model = this.define(value.name || key.toLowerCase(), value.fields, value.options || {});
      model.name = value.name || key.toLowerCase();
      return model;
    }));
  }
  getModel(m) {
    return this._models[m];
  }
  getModels() {
    return this._models;
  }
};

assign(module.exports, exportSingleton(getInstance, Database.prototype, {
  getInstance,
  initializeDatabase,
  plainObject,
  toPlain
}));
