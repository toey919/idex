'use strict';

import max from '../../lib/max';

export default {
  key: 'highestOrderId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_ORDERS':
        return max(action.payload.map((v) => v.id));
      case 'POLL_UPDATE':
        if ((action.payload.orders || []).length) return max(action.payload.orders.map(v => v.id));
    }
    return state;
  } 
};
