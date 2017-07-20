"use strict";

const parse = require('path-parse');
const property = require('lodash/property');

export default require.context('./', true, /^(.*\.(js$))[^.]*$/igm)
  .keys()
  .map(parse)
  .map(property('name'))
  .filter((v) => v !== 'index')
  .reduce((r, v) => {
    const reducer = require(`./${v}`);
    r[reducer.key] = reducer;
    return r;
  }, {});
