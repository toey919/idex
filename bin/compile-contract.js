#!/usr/bin/env node

'use strict';

const solc = require('solc');
const {
  join,
  parse
} = require('path');
const {
  readFile,
  writeFile
} = require('../lib/fs');
const promisify = require('es6-promisify');
const recursiveReaddir = promisify(require('recursive-readdir'));
const { all } = require('../lib/promise');
const {
  partial,
  zipObject
} = require('lodash');
const escapeRegExp = require('escape-regexp');

const contractDir = join(__dirname, '..', 'contracts');

const allAfter = (base, str) => {
  const [ _, retval ] = RegExp(escapeRegExp(base) + '(.*$)').exec(str);
  return retval;
};

const joinToContractDir = partial(join, contractDir);

let files;

recursiveReaddir(join(__dirname, '..', 'contracts')).then((files) => files.filter((v) => parse(v).ext === '.sol').map((v) => allAfter(contractDir + '/', v))).then((_files) => {
  files = _files;
  return all(files.map((v) => readFile(joinToContractDir(v), 'utf8')));
}).then((contracts) => zipObject(files, contracts)).then((o) => {
  return solc.compile({ sources: o }, 1);
}).then((v) => {
  console.log(v);
  return writeFile(joinToContractDir('Exchange.sol.json'), JSON.stringify({
    abi: JSON.parse(v.contracts['Exchange.sol:Exchange'].interface),
    binary: v.contracts['Exchange.sol:Exchange'].bytecode
  }, null, 1));
});
