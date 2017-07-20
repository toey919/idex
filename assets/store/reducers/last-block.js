'use strict';

export default {
  key: 'lastBlock',
  defaultValue: 0,
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_BLOCK':
        return action.payload;
      case 'RELOAD_BLOCKCHAIN':
        return 0;
      case 'POLL_UPDATE':
        return action.payload.block || state;
      case 'DO_SYNC':
        return action.payload.block || state;
    }
    return state;
  }
};
