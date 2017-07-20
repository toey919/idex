'use strict';

export default {
  key: 'gasLimit',
  defaultValue: 0,
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'LOAD_STATS':
        return action.payload.gasLimit;
    }
    return state;
  }
};
