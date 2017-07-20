'use strict';

const { nextTick } = process;
const {
  mapSeries,
  props,
  all,
  resolve,
  nextTickPromise
} = require('./promise');
const {
  getNodes,
  sortNodes
} = require('./graph');
const {
  getTransactionReceipt,
  getMarketContract,
  getGasPrice,
  getNextAddress,
  sendTransaction,
  getBlockNumber,
  sendRawTransactionFormat
} = require('./eth');
const {
  getFeeMake,
  getFeeTake,
  getGasLimit,
  getContractAddress
} = require('./core');
const {
  broadcastToAddress
} = require('./ws-server');
const { constant } = require('lodash');
const exportSingleton = require('./singleton');
const { assign } = Object;
const { fromDecimal } = new (require('web3'))();

const ln = (v) => {
  console.log(v);
  return v;
};

class Loop {
  constructor() {
    this._processing = [];
    this._scheduled = [];
    this._ticking = false;
  }
  tick() {
    this.queueCommonWork();
    this._ticking = true;
    let i = -1;
    return mapSeries(this._processing.slice(), (v) => {
      i++;
      return v().then(() => {
        if (~i) this._processing.splice(0, 1);
        return true;
      });
    }).catch((err) => console.log(err.stack)).then(() => (this._ticking = false, this._processing = this._scheduled, this._scheduled = []))
      .then(() => nextTick(() => this.tick()));
  }
  _getQueue() {
    if (this._ticking) return this._scheduled;
    return this._processing;
  }
  queue(work) {
    return this._getQueue().push(work);
  }
  queueCommonWork() {
    this.queue(() => this.checkIfTransactionsMined());
    this.queue(() => this.checkQueueDispatch());
    return this;
  }
  checkIfTransactionsMined() {
    return mapSeries(getNodes(), (v) => {
      if (v.isDispatched() && !v.isComplete()) {
        return getBlockNumber().then((number) => getTransactionReceipt(v.getTransactionHash()).then((receipt) => {
          if (receipt && receipt.logs && receipt.logs.find((v) => v.type === 'mined') || receipt && receipt.blockNumber < number) {
            if (v.getType() === 'withdrawal') {
              broadcastToAddress(v.get('sender'), {
                method: 'notifyWithdrawalComplete',
                payload: {
                  sender: v.get('sender'),
                  transactionHash: v.get('transactionHash'),
                  token: v.get('token'),
                  amount: v.get('amount')
                }
              });
            } else if (v.getType() === 'trade') {
              broadcastToAddress(v.get('sender'), {
                method: 'notifyTradeComplete',
                payload: {
                  sender: v.get('sender'),
                  hash: v.get('hash'),
                  transactionHash: v.get('transactionHash')
                }
              });
            } else if (v.getType() === 'order') {
              broadcastToAddress(v.get('sender'), {
                method: 'notifyOrderComplete',
                payload: {
                  sender: v.get('sender'),
                  hash: v.get('hash'),
                  transactionHash: v.get('transactionHash')
                }
              });
            }
            return v.updateNode({ complete: new Date() }).then(() => (v.detach(), true));
          }
          else return resolve(false);
        }));
      } else return resolve(false);
    }).then((results) => Boolean(results.find(Boolean)))
    .then((queueMore) => {
      if (queueMore) sortNodes();
      return queueMore;
    });
  }
  updateTradeModel(trade, feeMake, feeTake, transactionHash, sender) {
    return all([
      trade.updateModel({
        feeMake,
        feeTake
      }),
      trade.updateNode({
        transactionHash,
        dispatched: new Date(),
        sender
      })
    ]).then(constant(trade)).catch(() => nextTick(() => this.updateTradeModel(trade, feeMake, feeTake, transactionHash, sender)));
  }
  keepTryingSendTrade(address, trade, feeMake, feeTake, sender, gas, gasPrice, broadcasted) {
    if (!broadcasted) broadcastToAddress(address, {
      method: 'notifyTradeDispatched',
      payload: {
        sender: address,
        hash: trade.get('hash'),
        transactionHash: trade.get('transactionHash')
      }
    });
    console.log(trade.get('hash'));
    return sendRawTransactionFormat(getMarketContract(address), 'trade', trade.get('hash'), trade.get('user'), trade.get('nonce'), trade.get('v'), trade.get('r'), trade.get('s'), trade.get('amount'), feeMake, feeTake, {
      from: sender,
      gas,
      gasPrice
    }).catch(() => nextTickPromise().then(() => this.keepTryingSendTrade(address, trade, feeMake, feeTake, sender, gas, gasPrice, true)))
      .then((transactionHash) => this.updateTradeModel(trade, feeMake, feeTake, transactionHash, sender));
  }
  keepTryingSendWithdrawal(address, withdrawal, sender, gas, gasPrice, broadcasted) {
    if (!broadcasted) broadcastToAddress(address, {
      method: 'notifyWithdrawalDispatched',
      payload: {
        sender: address,
        hash: withdrawal.get('hash'),
        transactionHash: withdrawal.get('transactionHash')
      }
    });
    return sendRawTransactionFormat(getMarketContract(address), 'adminWithdraw', withdrawal.get('token'), withdrawal.get('amount'), withdrawal.get('user'), withdrawal.get('nonce'), withdrawal.get('v'), withdrawal.get('r'), withdrawal.get('s'), {
      from: sender,
      gas,
      gasPrice
    }).catch(() => this.keepTryingSendWithdrawal(address, withdrawal, sender, gas, gasPrice, true))
      .then((transactionHash) => this.updateWithdrawalModel(withdrawal, transactionHash, sender));
  }
  keepTryingSendOrder(address, order, sender, gas, gasPrice, broadcasted) {
    if (!broadcasted) broadcastToAddress(address, {
      method: 'notifyOrderDispatched',
      payload: {
        sender: address,
        hash: order.get('hash'),
        transactionHash: order.get('transactionHash')
      }
    });
    return sendRawTransactionFormat(getMarketContract(address), 'order', order.get('tokenBuy'), order.get('amountBuy'), order.get('tokenSell'), order.get('amountSell'), order.get('expires'), order.get('nonce'), order.get('user'), order.get('v'), order.get('r'), order.get('s'), {
      from: sender,
      gas,
      gasPrice
    }).catch((err) => {
      console.log(err.stack);
      return this.keepTryingSendOrder(address, order, sender, gas, gasPrice, true);
    }).then((transactionHash) => this.updateOrderModel(order, transactionHash, sender));
  }
  updateOrderModel(order, transactionHash, sender) {
    return order.updateNode({
      transactionHash,
      dispatched: new Date(),
      sender
    }).then(constant(order)).catch(() => nextTick(() => this.updateOrderModel(order, transactionHash, sender)));
  }
  updateWithdrawalModel(withdrawal, transactionHash, sender) {
    return withdrawal.updateNode({
      transactionHash,
      dispatched: new Date(),
      sender
    }).then(constant(withdrawal)).catch(() => nextTick(() => this.updateWithdrawalModel(withdrawal, transactionHash, sender)));
  }
  checkQueueDispatch() {
    return props({
      address: getContractAddress(),
      gas: getGasLimit(),
      gasPrice: getGasPrice(),
      feeMake: getFeeMake(),
      feeTake: getFeeTake()
    }).catch((err) => {
      console.log(err.stack);
      return nextTickPromise().then(() => this.checkQueueDispatch());
    }).then(({
      address,
      gas,
      gasPrice,
      feeMake,
      feeTake
    }) => {
      return mapSeries(getNodes(), (v) => {
        const sender = getNextAddress();
        if (v.hasNoDependencies() && !v.isDispatched() && sender) {
          switch (v.getType()) {
            case 'trade':
              return this.keepTryingSendTrade(address, v, feeMake, feeTake, sender, gas, gasPrice);
            case 'order':
              if (getNodes().find((u) => u.getType() === 'trade' && v.get('hash') === u.get('hash'))) return this.keepTryingSendOrder(address, v, sender, gas, gasPrice);
              break;
            case 'withdrawal':
              return this.keepTryingSendWithdrawal(address, v, sender, gas, gasPrice);
          }
        }
        return resolve(false);
      });
    }).catch((err) => console.log(err.stack));
  }
  startEngine() {
    return this.tick();
  }
}

let instance;

const getLoop = () => instance;

const startLoop = () => {
  instance = new Loop();
  instance.startEngine()
  return resolve(instance);
};

assign(module.exports, exportSingleton(getLoop, Loop.prototype, {
  Loop,
  startLoop,
  getLoop
}));
