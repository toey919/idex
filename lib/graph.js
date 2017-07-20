'use strict';

const {
  getModels,
  transaction,
  toPlain,
  plainObject
} = require('./db');
const { all } = require('./promise');
const {
  difference,
  constant
} = require('lodash');
const exportSingleton = require('./singleton');
const { isArray } = Array;
const { assign } = Object;

const _nodeKeys = [
  'targetId',
  'id',
  'type',
  'complete',
  'transactionHash',
  'dispatched',
  'sender'
];
const ROOT = Symbol('graphroot');
class Node {
  isDispatched() {
    return this.get('dispatched');
  }
  isComplete() {
    return this.get('complete');
  }
  getSender() {
    return this.get('sender');
  }
  getTransactionHash() {
    return this.get('transactionHash');
  }
  updateModel(data) {
    return transaction((t) => {
      return this._getModel().update(data, { transaction: t }).then((m) => this.setModel(m));
    });
  }
  updateNode(data) {
    return transaction((t) => this._getNodeModel().update(data, { transaction: t })).then((n) => this.setNode(n));
  }
  setGraph(g) {
    this._graph = g;
    return this;
  }
  getGraph() {
    return this._graph;
  }
  detach() {
    const nodes = this.getGraph().getNodes();
    nodes.splice(nodes.findIndex((v) => v === this), 1);
    this.getGraph().sortNodes();
    return this;
  }
  static create(cfg, _t) {
    const {
      type,
      model
    } = cfg;
    const models = getModels();
    const { Node: NodeModel } = models;
    let modelInstance;
    return (_t && ((fn) => fn(_t)) || transaction)((t) => models.getByName(type)
      .create(model, { transaction: t })
      .then((_modelInstance) => {
        modelInstance = _modelInstance;
        return NodeModel.create({
          type,
          targetId: modelInstance.get('id')
        }, { transaction: t });
      }).then((node) => new Node(node, modelInstance)));
  }
  static findById(id) {
    const models = getModels();
    const { Node } = models;
    let node;
    return transaction((t) => Node.findOne({
      where: {
        id
      }
    }, { transaction: t }).then((_node) => {
      node = _node;
      if (!node) throw Error('no node found by id ' + id);
      const id = node.get('targetId');
      const type = node.get('type');
      return models.getByName(type)
        .findOne({
          where: {
            id
          }
        }, { transaction: t })
    }).then((model) => new Node(node, model)));
  }
  fetchModel(transaction) {
    const node = this._node;
    const models = getModels();
    if (!node) throw Error('no node found by id ' + id);
    const id = node.get('targetId');
    const type = node.get('type');
    return models.getByName(type)
        .findOne({
          where: {
            id
          }
        }, transaction && { transaction })
        .then((model) => this.setModel(model));
  }
  setModel(m) {
    this._model = m;
    return this;
  }
  setNode(n) {
    this._node = n;
    return this;
  }
  static findAll() { 
    const { Node: NodeModel } = getModels();
    return transaction((t) => NodeModel.findAll({
      where: {
        complete: null
      }
    }).then((nodes) => nodes.map((v) => new Node(v))).then((nodes) => all(nodes.map((v) => v.fetchModel(t)))));
  }
  constructor(node, model) {
    this._node = node;
    this._model = model;
    this._linkedTo = [];
  }
  getModel() {
    return this._getModel();
  }
  _getNodeModel() {
    return this._node;
  }
  _getModel() {
    return this._model;
  }
  getType() {
    return this.get('type');
  }
  get(prop) {
    if (Node._nodeKeys.includes(prop)) {
      return this._getNodeModel().get(prop);
    }
    return this._getModel().get(prop);
  }
  linkAll(n) {
    this._linkedTo = this._linkedTo.concat(n);
    return this;
  }
  hasNoDependencies() {
    return !this.getLinks().length;
  }
  link(n) {
    this.getLinks().push(n);
    return this;
  }
  getLinks() {
    return this._linkedTo;
  }
  unlink(n) {
    this.getLinks().splice(this.getLinks().indexOf(n), 1);
    return this;
  }
  dropLinks() {
    this._linkedTo = [];
    return this;
  }
}

