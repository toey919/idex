"use strict";

import { getState } from '../';

export default {
  key: 'selectedMarket',
  defaultValue: '',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        if (!state) return (action.payload.tokens[0] || {}).symbol || '';
        break;
      case 'SELECT_MARKET':
        return action.payload;
    }
    return state;
  } 
};
