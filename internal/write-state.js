'use strict';

var fs = require('fs'),
    join = require('path').join,
    writeFileSync = fs.writeFileSync,
    readFileSync = fs.readFileSync;

var parse = JSON.parse,
    stringify = JSON.stringify;

var statePath = join(process.env.HOME, '.eth-idex', 'state.json');

var state = parse(readFileSync(statePath, 'utf8'));

var assign = Object.assign;

var tokens = require('./tokens');
writeFileSync(statePath, stringify(assign(state, tokens.reduce(function (r, v) {
  r[v.symbol.toLowerCase()] = v.address.toLowerCase();
  return r;
}, {})), null, 2));
