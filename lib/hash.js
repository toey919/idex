'use strict';

const { sha3, fromDecimal, fromAscii } = new (require('web3'))();
const { partialRight } = require('lodash');
const HEX = 'hex';
const { assign } = Object;

const padLeft = (s, n, char) => {
  if (s.length < n)
    return Array(n - s.length + 1).join(char) + s;
  return s;
};

const sha3HexEncoding = partialRight(sha3, { encoding: HEX });

const salt = fromAscii('\x19Ethereum Signed Message:\n32');

const hashOrder = (address, tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user) => sha3HexEncoding(address + tokenGet.substr(2) + padLeft(fromDecimal(amountGet).substr(2), 64, '0') + tokenGive.substr(2) + padLeft(fromDecimal(amountGive).substr(2), 64, '0') + padLeft(fromDecimal(expires).substr(2), 64, '0') + padLeft(fromDecimal(nonce).substr(2), 64, '0') + user.substr(2));

const hashTrade = (hash, amount, user, nonce) => sha3HexEncoding(hash + padLeft(fromDecimal(amount).substr(2), 64, '0') + user.substr(2) + padLeft(fromDecimal(nonce).substr(2), 64, '0'));

const hashWithdrawal = (address, token, amount, user, nonce) => sha3HexEncoding(address + token.substr(2) + padLeft(fromDecimal(amount).substr(2), 64 ,'0') + user.substr(2) + padLeft(fromDecimal(nonce).substr(2), 64, '0'));

const hashCancel = (order, nonce) => sha3HexEncoding(order + padLeft(fromDecimal(nonce).substr(2), 64 ,'0'));

const saltHash = (hash) => sha3HexEncoding(salt + hash.substr(2));

const saltedHashOrder = (...args) => saltHash(hashOrder(...args));
const saltedHashTrade = (...args) => saltHash(hashTrade(...args));
const saltedHashWithdrawal = (...args) => saltHash(hashWithdrawal(...args));

assign(module.exports, {
  sha3HexEncoding,
  saltHash,
  hashOrder,
  hashTrade,
  hashCancel,
  hashWithdrawal,
  saltedHashOrder,
  saltedHashTrade,
  saltedHashWithdrawal,
  salt,
  HEX
});
