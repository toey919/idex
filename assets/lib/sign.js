'use strict';

const { getState } = require('../store/container');
const {
  hashOrder,
  hashTrade,
  hashCancel,
  hashWithdrawal,
  saltHash
} = require('../../lib/hash');
const {
  ecsign,
  bufferToHex,
  toBuffer
} = require('ethereumjs-util');
const mapValues = require('lodash/mapValues');
const { getWallet } = require('../client/eth');
const { assign } = Object;
const isTypedArray = require('is-typed-array');

const sign = (hash) => mapValues(ecsign(toBuffer(hash), getWallet().getPrivateKey()), (v) => isTypedArray(v) && bufferToHex(v) || v);

const signWithdrawal = ({
  token,
  amount,
  user,
  nonce
}) => {
  const hash = hashWithdrawal(getState().address, token, amount, user, nonce);
  console.log(hash);
  const saltedHash = saltHash(hash);
  console.log(saltedHash);
  return assign({
    hash
  }, sign(saltedHash));
};

const signOrder = ({
  tokenBuy,
  amountBuy,
  tokenSell,
  amountSell,
  nonce,
  expires,
  user
}) => {
  const hash = hashOrder(getState().address, tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce, user);
  const saltedHash = saltHash(hash);
  return assign({
    hash
  }, mapValues(ecsign(toBuffer(saltedHash), getWallet().getPrivateKey()), (v) => isTypedArray(v) && bufferToHex(v) || v));
};

const signTrade = ({
  hash: orderHash,
  amount,
  user,
  nonce
}) => {
  const hash = saltHash(hashTrade(orderHash, amount, user, nonce));
  return assign({
    hash
  }, mapValues(ecsign(toBuffer(hash), getWallet().getPrivateKey()), (v) => isTypedArray(v) && bufferToHex(v) || v));
};

const signCancel = ({
  hash,
  nonce
}) => {
  const cancelHash = saltHash(hashCancel(hash, nonce));
  return assign({
    hash: cancelHash
  }, mapValues(ecsign(toBuffer(cancelHash), getWallet().getPrivateKey()), (v) => isTypedArray(v) && bufferToHex(v) || v));
};

module.exports = {
  signOrder,
  signCancel,
  signWithdrawal,
  signTrade
};

