'use strict';

const { ecrecover, pubToAddress, addHexPrefix } = require('ethereumjs-util');
const { HEX } = require('./hash');

const ln = (v) => {
  console.log(v);
  return v;
};

const validateSignature = (user, hash, v, r, s) => user.toLowerCase() === addHexPrefix(pubToAddress(ecrecover(Buffer.from(hash.substr(2), HEX), v, Buffer.from(r.substr(2), HEX), Buffer.from(s.substr(2), HEX))).toString(HEX)).toLowerCase();

const recover = (hash, v, r, s) => addHexPrefix(pubToAddress(ecrecover(hash, v, Buffer.from(r.substr(2), HEX), Buffer.from(s.substr(2), HEX))).toString(HEX));

module.exports = {
  validateSignature,
  ecrecover: recover
};
