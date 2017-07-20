'use strict';

export default {
  key: 'currentTransaction',
  defaultValue: null,
  reducer: (state, action) => {
    switch (action.type) {
      case 'TRANSACTION_DISPATCHED':
        return action.payload;
      case 'TRANSACTION_MINED':
        if (action.payload.tx === (state || {}).tx) return null;
        break;
    }
    return state;
  }
};
