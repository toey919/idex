'use strict';

export default {
  key: 'txpoll',
  defaultValue: [],
  reducer: (state, action) => {
    switch (action.type) {
      case 'TRANSACTION_DISPATCHED':
        return state.concat(action.payload);
      case 'TRANSACTION_MINED':
        let idx = state.findIndex((v) => action.payload.tx === v.tx);
        return state.slice(0, idx).concat(state.slice(idx + 1));
    }
    return state;
  }
};
