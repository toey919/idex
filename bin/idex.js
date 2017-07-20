#!/usr/bin/env node

'use strict';

const { initializeServer } = require('../lib/server');
const reapel = require('reapel');
const { readdir } = require('../lib/fs');
const { parse, join } = require('path');
const {
  camelCase,
  partial,
  property
} = require('lodash');
const libPath = join(__dirname, '..', 'lib');
const joinToLibPath = partial(join, libPath);
const readLibs = partial(readdir, libPath);
const repl = require('repl');

initializeServer().catch((err) => console.log(err.stack));

readLibs().then((files) => files.map(parse).filter((v) => v.ext === '.js').map(property('name')))
  .then((libs) => libs.reduce((r, v) => {
    r[camelCase(v)] = require(joinToLibPath(v));
    return r;
  }, {}))
  .then((context) => {
    const r = repl.start('> ');
    Object.assign(r.context, context);
  });
