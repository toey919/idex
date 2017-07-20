'use strict';

export default {
  key: 'gasPrice',
  defaultValue: '0',
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_STATS':
        return action.payload.gasPrice;
    }
    return state;
  }
};
