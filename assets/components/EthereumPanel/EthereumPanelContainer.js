'use strict';

import { connect } from 'react-redux';
import EthereumPanel from './EthereumPanelComponent';
import { toggleEthereumPanel } from '../../actions/ethereum-panel';

export default connect(({
  displayTooltip,
  web3Error,
  txpoll,
  transactions,
  currentTransaction,
  lastBlock
}) => {
  const lastTransaction = transactions.find(v => v.receipt) || null;
  return {
    isActive: displayTooltip,
    lastBlock,
    currentTransaction,
    lastTransaction,
    transactions,
    isPending: Boolean(txpoll.length),
    web3Error
  };
}, (dispatch) => ({
  onToggle() {
    toggleEthereumPanel();
  },
  onToggleTransactions() {
    dispatch({
      type: 'TOGGLE_TRANSACTION_HISTORY'
    });
  }
}))(EthereumPanel);
