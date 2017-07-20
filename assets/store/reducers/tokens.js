"use strict";

export default {
  key: 'tokens',
  defaultValue: [],
  inject: {
    loader: true,
    reloadable: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        if (action.payload.tokens && action.payload.tokens.length) {
          action.payload.tokens.forEach(v => {
            let idx = state.findIndex(u => u.symbol === v.symbol);
            if (~idx) 
              state = state.slice(0, idx).concat(v).concat(state.slice(idx + 1));
            else
              state = state.concat(v);
          });
        }
        return state;
    }
    return state;
  }
};
