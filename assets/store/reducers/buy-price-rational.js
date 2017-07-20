'use strict';

export default {
  key: 'buyPriceRational',
  defaultValue: null,
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_SELL_FROM_TABLE':
        return action.payload.rational;
      case 'LOAD_BUY_PRICE':
        return null;
    }
    return state;
  }
};
