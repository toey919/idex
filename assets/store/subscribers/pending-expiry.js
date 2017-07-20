'use strict';

import { pendingExpiration } from '../../fixtures';

export default ({
  subscribeToKey,
  dispatch
}) => {
  subscribeToKey(['timestamp'], (_, {
    timestamp,
    pendingTrades,
    pendingCancels
  }) => {
    const tradesToInvalidate = pendingTrades.filter((v) => +new Date(v.createdAt) + pendingExpiration < timestamp).map((v) => v.transactionHash);
    if (tradesToInvalidate.length) {
      dispatch({
        type: 'INVALID_TRADES',
        payload: tradesToInvalidate
      });
    }
    const cancelsToInvalidate = pendingCancels.filter((v) => +new Date(v.createdAt) + pendingExpiration < timestamp).map((v) => v.transactionHash);
    if (cancelsToInvalidate.length) {
      dispatch({
        type: 'INVALID_CANCELS',
        payload: cancelsToInvalidate
      });
    }
  });
};
