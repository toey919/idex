"use strict";

import { connect } from 'react-redux';
import BuyPanel from './BuyPanelComponent';
import { performBuyOrPlaceOrder } from '../../client';
import { getState } from '../../store';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import pow from '../../lib/pow';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

export default connect(({
  tokens,
  buyTotal,
  selectedMarket,
  tradeForMarket,
  buyPrice,
  buyExpiry,
  orders,
  buyPanelMinimized,
  buyAmount,
  exchangeBalances,
  buyPriceRational
}) => {
  const decimals = tokens.map(v => v.decimals);
  const selectedIndex = tokens.findIndex((v) => {
    return v.symbol === selectedMarket;
  });
  const selected = tokens[selectedIndex] || defaultToken;
  const tradeForIndex = tokens.findIndex((v) => {
    return v.symbol === tradeForMarket;
  });
  const tradeFor = tokens[tradeForIndex] || defaultToken;
  const { address: selectedAddress } = selected;
  const { address: tradeForAddress } = tradeFor;
  const ordersFiltered = orders.filter(v => !v.invalid).filter(v => ((BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress)));
  const { decimals: selectedDecimals } = selected;
  const { decimals: tradeForDecimals } = tradeFor;
  const amt = BigRational(buyTotal).multiply(pow(10, selectedDecimals)).toDecimal();
  let idx;
  let target = ordersFiltered.find((v, i) => {
    idx = i;
    const price = BigRational(v.amountGet).divide(BigNumber(10).pow(selectedDecimals)).divide(BigRational(v.amountGive).divide(BigNumber(10).pow(tradeForDecimals)));
    const priceIsEqual = price.eq(BigRational(buyPriceRational || buyPrice));
    const amountRemains = BigRational(v.amountGetRemaining || v.amountGet);
    const amountRemainsIsGeqAmt = amountRemains.geq(BigRational(amt));
    return priceIsEqual && amountRemainsIsGeqAmt;
  });
  const isTaker = Boolean(target);
  return {
    selectedMarket: selected,
    tradeForMarket: tradeFor,
    isTaker,
    buyPrice,
    buyAmount,
    buyExpiry,
    buyTotal,
    isMinimized: buyPanelMinimized
  };
}, (dispatch) => ({
  onBuyExpiryChange(evt) {
    dispatch({
      type: 'LOAD_BUY_EXPIRY',
      payload: evt.target.value
    });
  },
  onToggle(evt) {
    evt.preventDefault();
    dispatch({
      type: 'TOGGLE_BUY_PANEL_MINIMIZED'
    });
  },
  onRefresh(evt) {
    evt.preventDefault();
    dispatch({
      type: 'CLEAR_BUY'
    });
  },
  onBuyPriceChange(evt) {
    dispatch({
      type: 'LOAD_BUY_PRICE',
      payload: evt.target.value
    });
  },
  onBuyAmountChange(evt) {
    dispatch({
      type: 'LOAD_BUY_AMOUNT',
      payload: evt.target.value
    });
  },
  onTotalChange(evt) {
    dispatch({
      type: 'LOAD_BUY_TOTAL',
      payload: evt.target.value
    });
  },
  onBuy(evt) {
    evt.preventDefault();
    performBuyOrPlaceOrder();
  },
  onSelectAmount(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_BUY_AMOUNT'
    });
  },
  onSelectTotal(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_BUY_TOTAL'
    });
  },
  onSelectPrice(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_BUY_PRICE'
    });
  }
}))(BuyPanel);
