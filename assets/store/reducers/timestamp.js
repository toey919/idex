'use strict';

export default {
  key: 'timestamp',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch  (action.type) {
      case 'POLL_UPDATE':
        return action.payload.time || state;
    }
    return state;
  }
};
