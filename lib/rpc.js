'use strict';

const {
  getModel,
  toPlain
} = require('./db');
const {
  resolve,
  props
} = require('./promise');
const core = require('./core');
const {
  getBalanceSheet,
  getContractAddress,
  performTrade,
  performWithdrawal,
  performOrder,
  performCancel
} = core;
const {
  APIError,
  serializableFromError
} = require('./error');
const { isAddress } = new (require('web3'))();
const property = require('lodash/property');
const exportSingleton = require('./singleton');
const { isArray } = Array;
const { now } = Date;

const validateEthereumAddress = (address) => {
  if (isArray(address)) return address.reduce((r, v) => {
    if (!r) return r;
    if (!isAddress(v)) return false;
    return true;
  }, true);
  return isAddress(address);
};

class WSRPC {
  constructor() {}
  digest({ method, payload = {} }, client) {
    switch (method) {
      case 'ping':
        return this._pong(payload);
      case 'doSync':
        return this._doSync(payload);
      case 'getOrders':
        return this._getOrderBook(payload);
      case 'subscribeEthereumAddress':
        if (!validateEthereumAddress(payload)) return resolve({
          error: true,
          message: 'Invalid Ethereum address'
        }); 
        client.subscribeEthereumAddress(payload);
        return resolve({ success: true });
      case 'unsubscribeEthereumAddress':
        client.unsubscribeEthereumAddresses(payload);
        return resolve({ success: true });
      case 'getBalanceSheet':
        return core.getBalanceSheet(payload.address).then((payload) => ({
          method: 'pushBalanceSheet',
          payload
        }));
      case 'getTransactionGraph':
        return resolve({
          method: 'pushTransactionGraph',
          payload: getSerializableNodes()
        });
      case 'doOrderSync':
        return this._doOrderSync(payload);
      case 'doTradeSync':
        return this._doTradeSync(payload);
      case 'doCancelSync':
        return this._doCancelSync(payload);
      case 'makeOrder':
        return this._makeOrder(payload);
      case 'makeTrade':
        return this._makeTrade(payload);
      case 'makeCancel':
        return this._makeCancel(payload);
      case 'makeWithdrawal':
        return this._makeWithdrawal(payload); 
      case 'getBalanceSheet':
        return this._getBalanceSheet(payload);
      default:
        return this._methodMissing(method);
    }
  }
  _methodMissing(method) {
    return resolve(serializableFromError(APIError(2, method)));
  }
  _doSync({
    selectedAccount
  }) {
    return props({
      nonce: getModel('Account').findOne({
        where: {
          address: selectedAccount
        }
      }).then(toPlain).then(property('nonce')).then(Number).then((v) => v + 1),
      address: core.getContractAddress()
    });
  }
  _pong() {
    return resolve({
      pong: now()
    });
  }
  _doOrderSync({
    highestOrderId,
    limit
  }) {
    return getModel('Order').findAll({     
      where: {
        id: {
          $gt: highestOrderId
        }
      },
      limit
    }).then((orders) => orders.map(toPlain));
  }
  _doTradeSync({
    highestTradeId,
    limit
  }) {
    return getModel('Trade').findAll({
      where: {
        id: {
          $gt: highestTradeId
        }
      },
      limit
    }).then((trades) => trades.map(toPlain));
  }
  _doCancelSync({
    highestCancelId,
    limit
  }) {
    return getModel('Cancel').findAll({
      where: {
        id: {
          $gt: highestCancelId
        }
      },
      limit
    }).then((cancels) => cancels.map(toPlain));
  }
  _getOrderBook({
    id: orderId = 0,
    limit = Number.MAX_SAFE_INTEGER
  }) {
    return getModel('Order').findAll({
      where: {
        id: {
          $gte: orderId
        }
      },
      limit
    }).then((orders) => orders.map(toPlain))
      .then((payload) => ({
        id,
        payload
      }));
  }
  _makeOrder({
    tokenBuy,
    amountBuy,
    tokenSell,
    amountSell,
    user,
    nonce,
    expires,
    v,
    r,
    s
  }) {
    return core.performOrder({
      tokenBuy,
      amountBuy,
      tokenSell,
      amountSell,
      user,
      nonce,
      expires,
      v,
      r,
      s
    });
  }
  _makeTrade({
    orderHash,
    nonce,
    amount,
    user,
    v,
    r,
    s
  }) {
    return core.performTrade({
      orderHash,
      amount,
      nonce,
      user,
      v,
      r,
      s
    });
  }
  _makeCancel({
    orderHash,
    nonce,
    user,
    v,
    r,
    s
  }) {
    return core.performCancel({
      orderHash,
      nonce,
      user,
      v,
      r,
      s
    });
  }
  _makeWithdrawal({
    user,
    amount,
    token,
    nonce,
    v,
    r,
    s
  }) {
    return core.performWithdrawal({
      user,
      amount,
      token,
      nonce,
      v,
      r,
      s
    });
  }
  _getBalanceSheet({ address }) {
    return core.getBalanceSheet(address).then((sheet) => ({
      method: 'pushBalanceSheet',
      payload: sheet
    }));
  }
}

let instance;

const getWSRPC = () => instance;
const instantiateWSRPC = () => {
  instance = new WSRPC();
  return resolve(instance);
};

const { assign } = Object;

assign(module.exports, exportSingleton(getWSRPC, WSRPC.prototype, {
  getWSRPC,
  instantiateWSRPC
}));
