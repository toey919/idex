'use strict';

const { method } = require('lodash');
const exportSingleton = require('./singleton');
const { createClient } = require('./ws-client');
const { resolve } = require('./promise');
const {
  APIError,
  serializableFromError
} = require('./error');
const {
  digest,
  instantiateWSRPC
} = require('./rpc');
const core = require('./core');
const { assign } = Object;

class WSServer {
  constructor() {
    this._clients = [];
  }
  addSocket(ws) {
    this.getClients().push(createClient(ws, this));
    return this;
  }
  handleMessage(client, message) {
    const { id } = message;
    return resolve().then(() => digest(message, client)).then((response) => {
      const { method } = response;
      if (!method) return client.send(assign({ id, method: 'returnValue', payload: response }));
      return client.send(assign({ id }, response));
    }).catch((err) => {
      return client.send({ id, method: 'returnValue', payload: serializableFromError(err) });
    });
  }
  getClients() {
    return this._clients;
  }
  removeSocket(ws) {
    const i = this.getClients().findIndex((v) => ws === v.getSocket());
    if (~i) this.getClients().splice(i, 1);
    return Boolean(~i);
  }
  broadcastToAddress(address, data) {
    this.getClients().filter((v) => v.getAddresses().find((v) => v.toLowerCase() === address.toLowerCase())).forEach(method('send', data));
    return this;
  }
  broadcast(data) {
    this.getClients().forEach(method('send', data));
    return this;
  }
  pushBalanceSheet(address) {
    return core.getBalanceSheet(address).then((payload) => this.broadcastToAddress(address, {
      method: 'pushBalanceSheet',
      payload
    }));
  }
  pushCancel(payload) {
    return this.broadcast({
      method: 'pushCancel',
      payload
    });
  }
}

let instance;

const getWSServer = () => instance;

const instantiateWSServer = () => {
  instance = new WSServer();
  instantiateWSRPC();
  return resolve(instance);
};

assign(module.exports, exportSingleton(getWSServer, WSServer.prototype, {
  WSServer,
  getWSServer,
  instantiateWSServer
}));
