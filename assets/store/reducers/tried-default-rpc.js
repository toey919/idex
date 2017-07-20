'use strict';

export default {
  key: 'triedDefaultRPC',
  defaultValue: false,
  reducer: (state, action) => {
    switch (action.type) {
      case 'DEFAULT_RPC_FAILED':
      case 'DEFAULT_RPC_SUCCESS':
        return true;
    }
    return state;
  }
};
