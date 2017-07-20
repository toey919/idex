'use strict';

export default {
  key: 'tradeWithdrawQuantity',
  defaultValue: '',
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_TRADE_WITHDRAW_QUANTITY':
        return action.payload;
      case 'LOAD_BASE_WITHDRAW_QUANTITY':
      case 'LOAD_TRADE_FOR_MARKET':
      case 'CLEAR_WITHDRAW':
        return '';
    }
    return state;
  }
};
