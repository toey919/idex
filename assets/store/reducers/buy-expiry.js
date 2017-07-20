'use strict';

const defaultValue = '40000';

export default {
  key: 'buyExpiry',
  defaultValue,
  reducer: (state, action) => {
    switch (action.type) {
      case 'CLEAR_BUY':
        return defaultValue;
    }
    return state;
  }, 
  inject: {
    loader: true
  }
};
