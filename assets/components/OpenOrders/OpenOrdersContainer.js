"use strict";

import { connect } from 'react-redux';
import OpenOrders from './OpenOrdersComponent';
import BigRational from 'big-rational';
import moment from 'moment';
import findTR from '../../lib/find-tr';
import { cancel } from '../../client';
import pow from '../../lib/pow';


const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

const reciprocal = (br) => br.reciprocate();
const ln = (v) => { console.log(v); return v; };

const noop = (v) => v;

/* jshint ignore:start */

export default connect(({
  tokens,
  orders,
  selectedMarket,
  selectedAccount,
  openOrdersMinimized,
  pendingTrades,
  pendingCancels,
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
  const ordersFiltered = orders.filter((v) => (v.user.toLowerCase() === selectedAccount.toLowerCase() && (v.tokenSell === selectedAddress && v.tokenBuy === tradeForAddress || v.tokenBuy === selectedAddress && v.tokenSell === tradeForAddress)))
    .filter(v => !pendingCancels.find(u => v.hash === u.hash))
    .map(v => {
      const pendingTradesForOrder = pendingTrades.filter(u => v.hash === u.hash);
      const pendingAmountGet = pendingTradesForOrder.map(v => v.amount).reduce((r, v) => (r.add(v)), BigRational(0)).toDecimal();
      const pendingAmountGive = pendingTradesForOrder.map(v => v.amountSellAdjusted).reduce((r, v) => (r.add(v)), BigRational(0)).toDecimal();
      return {
        ...v,
        pendingAmountGet,
        pendingAmountGive
      };
    })
    .map(v => {
      let type = v.tokenBuy === selectedAddress && 'Sell' || 'Buy';
      const pendingAmountGet = pendingTrades
      return {
        ...v,
        type,
        isSell: type === 'Sell'
      }
    })
    .map(v => {
      v.price = (v.amountBuy != "0" && v.amountSell != "0" && (v.isSell && noop || reciprocal)(BigRational(v.amountBuy).divide(v.isSell && pow(10, selectedDecimals) || pow(10, tradeForDecimals)).divide(BigRational(v.amountSell).divide(v.isSell && pow(10, tradeForDecimals) || pow(10, selectedDecimals)))) || { toDecimal: () => 'N/A' }).toDecimal();
      v.amount = BigRational(v.isSell && BigRational(v.amountSellRemaining || v.amountSell).minus(v.pendingAmountGive).toDecimal() || BigRational(v.amountBuyRemaining || v.amountBuy).minus(v.pendingAmountGet).toDecimal()).divide(pow(10, tradeForDecimals)).toDecimal();
      v.total = BigRational(v.isSell && BigRational(v.amountBuyRemaining || v.amountBuy).minus(v.pendingAmountGet).toDecimal() || BigRational(v.amountSellRemaining || v.amountSell).minus(v.pendingAmountGive).toDecimal()).divide(pow(10, selectedDecimals)).toDecimal();
      v.date = moment(new Date(v.createdAt)).format('DD-MM-YY HH:mm:ss');
      return v;
    });
  return {
    selectedMarket: selectedToken,
    orders: ordersFiltered,
    isHidden: openOrdersMinimized,
    tradeForMarket: tradeForToken
  };
}, (dispatch) => ({
  onToggle(evt) {
    evt.preventDefault();
    dispatch({
      type: 'TOGGLE_OPEN_ORDERS_MINIMIZED'
    });
  },
  onCancel(hash, evt) {
    dispatch({
      type: 'DISPATCH_CANCEL'
    });
    cancel(hash).then((v) => {
      dispatch({
        type: 'CANCEL_SUBMITTED'
      });
    }).catch((err) => {
      dispatch({
        type: 'CANCEL_ERROR',
        payload: err.message
      });
    });
  }
}))(OpenOrders);

/* jshint ignore:end */
