'use strict';

import { setWallet } from '../../client/eth';
import { addHexPrefix } from 'ethereumjs-util';
import { getBalanceSheet } from '../../client/ws';
import { getAndDispatchBalances } from '../../client/client';

export default ({
  subscribeToState,
  subscribeToKey,
  getState,
  dispatch
}) => {
  subscribeToState(({
    ethereumPanelOpen: lastEthereumPanelOpen
  }, {
    ethereumPanelOpen,
    walletPassword,
    wallet
  }) => {
    if (lastEthereumPanelOpen && !ethereumPanelOpen && walletPassword && wallet) {
      if (!wallet.crypto && wallet.Crypto) wallet.crypto = wallet.Crypto;
      setWallet(wallet, walletPassword);
      dispatch({
        type: 'LOAD_SELECTED_ACCOUNT',
        payload: addHexPrefix(wallet.address)
      });
    }
  });
  subscribeToKey('selectedAccount', () => {
    getAndDispatchBalances();
    getBalanceSheet();
  });
};
