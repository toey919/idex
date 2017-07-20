'use strict';

const BigNumber = require('big-number');
const { ecrecover } = require('ethereumjs-util');
const { validateSignature } = require('./signature');
const { TradeError } = require('./error');
const {
  saltedHashTrade,
  saltedHashOrder,
  saltHash,
  hashWithdrawal,
  hashCancel,
  hashOrder,
  hashTrade
} = require('./hash');
const {
  all,
  mapSeries
} = require('./promise');
const unitMap = require('./unit-map');
const {
  insertTrade,
  insertOrder,
  insertWithdrawal,
  getNodes,
  sortNodes
} = require('./graph');
const {
  getModel,
  transaction,
  plainObject,
  toPlain
} = require('./db');
const {
  pushCancel,
  pushBalanceSheet,
  broadcastToAddress,
  broadcast
} = require('./ws-server');
const mathjs = require('mathjs');
const escapeRegExp = require('escape-regexp');
const {
  method,
  uniq,
  concat
} = require('lodash');
const eth = require('./eth');
const {
  assign,
  keys
} = Object;
const {
  front,
  back
} = require('./util/ary');

const getCurrentOrDefaultGasPrice = () => getModel('Config').findOrCreate({
  where: {
    key: 'gasPrice'
  },
  defaults: {
    value: 'current'
  }
}).then(([ model ]) => model);

const getCurrentOrDefaultBlock = () => getModel('Config').findOrCreate({
  where: {
    key: 'block'
  },
  defaults: {
    value: '0'
  }
}).then(([ model ]) => model);

const getCurrentOrDefaultGasLimit = () => getModel('Config').findOrCreate({
  where: {
    key: 'gas'
  },
  defaults: {
    value: 'max'
  }
}).then(([ model ]) => model);

const getCurrentBlock = () => getCurrentOrDefaultBlock().then((model) => model.get('value')).then(Number);

const setCurrentBlock = (n) => getCurrentOrDefaultBlock().then((model) => model.update({ value: String(n) })).then((model) => model.get('value')).then(Number);

const getGasLimit = () => getCurrentOrDefaultGasLimit().then((model) => model.get('value')).then((gasLimit) => {
  if (/max/.test(gasLimit)) return getGasLimit().then((ethGasLimit) => gasLimit.replace(/max/g, ' ' + ethGasLimit + ' '));
  else return gasLimit;
}).then(mathjs.eval);

const setGasLimit = (value) => getCurrentOrDefaultGasLimit().then((model) => model.update({ value })).then((model) => model.get('value'));

const setGasPrice = (value) => getCurrentOrDefaultGasPrice().then((model) => model.update({ value })).then((model) => model.get('value'));

const replaceDenominations = (str) => keys(unitMap)
  .reduce((r, v) => r.replace(RegExp(escapeRegExp(v), 'g'), ' * ' + unitMap[v]), str);

const getGasPrice = () => getCurrentOrDefaultGasPrice().then((model) => model.get('value')).then((price) => {
  if (/current/.test(price)) return eth.getGasPrice().then((current) => price.replace(/current/g, ' ' + String(current) + ' '));
  else return price;
}).then(replaceDenominations).then(mathjs.eval);

const getBalanceSheet = (user) => getModel('Balance').findAll({
  where: {
    address: user
  }
}).then((records) => records.reduce((r, v) => {
  r[v.get('token')] = v.get('balance');
  return r;
}, {}));

const getContractAddress = () => getModel('Config').findOrCreate({
  where: {
    key: 'exchange'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ model ]) => model).then((model) => model.get('value'));

const setFeeAccount = (addr) => getModel('Config').findOrCreate({
  where: {
    key: 'feeAccount'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ acct ]) => acct.update({ value: addr }).then((acct) => acct.get('value')));

const getFeeAccount = () => getModel('Config').findOrCreate({
  where: {
    key: 'feeAccount'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ acct ]) => acct.get('value'));

