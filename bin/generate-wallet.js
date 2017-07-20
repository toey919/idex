#!/usr/bin/env node

'use strict';

const { walletSalt } = require('../config');
const { generate } = require('ethereumjs-wallet');
const { writeFile } = require('../lib/fs');
const { mkWalletPath } = require('../lib/dir');
const {
  partial,
  range,
  bindKey
} = require('lodash');
const { join } = require('path');
const yargs = require('yargs');
const Promise = require('bluebird');
const mapSeries = bindKey(Promise, 'mapSeries');
const chalk = require('chalk');
const log = bindKey(console, 'log');

const { argv } = yargs.alias('n', 'number').alias('p', 'prefix');

let { prefix, number } = argv;

if (!prefix) prefix = 'wallet';
number = +number;

const { joinToWalletPath } = require('../lib/dir');

log('this is ' + chalk.yellow('generate-wallet'));

mkWalletPath().then(() => mapSeries(range(number), (v) => {
  const key = generate();
  const walletName = prefix + '-' + v + '.json';
  log('generating ' + chalk.magenta(walletName));
  const v3 = key.toV3(walletSalt);
  return writeFile(joinToWalletPath(walletName), JSON.stringify(v3, null, 1));
}));
