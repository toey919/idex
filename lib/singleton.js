"use strict";

const functionsIn = require('./util/functions-in');
const assign = require('object-assign');

module.exports = (getter, prototype, additional) => assign(functionsIn(prototype).reduce((r, v) => {
  r[v] = (...args) => {
    const instance = getter();
    if (!instance) throw Error(((prototype.constructor || {}).name || "Singleton") + " instance is not yet initialized");
    return instance[v](...args);
  };
  return r;
}, {}), additional || {});
