'use strict';

module.exports = function () {
  var cfg = require('../config/config-ropsten'),
      Promise = require('es6-promise'),
      assign = require('object-assign'),
      key = require('./key'),
      lightwallet = require('eth-lightwallet'),
      HookedWeb3Provider = require('hooked-web3-provider'),
      format = require('url').format,
      Web3 = require('web3'),
      web3 = new Web3(new Web3.providers.HttpProvider(format({
        hostname: cfg.rpc.hostname,
        port: cfg.rpc.port,
        protocol: 'http:'
      }))),
      ExchangeContract = require('eth-idex/build/contracts/Exchange.sol'),
      TokenContract = require('eth-idex/build/contracts/MyToken.sol');

  var Token = web3.eth.contract(TokenContract.abi),
      Exchange = web3.eth.contract(ExchangeContract.abi),
      TokenData = TokenContract.binary,
      ExchangeData = ExchangeContract.binary,
      isLW;

  function setupWeb3() {
    return new Promise((resolve, reject) => {
      var accounts;
      lightwallet.keystore.createVault({
        seedPhrase: key.seed,
        password: key.passwd
      }, (err, transaction_signer) => {
        if (err) return reject(err);
        transaction_signer.keyFromPassword(key.passwd, (err, result) => {
          if (err) return reject(err);
          transaction_signer.passwordProvider = (cb) => { return cb(null, key.passwd); };
          transaction_signer.generateNewAddress(result, 1);
          accounts = transaction_signer.getAddresses().map((v) => {
            if (v.substr(0, 2) !== '0x') return '0x' + v;
            return v;
          });
          web3 = new Web3(new HookedWeb3Provider({
            host: format({
              protocol: 'http:',
              hostname: cfg.rpc.hostname,
              port: cfg.rpc.port
            }),
            transaction_signer
          }));
          isLW = true;
          web3.accounts = accounts;
          return resolve(web3);
        });
      });
    });
  }

  function getGasLimit() {
    return new Promise(function (resolve, reject) {
      web3.eth.getBlock('pending', function (err, result) {
        if (err) return reject(err);
        resolve(+result.gasLimit);
      });
    });
  } 

  function getGasPrice() {
    return new Promise(function (resolve, reject) {
      web3.eth.getGasPrice(function (err, result) {
        if (err) return reject(err);
        resolve(+result);
      });
    });
  }

  function getAccounts() {
    if (isLW) return Promise.resolve(web3.accounts);
    return new Promise(function (resolve, reject) {
      web3.eth.getAccounts(function (err, accounts) {
        if (err) return reject(err);
        resolve(accounts);
      });
    });
  }

  function getTransactionReceipt(tx) {
    return new Promise(function (resolve, reject) {
      web3.eth.getTransactionReceipt(tx, function (err, receipt) {
        if (err) return reject(err);
        resolve(receipt);
      });
    });
  }

  function getBlockNumber() {
    return new Promise(function (resolve, reject) {
      web3.eth.getBlockNumber(function (err, number) {
        if (err) return reject(err);
        resolve(number);
      });
    });
  }

  return {
    web3: web3,
    Token: Token,
    TokenData: TokenData,
    Exchange: Exchange,
    ExchangeData: ExchangeData,
    getGasLimit: getGasLimit,
    getGasPrice: getGasPrice,
    getAccounts: getAccounts,
    getTransactionReceipt: getTransactionReceipt,
    getBlockNumber: getBlockNumber,
    setupWeb3: setupWeb3
  };
};
    
