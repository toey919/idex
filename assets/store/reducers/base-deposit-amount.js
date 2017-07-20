'use strict';

export default {
  key: 'baseDepositAmount',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_SELECTED_MARKET':
        return '';
      case 'LOAD_TRADE_DEPOSIT_AMOUNT':
        return '';
    }
    return state;
  }
};
