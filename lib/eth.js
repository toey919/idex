'use strict';

const { getGraph } = require('./db')
const { rpc } = require('../config');
const Web3 = require('web3');
const HookedWeb3Provider = require('hooked-web3-provider');
const Transaction = require('ethereumjs-tx');
const { bufferToHex, addHexPrefix } = require('ethereumjs-util');
const dvipContract = require('../contracts/DVIP.sol.json');
const {
  getGraphInstance,
  attachToRoot,
  sortNodes,
  getNodes
} = require('./graph');
const {
  getDVIPAddress
} = require('./core');
const { feeMake, feeTake } = require('../fixtures');
const BigNumber = require('big-number');
const { mkdirp } = require('./fs');
const { join } = require('path');
const {
  partial,
  property,
  bindKey,
  difference
} = require('lodash');
const { walletSalt } = require('../config');
const { readdir } = require('./fs');
const { fromV3 } = require('ethereumjs-wallet');
const { yellow } = require('chalk');
const exchangeContract = require('../contracts/Exchange.sol.json');
const { getModels } = require('./db');
const { mkWalletPath, readWallets } = require('./dir');
const {
  resolve,
  mapSeries,
  nextTickPromise
} = require('./promise');
const { create, assign } = Object;
const exportSingleton = require('./singleton');
const {
  sha3,
  fromDecimal
} = new (require('web3'))();
const coder = require('web3/lib/solidity/coder');
const encodeParams = bindKey(coder, 'encodeParams');
const hashFromAbi = (abi, name) => {
  const entry = abi.find((v) => v.name === name);
  const argString = '(' + entry.inputs.map(({ type }) => type).join(',') + ')';
  return sha3(name + argString).substr(0, 10);
};

const log = bindKey(console, 'log');

const {
  walletPath,
  joinToWalletPath
} = require('./dir');

let wallets = [];
const detachedWeb3 = new Web3();

function PromisifiedEth() {}
assign(PromisifiedEth.prototype, {
  getEth() {
    return this.getWeb3().eth;
  },
  getContract(abi, address) {
    return this.getEth().contract(abi).at(address);
  },
  getMarketContract(address) {
    return this.getContract(exchangeContract.abi, address);
  },
  sendTransaction(contract, fn, ...args) {
    return new Promise((resolve, reject) => {
      contract[fn].sendTransaction(...[ ...args, (err, tx) => {
        if (err) return reject(err);
        resolve(tx);
      }]);
    });
  },
  sendRawTransactionFormat(contract, fn, ...args) {
    let {
      from,
      gasPrice,
      gas: gasLimit
    } = args[args.length - 1];
    args.splice(args.length - 1, 1);
    return this.getTransactionCount(from, 'pending').then((nonce) => {
      gasLimit = fromDecimal(String(BigNumber(gasLimit).add(10000)));
      gasPrice = fromDecimal(gasPrice);
      nonce = fromDecimal(nonce);
      let params = {
        gasLimit,
        from,
        gasPrice
      };
      if (!params.value) params.value = '0x00';
      const ln = (v) => { console.log(v); return v; };
      const data = hashFromAbi(contract.abi, fn) + encodeParams(contract.abi.find(({ name }) => name === fn).inputs.map(({ type }) => type), args);
      const to = contract.address;
      const tx = new Transaction(assign({}, params, {
        to,
        from,
        nonce,
        data
      }));
      tx.sign(getWalletByAddress(from).getPrivateKey());
      return this.sendRawTransaction(bufferToHex(tx.serialize()));
    });
  }
}, [
  'getAccounts',
  'getBalance',
  'getBlock',
  'getBlockNumber',
  'getBlockTransactionCount',
  'getBlockUncleCount',
  'getCode',
  'getCoinbase',
  'getCompilers',
  'getGasPrice',
  'getHashrate',
  'getMining',
  'getProtocolVersion',
  'getStorageAt',
  'getSyncing',
  'getTransaction',
  'getTransactionCount',
  'getTransactionFromBlock',
  'getTransactionReceipt',
  'sendRawTransaction',
  'getUncle',
  'getWork'
].reduce((r, v) => {
  r[v] = function (...args) {
    return new Promise((resolve, reject) => {
      this.getEth()[v](...[ ...args, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }]);
    });
  };
  return r;
}, {}));

const StaticProto = assign(create(PromisifiedEth.prototype), [
  'toHex',
  'toAscii',
  'toUtf8',
  'fromAscii',
  'fromUtf8',
  'toDecimal',
  'fromDecimal',
  'toBigNumber',
  'toWei',
  'fromWei',
  'isAddress',
  'isChecksumAddress',
  'toChecksumAddress',
  'isIBAN',
  'sha3',
  'fromICAP'
].reduce((r, v) => {
  r[v] = detachedWeb3[v];
  return r;
}, {}));

function Web3StaticMethods() {}
Web3StaticMethods.prototype = StaticProto;
Web3StaticMethods.prototype.constructor = Web3StaticMethods;

class EthereumClient extends Web3StaticMethods {
  constructor(_web3, _cfg) {
    super(_web3, _cfg);
    assign(this, {
      _web3,
      _cfg
    });
  }
  getGasLimit() {
    return this.getBlock('latest').then(property('gasLimit'));
  }
  getEth() {
    return this._web3.eth;
  }
  getNextAddress() {
    return difference(getWallets().map((v) => '0x' + v.getAddress().toString('hex')), getNodes().filter((v) => v.isDispatched() && !v.isComplete()).map((v) => v.get('sender').toLowerCase()))[0] || false;
  }
}

let instance;

const instantiateEthereumClient = () => {
  const web3 = new Web3(new HookedWeb3Provider({
    host: rpc,
    transaction_signer: {
      hasAddress: (address, cb) => {
        cb(null, Boolean(wallets.find((v) => address.toLowerCase() === '0x' + v.getAddress().toString('hex').toLowerCase())));
      },
      signTransaction: (params, cb) => {
        const { from } = params;
        const wallet = wallets.find((v) => from.toLowerCase() === '0x' + v.getAddress().toString('hex').toLowerCase());
        const tx = new Transaction(params);
        tx.sign(wallet.getPrivateKey());
        cb(null, tx.serialize());
      }
    }
  }));
  instance = new EthereumClient(web3, {});
  return resolve(instance);
};

const loadWalletsAsync = () => mkWalletPath().then(readWallets)
  .then((wallets) => {
    let i = -1;
    return mapSeries(wallets, (v) => {
      ++i;
      return nextTickPromise().then(() => {
        log('loading wallet ' + yellow(String(i)));
        return fromV3(require(joinToWalletPath(v)), walletSalt);
      });
    });
  })
  .then((_wallets) => (wallets = _wallets));

const loadWallets = () => mkWalletPath()
  .then(readWallets)
  .then((wallets) => wallets.map((v, i) => {
    log('loading wallet ' + yellow(String(i)));
    return fromV3(require(joinToWalletPath(v)), walletSalt);
  }))
  .then((_wallets) => (wallets = _wallets));

const ln = (v) => {
  console.log(v);
  return v;
};

const getWallets = () => wallets;
const getWalletByAddress = (address) => wallets.find((v) => addHexPrefix(bufferToHex(v.getAddress())) === address);

const getEthereum = () => instance;

assign(module.exports, exportSingleton(getEthereum, EthereumClient.prototype, {
  getEthereum,
  EthereumClient,
  instantiateEthereumClient,
  loadWallets,
  loadWalletsAsync,
  getWallets,
  getWalletByAddress
}));
