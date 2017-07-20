"use strict";

import { connect } from 'react-redux';
import SellOrders from './SellOrdersComponent';
import findTR from '../../lib/find-tr';
import { computeSellOrders, computeSellTotal } from '../../selectors/sell-orders';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

/* jshint ignore:start */

export default connect(({
  tokens,
  selectedMarket,
  orders,
  tradeForMarket,
  pendingTrades,
  filledOrder,
  pendingCancels
}) => {
  const selected = tokens.find((v) => {
    return v.symbol === selectedMarket;
  }) || defaultToken;
  const tradeFor = tokens.find((v) => {
    return v.symbol === tradeForMarket;
  }) || defaultToken;
  return {
    selectedMarket: selected,
    tradeForMarket: tradeFor,
    filledOrder,
    orders: computeSellOrders({
      tokens,
      selectedMarket,
      orders,
      tradeForMarket,
      pendingTrades,
      pendingCancels
    }),
    total: computeSellTotal({
      tokens,
      selectedMarket,
      orders,
      tradeForMarket,
      pendingTrades,
      pendingCancels
    })
  };
}, (dispatch) => ({
  onSelectSell(order, evt) {
    const tr = findTR(evt.target);
    dispatch({
      type: 'LOAD_SELL_FROM_TABLE',
      payload: {
        price: order.priceRational.toDecimal(),
        rational: order.priceRational,
        give: order.sellRational.toDecimal(),
        get: order.buyRational.toDecimal()
      }
    });
  }
}))(SellOrders);

/* jshint ignore:end */
