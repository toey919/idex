'use strict';

export default {
  key: 'wallet',
  defaultValue: null,
  reducer: (state, action) => {
    switch (action.type) {
      case 'WALLET_UPLOADED':
        return action.payload;
    }
    return state;
  }
};
