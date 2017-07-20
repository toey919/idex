"use strict";

export default {
  key: 'sellAmount',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'CLEAR_SELL':
        return '';
      case 'LOAD_BUY_FROM_TABLE':
        return action.payload.get;
    }
    return state;
  }
};
