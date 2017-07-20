'use strict';

export default {
  key: 'lastMined',
  defaultValue: null,
  reducer: (state, action) => {
    switch (action.type) {
      case 'TRANSACTION_MINED':
        return action.payload;
    }
    return state;
  }
};
