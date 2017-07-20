'use strict';

const Bluebird = require('bluebird');
const Promise = require('es6-promise');
const bindKey = require('lodash/bindKey');
const chunk = require('lodash/chunk');
const concat = require('lodash/concat');

const all = bindKey(Promise, 'all');
const mapSeries = bindKey(Bluebird, 'mapSeries');
const map = bindKey(Bluebird, 'map');
const promisify = bindKey(Bluebird, 'promisify');
const props = bindKey(Bluebird, 'props');
const resolve = bindKey(Promise, 'resolve');
const { keys } = Object;

const batch = (jobs, cb, size) => mapSeries(chunk(jobs, size), (v) => map(v, cb)).then((ary) => ary.reduce((r, v) => concat(r, v), []));

const { nextTick } = process;

const nextTickPromise = () => new Promise((resolve) => nextTick(resolve));
const timeout = (n) => new Promise((resolve) => setTimeout(resolve, n));
const setImmediatePromise = () => new Promise((resolve) => setImmediate(resolve));
const propsWithCatch = (o) => new Promise((resolve, reject) => props(keys(o).reduce((r, v) => {
  r[v] = o[v].catch(reject);
  return r;
}, {})).then(resolve));
    

module.exports = {
  all,
  mapSeries,
  promisify,
  props,
  batch,
  nextTickPromise,
  resolve,
  propsWithCatch,
  setImmediatePromise
};
