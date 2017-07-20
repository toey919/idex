'use strict';

const { isArray } = Array;

export default {
  key: 'pricedOrders',
  defaultValue: [],
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_PRICED_ORDERS':
        return state.concat(action.payload);
      case 'UNSHIFT_PRICED_ORDERS':
        return [].concat(action.payload).concat(state);
      case 'UPDATE_PRICED_ORDERS':
        if (action.payload && !isArray(action.payload)) action.payload = [action.payload];
        action.payload.forEach((v) => {
          const i = state.findIndex((u) => u.hash === v.hash);
          if (~i)
            state = state.slice(0, i).concat(v).concat(state.slice(i + 1));
        });
        return state;
      case 'REMOVE_PRICED_ORDERS': 
        if (action.payload && !isArray(action.payload)) action.payload = [action.payload];
        action.payload.forEach((v) => {
          const i = state.findIndex((u) => u.hash === v.hash);
          if (~i)
            state = state.slice(0, i).concat(state.slice(i + 1));
        });
        return state;
    }
    return state;
  }
};
