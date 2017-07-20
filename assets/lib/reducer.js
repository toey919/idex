"use strict";

import { constant } from 'change-case';
import clone from 'clone';
import forOwn from 'lodash/forOwn';

const { assign } = Object;

const plugins = {
  loader: (arg, reducer, state, action) => {
    if (arg) {
      switch (action.type) {
        case 'LOAD_' + constant(reducer.key):
          return action.payload; 
      }
    }
  },
  reloadable: (arg, reducer, state, action) => {
    if (arg) {
      switch (action.type) {
        case 'RELOAD_DATA':
          return reducer.defaultValue;
      }
    }
  },
  updateBy: (arg, reducer, state, action) => {
    if (typeof arg === 'string') {
      switch (action.type) {
        case 'UPDATE_' + constant(reducer.key):
          state = clone(state);
          assign(state.find((v) => {
            return action[arg] === v[arg];
          }) || {}, action.payload);
          return state;
      }
    }
  },
  toggle: (arg, reducer, state, action) => {
    if (arg !== void 0) {
      switch (action.type) {
        case 'TOGGLE_' + constant(reducer.key):
          return Boolean(state ^ 1);
      }
    }
  }
};

      
function Reducer(cfg) {
  if (!(this instanceof Reducer)) return new Reducer(cfg);
  assign(this, cfg);
}

Reducer.prototype = {
  getReducer() {
    return (state, action) => {
      if (state === void 0) state = clone(this.defaultValue);
      forOwn(this.plugins, (value, key, obj) => {
        if (typeof (this.inject || {})[key] !== 'undefined') {
          let newState = value(this.inject[key], this, state, action);
          if (typeof newState !== 'undefined') state = newState;
        }
      });
      return (this.reducer || ((state, action) => { return state; }))(state, action);
    };
  }
};

Reducer.prototype.plugins = plugins;

export default Reducer;
