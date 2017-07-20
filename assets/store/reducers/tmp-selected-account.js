'use strict';

export default {
  key: 'tmpSelectedAccount',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_ETHEREUM_RPC':
        return action.payload;
    }
    return state;
  },
  defaultValue: ''
};
