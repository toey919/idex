'use strict';

export default {
  key: 'ethereumRPC',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'DEFAULT_RPC_SUCCESS':
        return action.payload;
    }
    return state;
  }
};
