'use strict';

import { connect } from 'react-redux';
import Withdraw from './WithdrawComponent';
import clone from 'clone';
import BigRational from 'big-rational';
import { withdraw } from '../../client';
import pow from '../../lib/pow';
import { getState } from '../../store';


const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  exchangeBalance: 'N/A',
  unselected: true
};

let baseMax, tradeMax;

export default connect(({
  tokens,
  selectedMarket,
  tradeForMarket,
  web3Error,
  baseWithdrawQuantity,
  tradeWithdrawQuantity,
  withdrawAddress,
  exchangeBalances
}) => {
  const idx = tokens.findIndex(v => v.symbol === selectedMarket);
  const token = ~idx && clone(tokens[idx]) || defaultToken;
  const decimals = tokens.map(v => v.decimals);
  baseMax = '';
  if (~idx) {
    if (web3Error)
      token.exchangeBalance = 'Disconnected';
    else if (typeof decimals[idx] === 'undefined' || typeof exchangeBalances[idx] === 'undefined') 
      token.exchangeBalance = 'Loading';
    else
      token.exchangeBalance = baseMax = BigRational(exchangeBalances[idx]).divide(pow(10, decimals[idx])).toDecimal();
  }
  const tradeIdx = tokens.findIndex(v => v.symbol === tradeForMarket);
  const tradeToken = ~tradeIdx && clone(tokens[tradeIdx]) || defaultToken;
  tradeMax = '';
  if (~tradeIdx) {
    if (web3Error)
      tradeToken.exchangeBalance = 'Disconnected';
    else if (typeof decimals[tradeIdx] === 'undefined' || typeof exchangeBalances[tradeIdx] === 'undefined') 
      tradeToken.exchangeBalance = 'Loading';
    else
      tradeToken.exchangeBalance = tradeMax = BigRational(exchangeBalances[tradeIdx]).divide(pow(10, decimals[tradeIdx] || 0)).toDecimal();
  }
  return {
    selectedMarket: token,
    tradeForMarket: tradeToken,
    withdrawAddress,
    tradeWithdrawQuantity,
    baseWithdrawQuantity
  };
}, (dispatch) => ({
  onChangeWithdrawAddress(evt) {
    dispatch({
      type: 'LOAD_WITHDRAW_ADDRESS',
      payload: evt.target.value
    });
  },
  onSelectDefaultAddress(evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_WITHDRAW_ADDRESS',
      payload: getState().selectedAccount
    });
  },
  onChangeBaseWithdrawQuantity(evt) {
    dispatch({
      type: 'LOAD_BASE_WITHDRAW_QUANTITY',
      payload: evt.target.value
    });
  },
  onChangeTradeWithdrawQuantity(evt) {
    dispatch({
      type: 'LOAD_TRADE_WITHDRAW_QUANTITY',
      payload: evt.target.value
    });
  },
  onMaxBase(evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_BASE_WITHDRAW_QUANTITY',
      payload: baseMax
    });
  },
  onMaxTrade(evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_TRADE_WITHDRAW_QUANTITY',
      payload: tradeMax
    });
  },
  onWithdraw(evt) {
    evt.preventDefault();
    dispatch({
      type: 'DISPATCH_WITHDRAW'
    });
    withdraw().then((result) => {
      dispatch({
        type: 'WITHDRAWAL_SUCCESSFUL',
        payload: result
      });
    }).catch((err) => {
      dispatch({
        type: 'LOAD_ERROR',
        payload: err.message
      });
    });
  }
}))(Withdraw);
