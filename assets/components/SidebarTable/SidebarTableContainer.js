"use strict";

import { connect } from 'react-redux';
import SidebarTable from './SidebarTableComponent';
import findTR from '../../lib/find-tr';
import findTD from '../../lib/find-td';
import shallowClone from '../../lib/shallow-clone';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import escapeRegExp from 'escape-regexp';
import isAllowed from '../../lib/is-allowed';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A'
};

const PRECISION = 4;


import pow from '../../lib/pow';

export default connect(({
  tokens,
  selectedMarket,
  pricedTrades,
  sidebarFavoritesOnly,
  sidebarSearch,
  favorites
}) => {
  const tokensCopy = shallowClone(tokens);
  const decimals = tokens.map(v => v.decimals);
  tokensCopy.forEach((v, i) => (v.decimals = decimals[i] || 0));
  const selectedIndex = tokensCopy.findIndex(v => v.symbol === selectedMarket);
  const selectedToken = tokensCopy[selectedIndex] || defaultToken;
  const selectedDecimals = decimals[selectedIndex] || 0;
  const { address: selectedAddress } = selectedToken;
  const tradesCopy = shallowClone(pricedTrades);
  const nonSelectedTokens = tokensCopy.filter(v => v.symbol !== selectedMarket)
    .filter(v => {
      const toUpper = v.symbol.toUpperCase();
      return !sidebarFavoritesOnly || favorites[toUpper];
    })
    .filter(v => isAllowed(selectedToken.symbol, v.symbol))
    .filter(v => !sidebarSearch || RegExp(escapeRegExp(sidebarSearch).replace(/\\\*/g, '(?:.*?)'), 'i').test(v.symbol + ' ' + v.name))
    .map(v => {
      v.trades = tradesCopy.filter(u => ((u.tokenGet === v.address && u.tokenGive === selectedAddress || u.tokenGive === v.address && u.tokenGet === selectedAddress) && !BigNumber(u.amountGet).equals(0) && !BigNumber(u.amountGive).equals(0)));
      v.trades.forEach(v => v.isSell = v.tokenGet === selectedAddress);
      v.trades.forEach(u => u.priceOf = u.isSell && u.sellPrice.toDecimal() || u.buyPrice.toDecimal());
      v.lastPrice = (v.trades[0] || {}).priceOf && BigRational(v.trades[0].priceOf).toDecimal(PRECISION) || 'N/A';
      v.tradesLastDay = v.trades.filter(v => +new Date(v.time) + 1000*60*60*24 >= Date.now());
      v.yesterdayTrade = v.trades.find(v => +new Date(v.time) + 1000*60*60*24 < Date.now());
      v.change = v.tradesLastDay.length && v.yesterdayTrade && BigRational(v.tradesLastDay[0].priceOf).minus(BigRational(v.yesterdayTrade.priceOf)).divide(BigRational(v.yesterdayTrade.priceOf)).multiply(100).toDecimal(PRECISION - 2) + '%' || '0%';
      if (v.change.substr(0, 1) !== '0' && !isNaN(v.change.substr(0, 1))) v.change = '+' + v.change;
      v.tradeForVolume = v.tradesLastDay.map(v => v.isSell && BigRational(v.amountGive) || BigRational(v.amountGet)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, v.decimals)).toDecimal(PRECISION);
      v.selectedVolume = v.tradesLastDay.map(v => v.isSell && BigRational(v.amountGet) || BigRational(v.amountGive)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, selectedDecimals)).toDecimal(PRECISION);
      v.favorite = favorites[v.symbol.toUpperCase()];
      return v;
    });
  return {
    selectedMarket: selectedToken,
    tokens: nonSelectedTokens
  };
}, (dispatch) => ({
  onSelectRow(evt) {
    const td = findTD(evt.target);
    const tr = findTR(evt.target);
    if (td === tr.children[0]) return dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: tr.children[1].innerHTML
    });
    return dispatch({
      type: 'LOAD_TRADE_FOR_MARKET',
      payload: tr.children[1].innerHTML
    });
  }
}))(SidebarTable);