Node.ROOT = ROOT;
Node._nodeKeys = _nodeKeys;

class Graph {
  constructor(nodes = []) {
    this._root = new Node(Node.ROOT);
    this.attachToRoot(nodes);
  }
  attachToRoot(nodes) {
    if (isArray(nodes)) {
      this.getRoot().linkAll(nodes);
      nodes.forEach((v) => v.setGraph(this));
    } else {
      this.getRoot().link(nodes);
      nodes.setGraph(this);
    }
    return this;
  }
  insertTrade(model, t) {
    let node;
    return Node.create({
      model,
      type: 'trade'
    }, t).then((n) => {
      node = n;
      return this.attachToRoot(n)
    }).then(() => this.sortNodes()).then(() => node);
  }
  insertOrder(model, t) {
    let node;
    return Node.create({
      model,
      type: 'order'
    }, t).then((n) => {
      node = n;
      return this.attachToRoot(n);
    }).then(() => this.sortNodes())
      .then(() => node);
  }
  insertWithdrawal(model, t) {
    let node;
    return Node.create({
      model,
      type: 'withdrawal'
    }).then((n) => {
      node = n;
      return node;
    }).then((n) => this.attachToRoot(n))
    .then(() => this.sortNodes())
    .then(() => node);
  }
  _makeSerializableSubgraph(graph) {
    return graph.map((v) => {
      return assign({}, v._getModel().get(plainObject), v._getNodeModel().get(plainObject), {
        children: this._makeSerializableSubgraph(v.getLinks())
      });
    });
  }
  getSerializableNodes() {
    return this._makeSerializableSubgraph(this.getNodes());
  }
  getNodes() {
    return this.getRoot().getLinks();
  }
  getRoot() { return this._root; }
  static getGraph() {
    const graph = new Graph();
    return Node.findAll().then((nodes) => {
      graph.attachToRoot(nodes);
    }).then(() => graph.sortNodes());
  }
  sortNodes() {
    const nodes = this.getRoot().getLinks().slice();
    nodes.forEach((v, vi) => {
      v.dropLinks();
      v.linkAll(nodes.filter((u, ui) => {
        return ui < vi;
      }).filter((u) => {
        switch (u.getType()) {
          case 'order':
            switch (v.getType()) {
              case 'order':
              case 'trade':
                return v.get('hash') === u.get('hash');
            }
            break;
          case 'trade':
            switch (v.getType()) {
              case 'order':
                return u.get('hash') === v.get('hash');
              case 'trade':
                return (u.get('buy').toLowerCase() === v.get('sell').toLowerCase() || u.get('sell').toLowerCase() === v.get('buy').toLowerCase() || u.get('buy').toLowerCase() === v.get('buy').toLowerCase() || u.get('sell').toLowerCase() === v.get('sell').toLowerCase()) && (u.get('tokenSell').toLowerCase() === v.get('tokenSell').toLowerCase() || u.get('tokenBuy').toLowerCase() === v.get('tokenBuy').toLowerCase() || u.get('tokenBuy').toLowerCase() === v.get('tokenSell').toLowerCase() || u.get('tokenSell').toLowerCase() === v.get('tokenBuy').toLowerCase());
              case 'withdrawal':
                return u.get('tokenSell') === v.get('token');
            }
            break;
          case 'withdrawal':
            switch (v.getType()) {      
              case 'trade':
                return u.get('token') === v.get('tokenSell');
              case 'withdrawal':
                return u.get('token') === v.get('token');
            }
            break;
        }
      }));
    });
    return this;
  }
}

let instance;

const getGraphInstance = () => instance;
const instantiateGraph = () => Graph.getGraph().then((g) => (instance = g));

assign(module.exports, exportSingleton(getGraphInstance, Graph.prototype, {
  Node,
  Graph,
  instantiateGraph,
  getGraphInstance
}));
