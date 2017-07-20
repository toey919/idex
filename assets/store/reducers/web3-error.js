'use strict';

export default {
  key: 'web3Error',
  defaultValue: false,
  reducer: (state, action) => {
    switch (action.type) {
      case 'WEB3_DISCONNECTED':
        return true;
      case 'LOAD_ETHEREUM_RPC':
      case 'RETRY_CONNECT_RPC':
        return false;
    }
    return state;
  }
};
