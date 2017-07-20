'use strict';

export default {
  key: 'sellTotal',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'CLEAR_SELL':
        return '';
      case 'LOAD_BUY_FROM_TABLE':
        return action.payload.give;
    }
    return state;
  }
};
