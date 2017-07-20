'use strict';

export default {
  key: 'sellPriceRational',
  defaultValue: null,
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_BUY_FROM_TABLE':
        return action.payload.rational;
      case 'LOAD_SELL_PRICE':
        return null;
    }
    return state;
  }
};
