'use strict';

import BigRational from 'big-rational';

export default {
  key: 'nonce',
  defaultValue: 1,
  inject: {
    loader: true
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'POLL_UPDATE':
        return action.payload.nonce && BigRational(state).lt(BigRational(action.payload.nonce)) && +action.payload.nonce || state;
      case 'INCREMENT_NONCE':
        return ++state;
/*
      case 'ORDER_SUBMITTED':
        return action.payload.nonce && BigRational(state).lt(BigRational(action.payload.nonce)) && +action.payload.nonce || state;
*/
      case 'DO_SYNC':
        return action.payload.nonce || state;
    }
    return state;
  }
};
