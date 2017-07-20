'use strict';

import { camel } from 'change-case';
const { keys } = Object;

const msRe = /(\d+)ms$/,
      sRe = /(\d+)s$/;

export default (o) => keys(o).reduce((r, v) => {
  let parts, newKey = camel(v);
  if ((parts = msRe.exec(o[v]))) r[newKey] = +parts[1];
  else if ((parts = sRe.exec(o[v]))) r[newKey] = +parts[1];
  else r[newKey] = o[v];
  return r;
}, {});
