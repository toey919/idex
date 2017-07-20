var Web3 = require('web3');
var spawn = require('child_process').spawn;
var join = require('path').join;
var web3;
var _ = require('lodash');
var BigNumber = require('big-number');
var exchangeContract = require('../contracts/Exchange.sol.json');
var tokenContract = require('../contracts/Token.sol.json');
var util = require('ethereumjs-util');
var ecsign = util.ecsign;
var ecrecover = util.ecrecover;
var fromRpcSig = util.fromRpcSig;
var addHexPrefix = util.addHexPrefix;
var dir = require('../lib/dir');
var promise = require('../lib/promise');
var nextTickPromise = promise.nextTickPromise;
var mapSeries = promise.mapSeries;
var mapValues = _.mapValues;
var bufferToHex = util.bufferToHex;
var isBuffer = _.bindKey(Buffer, 'isBuffer');
var encodeParams = _.bindKey(require('web3/lib/solidity/coder'), 'encodeParams');
var hash = require('../lib/hash');
var hashOrder = hash.hashOrder;
var hashTrade = hash.hashTrade;
var hashWithdrawal = hash.hashWithdrawal;
var saltHash = hash.saltHash;

const all = _.bindKey(Promise, 'all');
const assign = Object.assign;

const sendTransactionNull = (o) => new Promise((resolve, reject) => web3.eth.sendTransaction(o, (err, result) => {
  if (err) return reject(err);
  resolve(result);
}));

const call = (ct, fn, ...args) => new Promise((resolve, reject) => {
  ct[fn].call(...[ ...args, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  }]);
});

