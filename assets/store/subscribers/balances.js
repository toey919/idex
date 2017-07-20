'use strict';

const { isAddress } = new (require('web3'))();
import { getAndDispatchBalances } from '../../client/client';
import { getBalanceSheet } from '../../client/ws';

export default ({
  subscribeToKey,
  getState
}) => {
  subscribeToKey('lastBlock', () => {
    if (isAddress(getState().selectedAccount)) getAndDispatchBalances();
  });
  subscribeToKey('selectedAccount', () => getBalanceSheet());
};