const setFeeMake = (amt) => getModel('Config').findOrCreate({
  where: {
    key: 'feeMake'
  },
  defaults: {
    value: '0'
  }
}).then(([ feeMake ]) => feeMake.update({ value: amt })).then((fee) => fee.get('value'));

const setFeeTake = (amt) => getModel('Config').findOrCreate({
  where: {
    key: 'feeTake'
  },
  defaults: {
    value: '0'
  }
}).then(([ feeTake ]) => feeTake.update({ value: amt })).then((fee) => fee.get('value'));

const getFeeMake = (amt) => getModel('Config').findOrCreate({
  where: {
    key: 'feeMake'
  },
  defaults: {
    value: '0'
  }
}).then(([ feeMake ]) => feeMake.get('value'));

const getFeeTake = (amt) => getModel('Config').findOrCreate({
  where: {
    key: 'feeTake'
  },
  defaults: {
    value: '0'
  }
}).then(([ feeTake ]) => feeTake.get('value'));

const setContractAddress = (addr) => getModel('Config').findOrCreate({
  where: {
    key: 'exchange'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ model ]) => model.update({
  value: addr
})).then((model) => model.get('value'));

const setBalance = (user, token, balance, transaction) => getModel('Balance').findOrCreate({
  where: {
    address: user,
    token
  },
  defaults: {
    balance: '0'
  },
  transaction
}).then(([ model ]) => model.update({
  balance: String(balance)
}));


const getBalance = (user, token, transaction) => getModel('Balance').findOrCreate({
  where: {
    address: user,
    token
  },
  defaults: {
    balance: '0'
  },
  transaction
}).then(([ model ]) => model.get('balance'));

const increaseBalance = (user, token, amt, transaction) => getBalance(user, token, transaction)
  .then(BigNumber)
  .then((balance) => balance.add(amt))
  .then(String)
  .then((newBalance) => setBalance(user, token, newBalance, transaction));

const subtractBalance = (user, token, amt, transaction) => getBalance(user, token, transaction)
  .then(BigNumber)
  .then((balance) => balance.minus(amt))
  .then(String)
  .then((newBalance) => setBalance(user, token, newBalance, transaction));

const getDVIPAddress = () => getModel('Config').findOrCreate({
  where: {
    key: 'dvip'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ dvip ]) => dvip.get('value'));

const setDVIPAddress = (addr) => getModel('Config').findOrCreate({
  where: {
    key: 'dvip'
  },
  defaults: {
    value: '0x0'
  }
}).then(([ dvip ]) => dvip.update({ value: addr })).then(() => addr);

const validateBalanceOver = (user, token, balance, transaction) => getBalance(user, token, transaction).then(BigNumber).then((v) => {
  console.log(String(v));
  return ln(v.gte(ln(balance)));
});

const getAmountSellAdjusted = (amountBuy, amountSell, amount) => String(BigNumber(amountSell).multiply(amount).divide(amountBuy));

const validateTrade = (payload, offset, ary) => {
  const {
    tokenBuy,
    amountBuy,
    tokenSell,
    amountSell,
    hash,
    amount,
    buy,
    sell
  } = payload;
  return all([
    validateBalanceOver(buy, tokenBuy, amount, t),
    validateBalanceOver(sell, tokenSell, getAmountSellAdjusted(amountBuy, amountSell, amount), t),
    validateNonce(buy, payload.nonce, offset)
  ]).then(([ buyValid, sellValid ]) => {
    if (!buyValid) throw TradeError(3);
    if (!sellValid) throw TradeError(4);
    return getModel('Order').findOne({
      where: {
        hash
      }
    })
  }).then((order) => {
    const filledAfter = BigNumber(order.get('filled') || 0).add(amount);
    if (filledAfter.gt(order.get('amountBuy'))) throw TradeError(9);
  });
};
  
const applyFee = (amount, fee) => String(BigNumber(amount).multiply(fee).divide(unitMap.ether));

const applyFeeRemainder = (amount, fee) => String(BigNumber(amount).minus(applyFee(amount, fee)));

