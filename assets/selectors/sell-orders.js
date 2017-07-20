'use strict';

import { createSelector } from 'reselect';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import isNullOrUndefined from '../lib/is-null-or-undefined';
import { rationalPrecision } from '../fixtures';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

/* jshint ignore:start */

export const computeSellOrders = createSelector([
  ({ tokens }) => tokens,
  ({ selectedMarket }) => selectedMarket,
  ({ orders }) => orders,
  ({ pendingTrades }) => pendingTrades,
  ({ pendingCancels }) => pendingCancels,
  ({ tradeForMarket }) => tradeForMarket
], (tokens, selectedMarket, orders, pendingTrades, pendingCancels, tradeForMarket) => {
  const selected = tokens.find((v) => {
    return v.symbol.toLowerCase() === selectedMarket.toLowerCase();
  }) || defaultToken;
  const tradeFor = tokens.find((v) => {
    return v.symbol.toLowerCase() === tradeForMarket.toLowerCase();
  }) || defaultToken;
  const {
    address: tradeForAddress,
    decimals: tradeForDecimals
  } = tradeFor;
  const {
    address: selectedAddress,
    decimals: selectedDecimals
  } = selected;
  const selectedFactor = BigNumber(10).pow(selectedDecimals || 0);
  const tradeForFactor = BigNumber(10).pow(tradeForDecimals || 0);
  const ordersFormat = orders
          .filter(v => !v.invalid)
          .filter(v => v.tokenSell === tradeForAddress && v.tokenBuy === selectedAddress)
          .filter(v => !pendingCancels.find(u => v.hash === u.hash))
          .map(v => {
            const { hash } = v;
            const pendingTradesForOrder = pendingTrades.filter(u => u.hash === v.hash);
            const pendingAmountGet = pendingTradesForOrder.map(v => v.amount).reduce((r, v) => (r.add(BigNumber(v))), BigNumber(0)).toString();
            const pendingAmountGive = pendingTradesForOrder.map(v => v.amountSellAdjusted).reduce((r, v) => (r.add(BigNumber(v))), BigNumber(0)).toString();
            return {
              ...v,
              pendingAmountGet,
              pendingAmountGive
            };
          })
          .filter(v => ((!v.amountBuyRemaining || !BigNumber(v.amountBuyRemaining).minus(v.pendingAmountGet).equals(0)) && !BigNumber(v.amountBuy).minus(BigNumber(v.pendingAmountGet)).equals(0) && !BigNumber(v.amountSell).minus(BigNumber(v.pendingAmountGive)).equals(0) && (!v.amountSellRemaining || !BigNumber(v.amountSellRemaining).minus(BigNumber(v.pendingAmountGive)).equals(0))))
          .map(v => {
            let priceRational = !isNullOrUndefined(selectedDecimals) && !isNullOrUndefined(tradeForDecimals) && BigRational(BigNumber(v.amountBuy)).divide(selectedFactor).divide(BigRational(BigNumber(v.amountSell)).divide(tradeForFactor)) || BigRational(0);
            let buyRational = BigRational(BigNumber(v.amountBuyRemaining || v.amountBuy).minus(v.pendingAmountGet)).divide(selectedFactor);
            let sellRational = BigRational(BigNumber(v.amountSellRemaining || v.amountSell).minus(v.pendingAmountGive)).divide(tradeForFactor);
            return {
              ...v,
              priceRational,
              price: priceRational.eq(0) && 'N/A' || priceRational.toDecimal(rationalPrecision),
              buyRational,
              buy: buyRational.toDecimal(rationalPrecision),
              sellRational,
              sell: sellRational.toDecimal(rationalPrecision)
            };
          })
          .sort((a, b) => !(a.price === 'N/A' || b.price === 'N/A') && (BigRational(b.price).lt(BigRational(a.price)) && 1 || BigRational(b.price).gt(BigRational(a.price)) && -1 || BigRational(a.price).eq(BigRational(b.price)) && 0 || 0))
          .map((() => {
            let sum = BigRational(0);
            return (v) => ({
              ...v,
              sum: (sum = sum.add(BigRational(v.buy))).toDecimal()
            })
          })());
  return ordersFormat;
});

export const computeSellTotal = createSelector([
  computeSellOrders,
  ({ tokens }) => tokens,
  ({ tradeForMarket }) => tradeForMarket
], (orders, tokens, tradeForMarket) => {
  const tradeFor = tokens.find((v) => v.symbol.toLowerCase() === tradeForMarket.toLowerCase()) || defaultToken;
  const {
    decimals: tradeForDecimals
  } = tradeFor;
  const tradeForFactor = BigNumber(10).pow(tradeForDecimals || 0);
  return typeof tradeForDecimals === 'number' && BigRational(orders.reduce((r, v) => r.add(v.amountSellRemaining || v.amountSell), BigNumber(0))).divide(tradeForFactor).toDecimal() || 'Loading';
});

/* jshint ignore:end */
