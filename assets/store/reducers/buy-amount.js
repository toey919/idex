"use strict";

export default {
  key: 'buyAmount',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'CLEAR_BUY':
        return '';
      case 'LOAD_SELL_FROM_TABLE':
        return action.payload.give;
    }
    return state;
  }
};
