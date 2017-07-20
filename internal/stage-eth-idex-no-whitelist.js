#!/usr/bin/env node

'use strict';

var tokens = [{
  name: 'Ether',
  symbol: 'ETH',
  address: '0x' + Array(41).join('0'),
  decimals: 18
}, {
  name: 'DC USD',
  symbol: 'USD.DC',
  address: '',
  decimals: 8
}, {
  name: 'DC BTC',
  symbol: 'BTC.DC',
  address: '',
  decimals: 8
}, {
  name: 'Augur',
  symbol: 'REP',
  address: '',
  decimals: 8
}];

var address = '0x927d0c017450049bbc5c6539292a6939686f201b';

function deploy (next) {
  var path = require('path'),
      join = path.join,
      joinToHome = join.bind(null, process.env.HOME),
      writeFileSync = require('fs').writeFileSync,
      gutil = require('gulp-util'),
      Promise = require('es6-promise'),
      mapSeries = require('es6-promisify')(require('async').mapSeries),
      chalk = require('chalk'),
      range = require('lodash/range'),
      pathExists = require('path-exists').sync,
      mkdirp = require('mkdirp').sync,
      BigRational = require('big-rational'),
      eth = require('./eth')(),
      web3 = eth.web3,
      Token = eth.Token,
      TokenData = eth.TokenData,
      Exchange = eth.Exchange,
      spawnSync = require('child_process').spawnSync,
      ExchangeData = eth.ExchangeData,
      getGasLimit = eth.getGasLimit,
      getGasPrice = eth.getGasPrice,
      getAccounts = eth.getAccounts,
      setupWeb3 = eth.setupWeb3,
      getTransactionReceipt = eth.getTransactionReceipt,
      getBlockNumber = eth.getBlockNumber,
      cfg = require('../config/config-ropsten'),
      db = require('../dist/lib/db')(cfg);

/*
  spawnSync('eth-idex', ['plu', 'deploy', '-t', '10000000000000', 'Pluton', 8, 'PLU'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['hkg', 'deploy', '-t', '100000000000000', 'Pluton', 9, 'PLU'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['plu', 'transfer', 'ray', '100'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['plu', 'transfer', 'phil', '100'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['hkg', 'transfer', 'ray', '100'], { stdio: 'inherit' });
*/
/*
  spawnSync('eth-idex', ['hkg', 'transfer', 'liz2', '100'], { stdio: 'inherit' });
*/
//  spawnSync('eth-idex', ['exchange', 'deploy', '-t', 'ray', 'dvip-impl'], { stdio: 'inherit' });
/*
  spawnSync('eth-idex', ['exchange', 'setWhitelister', '0', 'true'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['exchange', 'setWhitelisted', 'ray', 'true'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['exchange', 'setWhitelisted', 'phil', 'true'], { stdio: 'inherit' });
  spawnSync('eth-idex', ['exchange', 'setWhitelisted', 'alex', 'true'], { stdio: 'inherit' });
*/
/*
  spawnSync('eth-idex', ['exchange', 'setWhitelisted', 'liz2', 'true'], { stdio: 'inherit' });
*/
  var state = require(join(process.env.HOME, '.eth-idex', 'state.json'));
  return db.sync({ force: true }).then(function () {
    return mapSeries(tokens, function (v, next) {
      db.Token.create({
        name: v.name,
        symbol: v.symbol,
        address: state[v.symbol.toLowerCase()] || '0x' + Array(41).join('0'),
        decimals: v.decimals
      }).then(function () {
        next(null);
      }).catch(function (err) {
        next(err);
      });
    });
  }).then(function () {
    writeFileSync(join(__dirname, '..', 'config', 'address.json'), JSON.stringify(state.exchange));
    return db.Config.create({
      key: 'exchange',
      value: state.exchange
    });
  }).then(function () {
    db.close();
  });
};

deploy();
