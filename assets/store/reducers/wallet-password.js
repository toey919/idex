'use strict';

export default {
  key: 'walletPassword',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'WALLET_UPLOADED':
        return '';
    }
    return state;
  }
};
