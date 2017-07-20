'use strict';

export default {
  key: 'pricedPendingTrades',
  defaultValue: [],
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_PRICED_PENDING_TRADES':
        return state.concat(action.payload);
      case 'UNSHIFT_PRICED_PENDING_TRADES':
        return [].concat(action.payload).concat(state);
      case 'SPLICE_PRICED_PENDING':
        const i = state.findIndex(v => v.transactionHash === action.payload);
        if (~i) return state.slice(0, i).concat(state.slice(i + 1));
  
    }
    return state;
  }
};
