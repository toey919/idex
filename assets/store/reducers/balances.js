'use strict';

import range from 'lodash/range';

export default {
  key: 'balances',
  inject: {
    loader: true
  },
  defaultValue: [],
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_SELECTED_ACCOUNT':
        return [];
      case 'UPDATE_SINGLE_BALANCE':
        const { i, v } = action.payload;
        if (i >= state.length) {
          state = state.concat(range(i + 1 - state.length).map(v => 0));
        }
        return state.slice(0, i).concat(v).concat(state.slice(i + 1));
      case 'LOAD_STATS':
        return action.payload.balances.map((v) => v.balance);
    }
    return state;
  }
};
