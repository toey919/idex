'use strict';

import { connect } from 'react-redux';
import Metrics from './MetricsComponent';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import pow from '../../lib/pow';

const { now } = Date;

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A'
};

const PRECISION = 4;

export default connect(({
  tokens,
  pricedTrades,
  selectedMarket,
  tradeForMarket
}) => {
  const decimals = tokens.map(v => v.decimals);
  const selectedIndex = tokens.findIndex(v => v.symbol === selectedMarket),
        tradeForIndex = tokens.findIndex(v => v.symbol === tradeForMarket),
        selectedToken = tokens[selectedIndex] || defaultToken,
        tradeForToken = tokens[tradeForIndex] || defaultToken,
        selectedDecimals = decimals[selectedIndex] || 0,
        tradeForDecimals = decimals[tradeForIndex] || 0;
  const { address: selectedAddress } = selectedToken;
  const { address: tradeForAddress } = tradeForToken;
  const isSell = (v) => v && v.tokenGive === tradeForAddress;
  const priceOf = (v) => v && (isSell(v) && v.sellPrice.toDecimal() || v.buyPrice.toDecimal());
  const tradesFiltered = pricedTrades.filter(v => (v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress || v.tokenGive === selectedAddress && v.tokenGet === tradeForAddress));
  const lastTrade = tradesFiltered[0];
  const lastPrice = BigRational(priceOf(lastTrade)).toDecimal(PRECISION) || 'Not yet available';
  const ts = now(); 
  const tradesInLastDay = tradesFiltered.filter(v => +new Date(v.time) + 86400000 >= ts);
  const lastTradeYesterday = tradesFiltered.find(v => +new Date(v.time) + 86400000 < ts);
  const prices = tradesInLastDay.map(priceOf).sort((a, b) => +BigRational(b).minus(BigRational(a)));
  const high = prices[0] || 'Not yet avaiable';
  const low = prices[(prices.length || 1) - 1] || 'Not yet available';
  let change = lastTradeYesterday && tradesInLastDay.length && BigRational(priceOf(tradesInLastDay[0])).minus(BigRational(priceOf(lastTradeYesterday))).divide(BigRational(priceOf(lastTradeYesterday))).multiply(100).toDecimal(PRECISION) + '%' || '0%';
  if (change.substr(0, 1) !== '0' && !isNaN(change.substr(0, 1))) change = '+' + change;
  const tradeForVolume = tradesInLastDay.map(v => isSell(v) && BigRational(v.amountGive) || BigRational(v.amountGet)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, tradeForDecimals)).toDecimal();
  const selectedVolume = tradesInLastDay.map(v => isSell(v) && BigRational(v.amountGet) || BigRational(v.amountGive)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, selectedDecimals)).toDecimal();
  return {
    tradeForMarket: tradeForToken,
    selectedMarket: selectedToken,
    lastPrice,
    high,
    low,
    change,
    tradeForVolume,
    selectedVolume
  };
}, (dispatch) => ({}))(Metrics);
