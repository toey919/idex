'use strict';

export default {
  key: 'transactions',
  defaultValue: [],
  reducer: (state, action) => {
    switch (action.type) {
      case 'TRANSACTION_DISPATCHED':
        return [action.payload].concat(state);
      case 'TRANSACTION_MINED':
        const i = state.findIndex(v => v.tx === action.payload.tx);
        if (~i) {
          return state.slice(0, i).concat(action.payload).concat(state.slice(i + 1));
        }
        return [action.payload].concat(state);
    }
    return state;
  }
};
