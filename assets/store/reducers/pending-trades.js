'use strict';

import differenceBy from 'lodash/differenceBy';
const { isArray } = Array;

export default {
  key: 'pendingTrades',
  defaultValue: [],
  inject: {
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'INVALID_TRADES':
        const valid = differenceBy(state, (isArray(action.payload) && action.payload || [action.payload]).map(transactionHash => ({ transactionHash })), 'transactionHash');
        if (valid.length < state.length) return valid;
        return state;
      case 'POLL_UPDATE':
        if (action.payload.pending && action.payload.pending.length) {
          const pending = action.payload.pending.filter(v => v.type === 'trade');
          if (pending.length) state = state.concat(pending);
        }
        (action.payload.trades || []).forEach(v => {
          const i = state.findIndex(u => v.transactionHash === u.transactionHash);
          if (~i) state = state.slice(0, i).concat(state.slice(i + 1));
        });
        (action.payload.invalidPending || []).forEach(v => {
          const i = state.findIndex(u => v.hash === u.transactionHash);
          if (~i) state = state.slice(0, i).concat(state.slice(i + 1));
        });
        break;
    }
    return state;
  }
};
