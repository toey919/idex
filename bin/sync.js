'use strict';

const { initializeDatabase, sync } = require('../lib/db');

initializeDatabase().then(() => sync({ force: true }));
