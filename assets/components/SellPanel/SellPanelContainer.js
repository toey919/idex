"use strict";

import { connect } from 'react-redux';
import SellPanel from './SellPanelComponent';
import { performSellOrPlaceOrder } from '../../client';
import { getState } from '../../store';
import BigRational from 'big-rational';
import pow from '../../lib/pow';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

export default connect(({
  tokens,
  selectedMarket,
  tradeForMarket,
  orders,
  sellAmount,
  sellPrice,
  sellExpiry,
  sellPanelMinimized,
  sellTotal,
  sellPriceRational
}) => {
  const decimals = tokens.map(v => v.decimals);
  const selected = tokens.find((v) => {
    return v.symbol === selectedMarket;
  }) || defaultToken;
  const tradeFor = tokens.find((v) => {
    return v.symbol === tradeForMarket;
  }) || defaultToken;
  const { address: tradeForAddress } = tradeFor;
  const { address: selectedAddress } = selected;
  const { decimals: selectedDecimals } = selected;
  const { decimals: tradeForDecimals } = tradeFor;
  const ordersFiltered = orders.filter(v => !v.invalid).filter(v => ((BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === tradeForAddress && v.tokenGive === selectedAddress)));
  const amt = BigRational(sellAmount).multiply(pow(10, tradeForDecimals)).toDecimal();
  let idx;
  const target = ordersFiltered.find((v, i) => {
    idx = i;
    const price = BigRational(v.amountGive).divide(pow(10, selectedDecimals)).divide(BigRational(v.amountGet).divide(pow(10, tradeForDecimals)));
    const priceIsEqual = price.eq(BigRational(sellPriceRational || sellPrice));
    const amountRemains = BigRational(v.amountGetRemaining || v.amountGet);
    const amountRemainsIsGeqAmt = amountRemains.geq(BigRational(amt));
    return priceIsEqual && amountRemainsIsGeqAmt;
  });
  return {
    selectedMarket: selected,
    tradeForMarket: tradeFor,
    isTaker: Boolean(target),
    sellAmount,
    sellPrice,
    sellTotal,
    sellExpiry,
    isMinimized: sellPanelMinimized
  };
}, (dispatch) => ({
  onSellExpiryChange(evt) {
    dispatch({
      type: 'LOAD_SELL_EXPIRY',
      payload: evt.target.value
    });
  },
  onToggle(evt) {
    evt.preventDefault();
    dispatch({
      type: 'TOGGLE_SELL_PANEL_MINIMIZED'
    });
  },
  onSellAmountChange(evt) {
    dispatch({
      type: 'LOAD_SELL_AMOUNT',
      payload: evt.target.value
    });
  },
  onSellPriceChange(evt) {
    dispatch({
      type: 'LOAD_SELL_PRICE',
      payload: evt.target.value
    });
  },
  onTotalChange(evt) {
    dispatch({
      type: 'LOAD_SELL_TOTAL',
      payload: evt.target.value
    });
  },
  onRefresh(evt) {
    evt.preventDefault();
    dispatch({
      type: 'CLEAR_SELL'
    });
  },
  onSell(evt) {
    evt.preventDefault();
    performSellOrPlaceOrder();
  },
  onSelectAmount(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_SELL_AMOUNT'
    });
  },
  onSelectTotal(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_SELL_TOTAL'
    });
  },
  onSelectPrice(evt) {
    evt.preventDefault();
    dispatch({
      type: 'SELECT_SELL_PRICE'
    });
  }
}))(SellPanel);
