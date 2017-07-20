'use strict';

import max from '../../lib/max';

export default {
  key: 'highestPendingTradeId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        const pending = (action.payload.pending || []).filter(v => v.type === 'trade');
        if (pending.length) return max(pending.map(v => v.id));
    }
    return state;
  } 
};
