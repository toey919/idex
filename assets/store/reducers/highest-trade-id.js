'use strict';

import max from '../../lib/max';

export default {
  key: 'highestTradeId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_TRADES':
        return max(action.payload.map((v) => v.id));
      case 'POLL_UPDATE':
        if ((action.payload.trades || []).length) return max(action.payload.trades.map(v => v.id));
    }
    return state;
  } 
};
