'use strict';

export default {
  key: 'tradeDepositAmount',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_SELECTED_MARKET':
        return '';
      case 'LOAD_BASE_DEPOSIT_AMOUNT':
        return '';
    }
    return state;
  }
};
