'use strict';

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
      getTransactionReceipt = eth.getTransactionReceipt,
      getBlockNumber = eth.getBlockNumber,
      tokens = require('./tokens'),
      cfg = require('../config'),
      db = require('../dist/lib/db')(cfg);

  var log = console.log;

  var state = {};
  var accounts, gasLimit, gasPrice, mappedTokens, exchange, primaryAccount;

  var decimals = 8;
  var initialSupply = BigRational(10).pow(6).toDecimal(),
      toTransfer = BigRational(10).pow(4).toDecimal();

  Promise.all([
    getAccounts(),
    getGasLimit(),
    getGasPrice(),
    db.sync({ force: true })
  ]).then(function (results) {
    accounts = results[0];
    primaryAccount = accounts[0];
    gasLimit = results[1];
    gasPrice = results[2];
    log('primary account is ' + chalk.green(primaryAccount));
    return mapSeries(tokens, function (v, next) {
      var initialSupplyAdjusted = BigRational(initialSupply).multiply(BigRational(10).pow(decimals)).toDecimal();
      log('creating ' + initialSupplyAdjusted + ' units of ' + chalk.green(v.symbol));
      Token.new(initialSupplyAdjusted, v.name, decimals, v.symbol, {
        data: TokenData,
        from: primaryAccount,
        gasPrice: gasPrice,
        gas: gasLimit
      }, (function () {
        var transactionHash;
        return function (err, result) {
          if (err) return next(err);
          if (!transactionHash && result.transactionHash) transactionHash = result.transactionHash;
          if (result.address) {
            log('contract created at ' + chalk.green(result.address));
            (function pollForMinedReceipt() {
              var receipt;
              getTransactionReceipt(transactionHash).then(function (_receipt) {
                receipt = _receipt;
                if (!receipt) return Promise.resolve();
                return getBlockNumber();
              }).then(function (number) {
                if (receipt && (receipt.logs && receipt.logs && receipt.logs.find(function (v) { return v.type === 'mined'; }) || receipt.blockNumber <= number)) { 
                  ++decimals;
                  next(null, {
                    symbol: v.symbol,
                    name: v.name,
                    address: result.address
                  });
                } else pollForMinedReceipt();
              }).catch(function (err) {
                next(err);
              });
            })();
          }
        };
      })());
    });
  }).then(function (_tokens) {
    let i;
    mappedTokens = _tokens;
    decimals = 8;
    return mapSeries(mappedTokens, function (v, next) {
      i = 1;
      state[v.symbol.toLowerCase()] = v.address;
      mapSeries(accounts.slice(1), function (acct, next) {
        var transferAdjusted = BigRational(toTransfer).multiply(BigRational(10).pow(decimals)).toDecimal();
        log('sending ' + chalk.magenta(transferAdjusted) + ' units of ' + chalk.red(v.symbol + '(' + v.address + ')') + ' to ' + chalk.green(acct) + ' from ' + chalk.green(primaryAccount));
        Token.at(v.address).balanceOf.call(primaryAccount, function (err, result) {
          log('account ' + chalk.green(primaryAccount) + ' holds ' + chalk.red(result) + ' tokens');
          Token.at(v.address).transfer.sendTransaction(acct, transferAdjusted, {
            from: primaryAccount,
            gasPrice: gasPrice,
            gas: gasLimit
          }, function (err, tx) {
            if (err) return next(err);
            ++i;
            (function pollUntilReady() {
              web3.eth.getTransactionReceipt(tx, function (err, result) {
                if (err) return next(err);
                web3.eth.getBlockNumber(function (err, number) {
                  if (err) return next(err);
                  number = +number;
                  if (result && (result.logs && result.logs.find(function (v) { v.type === 'mined'; }) || result.blockNumber === number)) return next(null, tx);
                  setTimeout(pollUntilReady, 5000);
                });
              });
            })();
          });
        });
      }).then(function (txes) {
        decimals++;
        next(null, txes);
      }).catch(function (err) {
        next(err);
      });
    });
  }).then(function () {
    return db.Token.create({
      name: 'Ether',
      symbol: 'ETH',
      address: '0x' + Array(41).join('0'),
      decimals: 18
    });
  }).then(function () {
    decimals = 8;
    return mapSeries(mappedTokens, function (v, next) {
      db.Token.create({
        name: v.name,
        symbol: v.symbol,
        address: v.address,
        decimals: decimals
      }).then(function () {
        decimals++;
        next(null);
      }).catch(function (err) {
        next(err);
      });
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      Exchange.new(primaryAccount, "0x0", {
        data: ExchangeData,
        from: primaryAccount,
        gasPrice: gasPrice,
        gas: gasLimit
      }, function (err, result) {
        if (err) return next(err);
        if (result.address) {
          exchange = Exchange.at(result.address);
          log('deployed ' + chalk.red('exchange') + ' to ' + chalk.green(result.address));
          writeFileSync(join(__dirname, '..', 'config', 'address.json'), JSON.stringify(result.address));
          state.exchange = result.address;
          db.Config.create({
            key: 'exchange',
            value: result.address
          }).then(resolve).catch(reject);
        }
      });
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      log('creating whitelister account ' + chalk.green(primaryAccount));
      exchange.setWhitelister.sendTransaction(primaryAccount, true, {
        from: primaryAccount,
        gas: gasLimit,
        gasPrice: gasPrice
      }, function (err, result) {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }).then(function () {
    return mapSeries(accounts, function (v, next) {
      log('whitelisting account ' + chalk.green(v));
      exchange.setWhitelisted.sendTransaction(v, true, {
        from: primaryAccount,
        gas: gasLimit,
        gasPrice: gasPrice
      }, function (err, result) {
        if (err) return next(err);
        next(null, result);
      });
    });
  }).then(function () {
    var stateFile = joinToHome('.eth-idex', 'state.json');
    state.rpc = {
      port: cfg.rpc.port,
      hostname: cfg.rpc.hostname,
      hd: false,
      password: null,
      local: true
    };
    if (!pathExists(joinToHome('.eth-idex'))) mkdirp(joinToHome('.eth-idex'));
    log('writing state to ' + chalk.cyan(stateFile));
    writeFileSync(stateFile, JSON.stringify(state, null, 1));
    log('closing database handle');
    db.close();
    next();
  }).catch(function (err) {
    db.close();
    next(new gutil.PluginError('web3', err));
  });
};
