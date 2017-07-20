'use strict';

export default {
  defaultValue: '',
  key: 'error',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'CANCEL_ERROR':
        return action.payload.split('\n')[0];
    }
    return state;
  }
};