const ln = (v) => { console.log(v); return v; };

const performWithdrawal = ({
  user,
  amount,
  token,
  nonce,
  v,
  r,
  s
}) => getContractAddress().then((address) => {
  const hash = hashWithdrawal(address, token, amount, user, nonce);
  if (!validateSignature(user, saltHash(hash), v, r, s)) throw TradeError(12);
  return all([
    validateBalanceOver(user, token, amount),
    validateNonce(user, nonce)
  ]);
}).then(([ balanceValid, isValid ]) => {
  if (!isValid) throw TradeError(7);
  if (!balanceValid) throw TradeError(13);
  return transaction((t) => subtractBalance(user, token, amount, t)).catch(() => performWithdrawal({
    user,
    amount,
    token,
    nonce,
    v,
    r,
    s
  }));
}).then(() => ln(insertWithdrawal({
  user,
  amount,
  token,
  nonce,
  v,
  r,
  s,
}))).then((model) => pushBalanceSheet(model.get('user')))
  .then(() => setNonce(user, Number(nonce) + 1));


const performTrade = (ary) => {
  let orders;
  let i = -1;
  return getContractAddress().then((address) => mapSeries(ary, ({
    orderHash,
    user,
    nonce,
    v,
    r,
    s,
    amount
  }) => getModel('Order').findOne({
    where: {
      hash: orderHash
    }
  }).then((order) => {
    if (!order) throw TradeError(1);
    ++i;
    const hash = saltedHashTrade(orderHash, amount, user, payload.nonce);
    console.log(hash);
    console.log(payload);
    if (!validateSignature(user, hash, v, r, s)) throw TradeError(2);
    const {
      tokenBuy,
      amountBuy,
      tokenSell,
      amountSell,
      expires,
      nonce,
      user: sell
    } = order.get(plainObject);
    return validateTrade({
      tokenBuy,
      amountBuy,
      sell,
      hash: orderHash,
      buy: user,
      tokenSell,
      amountSell,
      amount,
      nonce: payload.nonce
    }, i).then(() => ({
      order,
      amount
    }));
  }).then((_orders) => {
    orders = _orders;
    return all([
      getFeeAccount(),
      getFeeMake(),
      getFeeTake()
    ]).then(([ feeAccount, feeMake, feeTake ]) => transaction((t) => mapSeries(ary, ({
      orderHash,
      user,
      nonce,
      v,
      r,
      s,
      amount
    }) => {
      return getModel('Order').findOne({
        where: {
          hash: orderHash
        }
      }).then((order) => {
        const {
          tokenBuy,
          amountBuy,
          tokenSell,
          amountSell,
          expires,
          nonce: orderNonce,
          user: sell
        } = order.get(plainObject);
        return mapSeries([
          () => subtractBalance(user, tokenBuy, amount, t),
          () => subtractBalance(sell, tokenSell, amountSellAdjusted, t),
          () => increaseBalance(feeAccount, tokenBuy, applyFee(amount, feeMake, t)),
          () => increaseBalance(sell, tokenBuy, applyFeeRemainder(amount, feeMake), t),
          () => increaseBalance(feeAccount, tokenSell, applyFee(amountSellAdjusted, feeTake), t),
          () => increaseBalance(user, tokenSell, applyFeeRemainder(amountSellAdjusted, feeTake), t)
        ], (v) => v()).then(() => insertTrade({
          tokenBuy,
          amountBuy,
          tokenSell,
          amountSell,
          feeMake,
          feeTake,
          buy: user,
          v,
          r,
          s,
          user,
          sell,
          hash: orderHash,
          nonce,
          amount,
          time: new Date()
        }, t).then((model) => {
          broadcast({
            method: 'notifyTradeInserted',
            payload: model.get({ plain: true })
          });
        }).then(() => {
          const filledAfter = BigNumber(order.get('filled') || 0).add(amount);
          return order.update({
            filled: String(filledAfter)
          }, { transaction: t });
        }).then(() => {
          return [ user, sell ];
        }));
      });
    })));
  })))
      .then((addresses) => mapSeries(uniq(addresses.reduce(concat, [])), (v) => pushBalanceSheet(v)))
      .then(() => setNonce(front(ary).user, Number(back(ary).nonce) + 1))
      .then(() => ({}));
};

