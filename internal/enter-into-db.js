'use strict';

var tokens = [{
  name: 'Ether',
  symbol: 'ETH',
  address: '0x' + Array(41).join('0'),
  decimals: 18
}, {
  name: 'Pluton',
  symbol: 'PLU',
  address: '0x2f8fe7aa20a822e8b984d576aa43381114a74528',
  decimals: 8
}, {
  name: 'Ether Camp',
  symbol: 'HKG',
  address: '0x8c2e028a3b36962a4b0a0636798b427d43b20944',
  decimals: 9
}];

var address = '0x927d0c017450049bbc5c6539292a6939686f201b';

module.exports = function (next) {
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
      ExchangeData = eth.ExchangeData,
      getGasLimit = eth.getGasLimit,
      getGasPrice = eth.getGasPrice,
      getAccounts = eth.getAccounts,
      setupWeb3 = eth.setupWeb3,
      getTransactionReceipt = eth.getTransactionReceipt,
      getBlockNumber = eth.getBlockNumber,
      cfg = require('../config/config-ropsten'),
      db = require('../dist/lib/db')(cfg);

  return db.sync({ force: true }).then(function () {
    return mapSeries(tokens, function (v, next) {
      db.Token.create({
        name: v.name,
        symbol: v.symbol,
        address: v.address,
        decimals: v.decimals
      }).then(function () {
        next(null);
      }).catch(function (err) {
        next(err);
      });
    });
  }).then(function () {
    writeFileSync(join(__dirname, '..', 'config', 'address.json'), JSON.stringify(address));
    return db.Config.create({
      key: 'exchange',
      value: address
    });
  }).then(function () {
    db.close();
  });
};
