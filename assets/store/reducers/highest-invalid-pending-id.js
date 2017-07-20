'use strict';

import max from '../../lib/max';

export default {
  key: 'highestInvalidPendingId',
  defaultValue: 0,
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        if ((action.payload.invalidPending || []).length) return max(action.payload.invalidPending.map(v => v.id));
    }
    return state;
  } 
};
