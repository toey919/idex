'use strict';

import { connect } from 'react-redux';
import EthereumModal from './EthereumModalComponent';
import { getState } from '../../store';

export default connect(({
  ethereumRPC,
  editingRPCURL,
  accounts,
  gas,
  multiplier,
  selectedAccount,
  tmpRPCURL,
  tmpSelectedAccount,
  ethereumPanelOpen
}) => ({
  multiplier,
  gas,
  ethereumRPC,
  editingRPCURL,
  tmpRPCURL,
  accounts,
  selectedAccount,
  tmpSelectedAccount,
  isOpen: ethereumPanelOpen
}), (dispatch) => ({
  changeGas(evt) {
    dispatch({
      type: 'LOAD_GAS',
      payload: evt.target.value
    });
  },
  changeMultiplier(evt) {
    dispatch({
      type: 'LOAD_MULTIPLIER',
      payload: evt.target.value
    });
  },
  editRPCURL(evt) {
    dispatch({
      type: 'LOAD_TMP_RPCURL',
      payload: getState().ethereumRPC
    });
    dispatch({
      type: 'TOGGLE_EDITING_RPCURL'
    });
  },
  saveRPCURL(evt) {
    dispatch({
      type: 'LOAD_ETHEREUM_RPC',
      payload: getState().tmpRPCURL
    });
    dispatch({
      type: 'TOGGLE_EDITING_RPCURL'
    });
  },
  setRPCURL(evt) {
    evt.preventDefault();
    dispatch({
      type: 'TOGGLE_EDITING_RPCURL'
    });
    dispatch({
      type: 'LOAD_ETHEREUM_RPC',
      payload: getState().tmpRPCURL
    });
  },
  dismissEthereumPanel(evt) {
    dispatch({
      type: 'LOAD_ETHEREUM_PANEL_OPEN',
      payload: false
    });
  },
  closeEthereumPanel(evt) {
    evt.preventDefault();
    if (getState().editingRPCURL) {
      dispatch({
        type: 'TOGGLE_EDITING_RPCURL'
      });
      dispatch({
        type: 'LOAD_ETHEREUM_RPC',
        payload: getState().tmpRPCURL
      });
    }
    dispatch({
      type: 'LOAD_EDITING_RPCURL',
      payload: false
    });
    dispatch({
      type: 'LOAD_ETHEREUM_PANEL_OPEN',
      payload: false
    });
  },
  onRPCURLChange(evt) {
    dispatch({
      type: 'LOAD_TMP_RPCURL',
      payload: evt.target.value
    });
  },
  selectAccount(o) {
    dispatch({
      type: 'LOAD_TMP_SELECTED_ACCOUNT',
      payload: typeof o === 'string' && o || o && o.value || ''
    });
    if ((typeof o === 'string' && o.length || o && o.value.length) === 42) dispatch({
      type: 'LOAD_SELECTED_ACCOUNT',
      payload: typeof o === 'string' && o || o && o.value || ''
    });
  },
  onLoadWallet(payload) {
    dispatch({
      type: 'WALLET_UPLOADED',
      payload
    });
  },
  onSetWalletPassword(payload) {
    dispatch({
      type: 'LOAD_WALLET_PASSWORD',
      payload
    });
  },
  onWalletLoadJSONError(e) {
    console.log(e.stack);
    dispatch({
      type: 'LOAD_ERROR',
      payload: 'Wallet is not in JSON format'
    });
  }
}))(EthereumModal);
