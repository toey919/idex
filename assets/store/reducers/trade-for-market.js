"use strict";

export default {
  key: 'tradeForMarket',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        if (!state) return (action.payload.tokens[1] || {}).symbol || '';
        break;
    }
    return state;
  } 
};
