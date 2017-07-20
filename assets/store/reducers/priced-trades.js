'use strict';

export default {
  key: 'pricedTrades',
  defaultValue: [],
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_PRICED_TRADES':
        return state.concat(action.payload);
      case 'UNSHIFT_PRICED_TRADES':
        return [].concat(action.payload).concat(state);
    }
    return state;
  }
};
