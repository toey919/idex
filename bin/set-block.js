'use strict';

const { setCurrentBlock } = require('../lib/core');
const { initializeDatabase } = require('../lib/db');

initializeDatabase().then(() => {
  return setCurrentBlock(process.argv[2]);
});
