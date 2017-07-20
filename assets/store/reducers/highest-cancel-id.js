'use strict';

import max from '../../lib/max';

export default {
  key: 'highestCancelId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_CANCELS':
        return max(action.payload.map((v) => v.id));
      case 'POLL_UPDATE':
        if ((action.payload.cancels || []).length) return max(action.payload.cancels.map(v => v.id));
    }
    return state;
  } 
};
