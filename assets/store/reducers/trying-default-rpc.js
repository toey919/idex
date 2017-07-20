'use strict';

export default {
  key: 'tryingDefaultRPC',
  defaultValue: false,
  reducer: (state, action) => {
    switch (action.type) {
      case 'TRYING_DEFAULT_RPC':
        return true;
      case 'DEFAULT_RPC_FAILED':
      case 'DEFAULT_RPC_SUCCESS':
        return false;
    }
    return state;
  }
};