const performOrder = ({
  tokenBuy,
  amountBuy,
  tokenSell,
  amountSell,
  expires,
  nonce,
  user,
  v,
  r,
  s
}) => getContractAddress().then((address) => {
  const hash = hashOrder(address, tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce, user);
  const salted = saltHash(hash);
  if (!validateSignature(user, salted, v, r, s)) throw TradeError(5);
  return validateNonce(user, nonce).then(() => insertOrder({
    tokenBuy,
    amountBuy,
    tokenSell,
    amountSell,
    expires,
    nonce,
    user,
    v,
    r,
    s,
    hash
  }).then((order) => broadcast({
    method: 'notifyOrderInserted',
    payload: order.get({ plain: true })
  }))).then(() => setNonce(user, Number(nonce) + 1));
});

const validateCancel = ({
  orderHash,
  nonce,
  user,
  orderUser,
  v,
  r,
  s
}) => {
  if (orderUser.toLowerCase() !== user.toLowerCase()) throw TradeError(11);
  if (!validateSignature(user, saltHash(hashCancel(orderHash, nonce)), v, r, s)) throw TradeError(8);
  return true;
};

const performCancel = ({
  orderHash,
  nonce,
  user,
  v,
  r,
  s
}) => getModel('Order').findOne({
  where: {
    hash: orderHash
  }
}).then((order) => {
  if (!order) throw TradeError(1);
  const orderUser = order.get('user');
  validateCancel({
    orderHash,
    nonce,
    orderUser,
    user,
    v,
    r,
    s
  });
  return all([
    order.update({
      cancelled: new Date()
    }),
    getModel('Cancel').create({
      hash: orderHash,
      nonce,
      user,
      v,
      r,
      s
    })
  ])
}).then(([ order, cancel ]) => {
  pushCancel(cancel.get(plainObject));
  return getModel('Node').findOne({
    where: {
      targetId: order.get('id'),
      type: 'order'
    }
  });
}).then((node) => node.update({
  cancelled: new Date()
})).then((node) => {
  const id = node.get('id');
  getNodes().forEach((v) => {
    if (v.get('id') === id) v.detach();
  });
  sortNodes();
  return setNonce(user, Number(nonce) + 1);
});

const getDefaultAccount = (address) => {
  address = address.toLowerCase();
  return getModel('Account').findOrCreate({
    where: {
      address
    }
  }).then(([ account ]) => account);
};

const setNonce = (address, nonce) => getDefaultAccount(address).then((account) => account.update({
  nonce
})).then(() => broadcastToAddress(address, {
  method: 'pushNonce',
  payload: Number(nonce) + 1
})).then(() => ({}));

const validateNonce = (user, n, offset = 0) => getDefaultAccount(user).then((account) => {
  if (BigNumber(account.get('nonce')).add(offset).gte(n)) throw TradeError(10);
  return true;
});

assign(module.exports, {
  getContractAddress,
  setContractAddress,
  setBalance,
  getBalance,
  increaseBalance,
  subtractBalance,
  setFeeMake,
  setFeeTake,
  getFeeMake,
  getFeeTake,
  setFeeAccount,
  getFeeAccount,
  getDVIPAddress,
  setDVIPAddress,
  applyFee,
  applyFeeRemainder,
  performTrade,
  performOrder,
  performCancel,
  performWithdrawal,
  setGasLimit,
  getGasLimit,
  setGasPrice,
  getGasPrice,
  getCurrentBlock,
  setCurrentBlock,
  getCurrentOrDefaultGasLimit,
  getCurrentOrDefaultGasPrice,
  setNonce,
  getBalanceSheet
});
