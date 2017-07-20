'use strict';

export default ({
  subscribeToKey,
  dispatch
}) => {
  subscribeToKey('tokens', (lastTokens, newTokens) => {
    if (!lastTokens.length && newTokens.length) {
      dispatch({
        type: 'LOAD_TRADE_FOR_MARKET',
        payload: 'REP'
      });
    }
  });
};
