'use strict'; 

const {
  stringify,
  parse
} = require('./json');
const {
  APIError,
  serializableFromError
} = require('./error');
const { nextTick } = process;
const { isArray } = Array;

class WSClient {
  constructor(ws, server) {
    nextTick(() => {
      ws.removeEventListener('message');
      ws.addEventListener('message', ({ data }) => this.handleMessage(data));
    });
    this._setServer(server);
    this._setSocket(ws);
    this._addresses = [];
  }
  handleMessage(m) {
    try {
      this._getServer().handleMessage(this, parse(m));
    } catch (e) {
      this.send(serializableFromError(APIError(1, e.message)));
    }
  }
  getAddresses() {
    return this._addresses;
  }
  subscribeEthereumAddress(address) {
    if (isArray(address)) return address.forEach((v) => this.getAddresses().push(v));
    this.getAddresses().push(address);
  }
  unsubscribeEthereumAddress(address) {
    if (isArray(address)) return address.forEach((v) => {
      const i = this.getAddresses().findIndex((u) => v.toLowerCase() === u.toLowerCase());
      if (~i) this.getAddresses().splice(i, 1);
    });
    const i = this.getAddresses().findIndex((u) => v.toLowerCase() === u.toLowerCase())
    this.getAddresses().splice(i, 1);
  }
  _setServer(server) {
    this._server = server;
  }
  _setSocket(ws) {
    this._ws = ws;
  }
  _getServer() {
    return this._server;
  }
  getSocket() {
    return this._ws;
  }
  send(payload) {
    this.getSocket().send(stringify(payload));
    return this;
  }
}

const createClient = (...args) => new WSClient(...args);

module.exports = {
  WSClient,
  createClient
};
