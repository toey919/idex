'use strict';

import { mapSeries, map } from 'async';
import defer from './defer';

export default {
  mapSeries: (ary, cb) => {
    return new Promise((resolve, reject) => {
      mapSeries(ary, cb, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  map: (ary, cb) => {
    return new Promise((resolve, reject) => {
      map(ary, cb, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  timeout: (n) => {
    const { promise, resolve, reject } = defer();
    const timer = setTimeout(resolve, n);
    const cancel = () => {
      clearTimeout(timer);
      reject(Error('@@cancel'));
    };
    return {
      timer: promise,
      cancel
    };
  },
  deterministicTimeout: (n) => new Promise((resolve, _) => setTimeout(resolve, n))
};


