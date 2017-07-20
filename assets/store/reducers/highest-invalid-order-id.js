'use strict';

import max from '../../lib/max';

export default {
  key: 'highestInvalidOrderId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        if ((action.payload.invalidOrder || []).length) return max(action.payload.invalidOrder.map(v => v.id));
    }
    return state;
  } 
};
