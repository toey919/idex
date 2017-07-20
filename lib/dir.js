'use strict';

const { partial } = require('lodash');
const { join } = require('path');

const joinToHome = partial(join, process.env.HOME);
const v1Path = join(process.env.HOME, '.v1');
const joinToV1Dir = partial(join, v1Path);
const walletPath = join(v1Path, 'wallets');
const { readdir, mkdirp } = require('./fs');
const joinToWalletPath = partial(join, walletPath);
const readWallets = partial(readdir, walletPath);
const mkWalletPath = partial(mkdirp, walletPath);
const { assign } = Object;

assign(module.exports, {
  joinToHome,
  joinToV1Dir,
  joinToWalletPath,
  walletPath,
  v1Path,
  readWallets,
  mkWalletPath
});