const getTransactionReceipt = (hash) => new Promise((resolve, reject) => {
  web3.eth.getTransactionReceipt(hash, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
});

const getAccounts = () => new Promise((resolve, reject) => {
  web3.eth.getAccounts((err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
});

let wallets = [];

const loadWallets = () => dir.readWallets().then((wallets) => mapSeries(wallets, (v) => {
  return nextTickPromise().then(() => fromV3(require(joinToWalletPath(v))));
})).then((_wallets) => {
  return (wallets = _wallets);
});

const getGasLimit = () => new Promise((resolve, reject) => {
  web3.eth.getBlock('pending', (err, result) => {
    if (err) return reject(err);
    resolve(result.gasLimit);
  });
});

const sendTransaction = (ct, fn, ...args) => new Promise((resolve, reject) => ct[fn].sendTransaction(...[ ...args, (err, result) => {
  if (err) return reject(err);
  resolve(result);
}]));

const sendTransactionMax = (ct, fn, ...args) => all([
  getGasLimit(),
  getGasPrice()
]).then(([ gas, gasPrice ]) => {
  const back = args[args.length - 1];
  args.splice(args.length - 1, 1);
  args.push(assign(back, {
    gas,
    gasPrice
  }));
  return sendTransaction(ct, fn, ...args);
});

const getBlockNumber = () => new Promise((resolve, reject) => web3.eth.getBlockNumber((err, result) => {
  if (err) return reject(err);
  resolve(result);
}));

const estimateGas = (ct, fn, ...args) => new Promise((resolve, reject) => ct[fn].estimateGas(...[ ...args, (err, result) => {
  if (err) return reject(err);
  resolve(result);
}]));

const getGasPrice = () => new Promise((resolve, reject) => {
  web3.eth.getGasPrice((err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
});

const sign = (user, hash) => new Promise((resolve, reject) => {
  web3.eth.sign(user, hash, (err, result) => {
    if (err) return reject(err);
    resolve(mapValues(fromRpcSig(result), (v) => isBuffer(v) && addHexPrefix(bufferToHex(v)) || v));
  })
});

const sendTransactionProps = (ct, fn, ...args) => all([
  getBlockNumber(),
  estimateGas(ct, fn, ...args),
  getGasPrice()
]).then(([ number, gas, gasPrice ]) => {
  const props = assign({
    gas,
    gasPrice
  }, args[args.length - 1]);
  args.splice(args.length - 1, 1);
  args.push(props);
  console.log(args[args.length - 1]);
  return sendTransaction(ct, fn, ...args);
});

const deployContract = (code, constructorAbi, ...args) => all([
  getGasPrice(),
  getGasLimit()
]).then(([ gasPrice, gas ]) => {
  const back = args[args.length - 1];
  return sendTransactionNull(assign({
    data: addHexPrefix(code) + encodeParams(constructorAbi, args.slice(0, args.length - 1)),
    gasPrice,
    gas
  }, back));
});
  
class TestRPC {
  static create() {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', [join(__dirname, '..', 'node_modules', '.bin', 'testrpc'), '--debug']);
      proc.stdout.setEncoding('utf8');
      proc.stderr.setEncoding('utf8');
      proc.stdout.on('data', (data) => {
        console.log(data);
        if (/Listening/.test(data)) return resolve(new TestRPC(proc));
      });
      proc.stderr.on('data', (data) => {
        console.log(data);
      });
    });
  }
  setProc(proc) {
    this._proc = proc;
  }
  constructor(proc) {
    this.setProc(proc);
  }
  getProc() {
    return this._proc;
  }
  kill() {
    return this.getProc().kill('SIGKILL');
  }
}

describe('idex v1', function () {
  it('should process an order, trade, and withdrawal', function (done) {
    this.timeout(50000);
    let testrpc;
    let exchange;
    let rep;
    let orderHash;
    let orderSig;
    let tradeSig;
    TestRPC.create().then((_testrpc) => {
      testrpc = _testrpc;
      web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      return getAccounts().then((accounts) => {
        return all([
          deployContract(exchangeContract.bytecode, ['address'], accounts[0], { from: accounts[0] }),
          deployContract(tokenContract.binary, ['uint256', 'string', 'uint8', 'string'], '100000', 'Plutons', '2', 'REP', { from: accounts[0] })
        ]).then(([ exchangeTx, tokenTx ]) => {
          return all([
            getTransactionReceipt(exchangeTx),
            getTransactionReceipt(tokenTx)
          ]);
        }).then(([ exchangeReceipt, tokenReceipt ]) => {
          exchange = web3.eth.contract(JSON.parse(exchangeContract.interface)).at(exchangeReceipt.contractAddress);
          exchange.allEvents((err, result) => console.log(result));
          rep = web3.eth.contract(tokenContract.abi).at(tokenReceipt.contractAddress);
          console.log('sending ether');
          return sendTransaction(exchange, 'deposit', { from: accounts[0], value: '2000' });
        }).then(() => {
          return Promise.resolve();
  /*all([
            sendTransactionProps(exchange, 'deposit', { from: accounts[0], value: '1000' }),
            sendTransactionProps(exchange, 'deposit', { from: accounts[0], value: '1000' })
          ]); */
        }).then(() => {
          console.log('approving token');
          return sendTransaction(rep, 'approve', exchange.address, '1000', { from: accounts[0] });
        }).then(() => {
          console.log('depositing token');
          console.log(rep.address);
          return sendTransaction(exchange, 'depositToken', rep.address, '1000', { from: accounts[0] });
        }).then(() => {
          console.log('logging balances');
          return all([
            call(exchange, 'tokens', rep.address, accounts[0]),
            call(exchange, 'tokens', '0x' + Array(41).join('0'), accounts[0])
          ]);
        }).then(console.log).then(() => {
          orderHash = hashOrder(exchange.address, rep.address, '500', '0x' + Array(41).join('0'), '500', 10000, 1, accounts[0]);
          const salted = saltHash(orderHash);
          return sign(accounts[0], orderHash);
        }).then((_orderSig) => {
          orderSig = _orderSig;
          return sendTransactionMax(exchange, 'setAdmin', accounts[0], true, { from: accounts[0] });
        }).then(() => {
          console.log('sending order');
          return sendTransactionMax(exchange, 'order', rep.address, '500', '0x' + Array(41).join('0'), '500', 10000, 1, accounts[0], orderSig.v, orderSig.r, orderSig.s, { from: accounts[0] });
        }).then(() => {
          tradeHash = hashTrade(orderHash, '500', accounts[0], 1);
          const salted = saltHash(tradeHash);
          return sign(accounts[0], tradeHash);
        }).then((_tradeSig) => {
          tradeSig = _tradeSig;
          return all([
            call(exchange, 'orderBook', orderHash),
            call(exchange, 'tokens', rep.address, accounts[0]),
            call(exchange, 'tokens', '0x' + Array(41).join('0'), accounts[0])
          ]);
        }).then((result) => {
          console.log(result);
          console.log('sending trade');
          return sendTransactionMax(exchange, 'trade', orderHash, accounts[0], 1, tradeSig.v, tradeSig.r, tradeSig.s, '500', 0, 0, { from: accounts[0] });
        }).then(() => {
          const hash = hashWithdrawal(exchange.address, '0x' + Array(41).join('0'), '1', accounts[0], 1);
          return sign(accounts[0], hash);
        }).then((withdrawalSig) => {
          return sendTransactionMax(exchange, 'adminWithdraw', '0x' + Array(41).join('0'), '1', accounts[0], 1, withdrawalSig.v, withdrawalSig.r, withdrawalSig.s, { from: accounts[0] });
        });
      }).then((result) => {
        console.log(result);
        setTimeout(() => {
          testrpc.kill();
          done();
        }, 5000);
      });
    }).catch((err) => {
      console.log(err.stack);
      testrpc.kill();
    });
  });
});
