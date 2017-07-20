'use strict';

const defaultValue = '40000';

export default {
  key: 'sellExpiry',
  reducer: (state, action) => {
    switch (action.type) {
      case 'CLEAR_SELL':
        return defaultValue;
    }
    return state;
  },
  inject: {
    loader: true
  },
  defaultValue
};
