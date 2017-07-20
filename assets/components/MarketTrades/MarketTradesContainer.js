'use strict';

import { connect } from 'react-redux';
import MarketTrades from './MarketTradesComponent';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import moment from 'moment';
import pow from '../../lib/pow';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

const noop = (v) => v;
const reciprocal = (v) => v.reciprocate();

/* jshint ignore:start */

export default connect(({
  pricedTrades,
  pricedPendingTrades,
  selectedMarket,
  tradeForMarket,
  tokens,
  selectedAccount,
  tradeHistorySelectedTab
}) => {
  const decimals = tokens.map(v => v.decimals);
  const selectedIndex = tokens.findIndex(v => v.symbol === selectedMarket),
        tradeForIndex = tokens.findIndex(v => v.symbol === tradeForMarket),
        selected = tokens[selectedIndex] || defaultToken,
        tradeFor = tokens[tradeForIndex] || defaultToken,
        selectedDecimals = decimals[selectedIndex] || 0,
        tradeForDecimals = decimals[tradeForIndex] || 0;


  const { address: tradeForAddress } = tradeFor;
  const { address: selectedAddress } = selected;

  const theseTradesFilter = (v) => (v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress || v.tokenGet === tradeForAddress && v.tokenGive === selectedAddress);

  const pendingReversed = pricedPendingTrades.slice().filter(theseTradesFilter).reverse().map(v => {
    v.amountGet = v.amount;
    v.amountGetPrecision = v.amountPrecision;
    v.time = 'PENDING';
    v.amountGive = v.amountGiveAdjusted;
    v.amountGivePrecision = v.amountGiveAdjustedPrecision;
    return v;
  });

  const tradesFiltered = pendingReversed.concat(pricedTrades.filter(theseTradesFilter)).map(v => ({ ...v })).map(v => {
    v.type = v.tokenGet === selectedAddress && 'Buy' || 'Sell';
    v.isBuy = v.type === 'Buy';
    return v;
  }).map(v => {
    let date = new Date(v.time);
    if (isNaN(date)) date = 'PENDING';
    else date = moment(date).format('DD-MM-YY HH:mm:ss');
    v.price = v.isBuy && v.sellPrice.toDecimal() || v.buyPrice.toDecimal();
    v.amount = v.isBuy && v.amountGivePrecision.toDecimal() || v.amountGetPrecision.toDecimal();
    v.total = v.isBuy && v.amountGetPrecision.toDecimal() || v.amountGivePrecision.toDecimal();
    v.date = date;
    return v;
  });
  return {
    trades: tradesFiltered,
    isSelected: tradeHistorySelectedTab === 0
  };
}, (dispatch) => ({}))(MarketTrades);
  
/* jshint ignore:end */
