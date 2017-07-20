'use strict';

const {
  getBlock,
  getTransaction,
  getBlockNumber
} = require('./eth');
const {
  batch,
  timeout,
  mapSeries,
  all,
  resolve
} = require('./promise');
const {
  getCurrentBlock,
  setCurrentBlock,
  getContractAddress,
  increaseBalance
} = require('./core');
const { pushBalanceSheet } = require('./ws-server');
const {
  castArray,
  bindKey
} = require('lodash');
const { sha3, toBigNumber } = new (require('web3'))()
const {
  getModel,
  transaction
} = require('./db');
const coder = require('web3/lib/solidity/coder');
const decodeParams = bindKey(coder, 'decodeParams');
const depositTokenHash = sha3('depositToken(address,uint256)').substr(0, 10);
const depositHash = sha3('deposit()').substr(0, 10);
const withdrawalHash = sha3('withdraw(address,uint256)').substr(0, 10);

const RETRY_INTERVAL = 500;

const downloadNextBlock = () => getCurrentBlock()
  .then((number) => {
    return getBlock(number + 1).then((block) => {
      if (block) return block;
      else return undefined;
    }).then(({ transactions } = {}) => batch(castArray(transactions), (v) => getTransaction(v), 10))
      .then((transactions) => transactions.filter(Boolean)).then((transactions) => getContractAddress()
        .then((address) => transactions.filter(({ to } = {}) => to === address)))
        .then((transactions) => transactions.filter(({ input } = {}) => input.substr(0, 10) === depositHash || input.substr(0, 10) === withdrawalHash || input.substr(0, 10) === depositTokenHash))
        .then((transactions) => mapSeries(transactions, ({ input, transactionHash, from, value } = {}) => {
          return getModel('Transaction').findOne({
            where: {
              transactionHash
            }
          }).then((tx) => {
            if (!tx) {
              return getModel('Transaction').create({
                transactionHash
              }).then(() => {
                if (input.substr(0, 10) === depositTokenHash) {
                  let [ token, amount ] = decodeParams(['address', 'uint256'], input.substr(10));
                  amount = amount.toPrecision();
                  return increaseBalance(from, token, amount).then(() => pushBalanceSheet(from));
                } else if (input.substr(0, 10) === depositHash) {
                  let amount = toBigNumber(value).toPrecision();
                  return transaction((t) => increaseBalance(from, '0x' + Array(41).join('0'), amount, t).then(() => pushBalanceSheet(from)));
                } else if (input.substr(0, 10) === withdrawalHash) {
                  let token = '0x' + input.substr(34, 40);
                  let amount = toBigNumber('0x' + input.substr(74, 40)).toPrecision();
                  return transaction((t) => subtractBalance(from, token, amount, t).then(() => pushBalanceSheet(from)));
                }
              });
            }
            return resolve(false);
          });
        }))
        .then(() => setCurrentBlock(number + 1));
      });

const startDownloadingBlockchain = () => all([
  getCurrentBlock(),
  getBlockNumber()
]).then(([ serverBlock, block ]) => {
  if (serverBlock < block)
    return downloadNextBlock().catch(console.log);
  else return timeout(RETRY_INTERVAL);
}).then(startDownloadingBlockchain).catch(startDownloadingBlockchain);

const { assign } = Object;

assign(module.exports, {
  startDownloadingBlockchain
});
