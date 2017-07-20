'use strict';

import { connect } from 'react-redux';
import Deposit from './DepositComponent';
import clone from 'clone';
import BigRational from 'big-rational';
import { deposit } from '../../client';
import pow from '../../lib/pow';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  balance: 'N/A',
  unselected: true
};

let baseMax, tradeMax;

const ethAddress = '0x' + Array(41).join('0');
const ethDecimals = 18;

export default connect(({
  tokens,
  selectedMarket,
  tradeForMarket,
  web3Error,
  baseDepositAmount,
  tradeDepositAmount,
  gas,
  gasPrice,
  gasLimit,
  multiplier,
  balances
}) => {
  const decimals = tokens.map(v => v.decimals);
  const idx = tokens.findIndex(v => v.symbol === selectedMarket);
  const tradeForIdx = tokens.findIndex(v => v.symbol === tradeForMarket);
  const token = ~idx && clone(tokens[idx]) || defaultToken;
  const tradeForToken = ~tradeForIdx && clone(tokens[tradeForIdx]) || defaultToken;
  if (~idx) {
    if (web3Error) {
      token.balance = 'Disconnected';
      baseMax = '';
    } else if (typeof decimals[idx] === 'undefined' || typeof balances[idx] === 'undefined') {
      token.balance = 'Loading';
      baseMax = '';
    } else {
      token.balance = baseMax = BigRational(balances[idx]).divide(pow(10, decimals[idx] || 0)).toDecimal();
      if (token.address === ethAddress) {
        baseMax = BigRational(baseMax).minus(BigRational(gasPrice).multiply(multiplier).multiply(gas === 'max' && gasLimit || gas).divide(pow(10, ethDecimals))).toDecimal();
      }
    }
  }
  if (~tradeForIdx) {
    if (web3Error) {
      tradeForToken.balance = 'Disconnected';
      tradeMax = '';
    } else if (typeof decimals[tradeForIdx] === 'undefined' || typeof balances[idx] === 'undefined') {
      tradeForToken.balance = 'Loading';
      tradeMax = '';
    } else {
      tradeForToken.balance = tradeMax = BigRational(balances[tradeForIdx]).divide(pow(10, decimals[tradeForIdx] || 0)).toDecimal();
      if (tradeForToken.address === ethAddress) {
        tradeMax = BigRational(tradeMax).minus(BigRational(gasPrice).multiply(multiplier).multiply(gas === 'max' && gasLimit || gas).divide(pow(10, ethDecimals))).toDecimal();
      }
    }
  }
  return {
    selectedMarket: token,
    tradeForMarket: tradeForToken,
    baseDepositAmount,
    tradeDepositAmount
  };
}, (dispatch) => ({
  onBaseDepositAmountChange(evt) {
    dispatch({
      type: 'LOAD_BASE_DEPOSIT_AMOUNT',
      payload: evt.target.value
    });
  },
  onSelectMaxBase() {
    dispatch({
      type: 'LOAD_BASE_DEPOSIT_AMOUNT',
      payload: baseMax
    });
  },
  onTradeDepositAmountChange(evt) {
    dispatch({
      type: 'LOAD_TRADE_DEPOSIT_AMOUNT',
      payload: evt.target.value
    });
  },
  onSelectMaxTrade() {
    dispatch({
      type: 'LOAD_TRADE_DEPOSIT_AMOUNT',
      payload: tradeMax
    });
  },
  onDeposit(evt) {
    evt.preventDefault();
    dispatch({
      type: 'DISPATCH_DEPOSIT'
    });
    deposit();
    dispatch({
      type: 'LOAD_BASE_DEPOSIT_AMOUNT',
      payload: ''
    });
  }
}))(Deposit);
