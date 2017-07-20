'use strict';

import { connect } from 'react-redux';
import EthereumModalButton from './EthereumModalButtonComponent';
import { getState } from '../../store';

export default connect(() => ({}), (dispatch) => ({
  openEthereumModal() {
    const { selectedAccount, editingRPCURL, ethereumRPC } = getState();
    if (!editingRPCURL && !ethereumRPC) dispatch({
      type: 'TOGGLE_EDITING_RPCURL'
    });
    dispatch({
      type: 'TOGGLE_ETHEREUM_PANEL_OPEN'
    });
    if (selectedAccount) dispatch({
      type: 'LOAD_TMP_SELECTED_ACCOUNT',
      payload: selectedAccount
    });
  }
}))(EthereumModalButton);
