'use strict';

const { Server } = require('hapi');
const { all } = require('./promise');
const { promisify } = require('bluebird');
const readdir = promisify(require('fs').readdir);
const { join, parse } = require('path');
const { partial } = require('lodash');
const assign = require('object-assign');
const deepAssign = require('deep-assign');
const exportSingleton = require('./singleton');
const { initializeDatabase } = require('./db');
const { startDownloadingBlockchain } = require('./blockchain');
const { instantiateGraph } = require('./graph');
const { startLoop } = require('./loop');
const {
  instantiateEthereumClient,
  loadWalletsAsync
} = require('./eth');
const { createServer } = require('http');
const { instantiateWSServer } = require('./ws-server');
const HAPIWebSocket = require('hapi-plugin-websocket');
const {
  host,
  internal,
  port
} = require('../config');
const { resolve } = require('./promise');

let instance;

const routePath = join(__dirname, '..', 'routes');
const joinToRoutePath = partial(join, routePath);
const readRoutes = partial(readdir, routePath);

class IDEXServer extends Server {
  constructor(cfg) {
    super(cfg);
  }
  start() {
    return new Promise((resolve, reject) => {
      super.start((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
  registerPromise(mod) {
    return new Promise((resolve, reject) => {
      this.register(mod, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  bindRoutes() {
    return readRoutes()
      .then((files) => files.filter((v) => parse(v).ext === '.js').map((v) => parse(v).name).forEach((v) => {
        const route = require(joinToRoutePath(v));
        const path = '/' + v;
        this.route(deepAssign({
          path,
          config: {
            plugins: {
              payload: {
                output: 'data',
                parse: true,
                allow: 'application/json'
              }
            }
          }
        }, route));
      }));
  }
}

const initializeServer = () => {
  instance = new IDEXServer({
    connections: {
      routes: {
        files: {
          relativeTo: join(__dirname, '..', 'public')
        }
      }
    }
  });
  instance.connection({
    host,
    port
  });
  instance.register(HAPIWebSocket);
  instantiateEthereumClient();
  instantiateWSServer();
  return initializeDatabase().then(loadWalletsAsync).then(instantiateGraph).then(() => {
    startDownloadingBlockchain()
    return startLoop();
  }).then(() => instance.bindRoutes())
    .then(() => instance.registerPromise(require('vision')))
    .then(() => !internal && instance.registerPromise({
      register: require('hapi-cors'),
      options: {
        origins: ['*']
      }
    }) || resolve())
    .then(() => instance.views({
      engines: {
        html: require('handlebars')
      },
      relativeTo: join(__dirname, '..'),
      path: 'views'
    }))
    .then(() => instance.start());
};

const getServer = () => instance;

assign(module.exports, exportSingleton(getServer, IDEXServer.prototype, {
  initializeServer,
  getServer
}));
