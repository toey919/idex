'use strict';

import BigRational from 'big-rational';
import BigNumber from 'big-number';
import clone from 'clone';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

export default ({
  subscribeToEvent,
  dispatch
}) => {
  const { mutexDispatch } = dispatch;
  subscribeToEvent('SELECT_BUY_PRICE', (_, {
    tokens,
    selectedMarket,
    tradeForMarket,
    orders
  }) => {
    const selectedIndex = tokens.findIndex((v) => {
      return v.symbol === selectedMarket;
    });
    const selected = tokens[selectedIndex] || defaultToken;
    const tradeForIndex = tokens.findIndex((v) => {
      return v.symbol === tradeForMarket;
    });
    const tradeFor = tokens[tradeForIndex] || defaultToken;
    const {
      address: selectedAddress,
      decimals: selectedDecimals
    } = selected;
    const {
      address: tradeForAddress,
      decimals: tradeForDecimals
    } = tradeFor;
    const selectedFactor = BigNumber(10).pow(selectedDecimals);
    const tradeForFactor = BigNumber(10).pow(tradeForDecimals);
    const ordersFiltered = orders.filter(v => !v.invalid).filter(v => {
      return (BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress);
    }).map((v) => clone(v)).map((v) => {
      v.priceRational = BigRational(v.amountGet).divide(selectedFactor).divide(BigRational(v.amountGive).divide(tradeForFactor));
      v.price = v.priceRational.toDecimal();
      return v;
    }).sort((a, b) => {
      if (b.priceRational.lt(a.priceRational)) return -1;
      if (b.priceRational.eq(a.priceRational)) return 0;
      return 1;
    });
    if (ordersFiltered[0]) {
      dispatch({
        type: 'LOAD_BUY_PRICE',
        payload: ordersFiltered[0].price
      });
      dispatch({
        type: 'LOAD_BUY_PRICE_RATIONAL',
        payload: ordersFiltered[0].priceRational
      });
    }
  });
  subscribeToEvent('SELECT_BUY_AMOUNT', (_, {
    tokens,
    selectedMarket,
    tradeForMarket,
    exchangeBalances,
    selectedAccount,
    orders
  }) => {
    const selectedIndex = tokens.findIndex((v) => {
      return v.symbol === selectedMarket;
    });
    const selected = tokens[selectedIndex] || defaultToken;
    const tradeForIndex = tokens.findIndex((v) => {
      return v.symbol === tradeForMarket;
    });
    const tradeFor = tokens[tradeForIndex] || defaultToken;
    const {
      address: selectedAddress,
      decimals: selectedDecimals
    } = selected;
    const {
      address: tradeForAddress,
      decimals: tradeForDecimals
    } = tradeFor;
    const selectedFactor = BigNumber(10).pow(selectedDecimals);
    const tradeForFactor = BigNumber(10).pow(tradeForDecimals);
    const ordersFiltered = orders.filter(v => !v.invalid).filter(v => {
      return (BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress);
    }).map((v) => clone(v)).map((v) => {
      v.amountGetPrecision = BigRational(v.amountGet).divide(selectedFactor);
      v.amountGetRemainingPrecision = v.amountGetRemaining && BigRational(v.amountGetRemaining).divide(selectedFactor);
      v.amountGivePrecision = BigRational(v.amountGive).divide(tradeForFactor);
      v.amountGiveRemainingPrecision = v.amountGiveRemaining && BigRational(v.amountGiveRemaining).divide(tradeForFactor);
      v.priceRational = v.amountGetPrecision.divide(v.amountGivePrecision);
      v.price = v.priceRational.toDecimal();
      return v;
    }).sort((a, b) => {
      if (b.priceRational.lt(a.priceRational)) return 1;
      if (b.priceRational.eq(a.priceRational)) return 0;
      return -1;
    });
    if (ordersFiltered[0]) {
      let total;
      let balance = BigNumber(exchangeBalances[selectedIndex]).minus(orders.filter((v) => v.user === selectedAccount && v.tokenGive === selectedAddress).reduce((r, v) => r.add(v.amountGiveRemaining || v.amountGive), BigNumber(0)));
      if (BigNumber(balance).lt(ordersFiltered[0].amountGetRemaining || ordersFiltered[0].amountGet)) {
        total = BigRational(balance).divide(selectedFactor).toDecimal();
      } else total = (ordersFiltered[0].amountGetRemainingPrecision || ordersFiltered[0].amountGetPrecision).toDecimal();
      dispatch({
        type: 'LOAD_BUY_PRICE',
        payload: ordersFiltered[0].price
      });
      dispatch({
        type: 'LOAD_BUY_PRICE_RATIONAL',
        payload: ordersFiltered[0].priceRational
      });
      dispatch({
        type: 'LOAD_BUY_TOTAL',
        payload: total
      });
    }
  });
  subscribeToEvent('SELECT_BUY_TOTAL', (_, {
    tokens,
    selectedMarket,
    exchangeBalances,
    selectedAccount,
    orders
  }) => {
    const selectedIndex = tokens.findIndex((v) => {
      return v.symbol === selectedMarket;
    });
    const selected = tokens[selectedIndex] || defaultToken;
    const {
      address: selectedAddress,
      decimals: selectedDecimals
    } = selected;
    const selectedFactor = BigNumber(10).pow(selectedDecimals);
    dispatch({
      type: 'LOAD_BUY_TOTAL',
      payload: BigRational(BigNumber(exchangeBalances[selectedIndex]).minus(orders.filter((v) => {
        return v.user.toLowerCase() === selectedAccount && v.tokenGive === selectedAddress;
      }).reduce((r, v) => r.add(v.amountGiveRemaining || v.amountGive), BigNumber(0)))).divide(selectedFactor).toDecimal()
    });
  });
  subscribeToEvent('SELECT_SELL_PRICE', (_, {
    tokens,
    selectedMarket,
    tradeForMarket,
    orders
  }) => {
    const selectedIndex = tokens.findIndex((v) => {
      return v.symbol === selectedMarket;
    });
    const selected = tokens[selectedIndex] || defaultToken;
    const tradeForIndex = tokens.findIndex((v) => {
      return v.symbol === tradeForMarket;
    });
    const tradeFor = tokens[tradeForIndex] || defaultToken;
    const {
      address: selectedAddress,
      decimals: selectedDecimals
    } = selected;
    const {
      address: tradeForAddress,
      decimals: tradeForDecimals
    } = tradeFor;
    const selectedFactor = BigNumber(10).pow(selectedDecimals);
    const tradeForFactor = BigNumber(10).pow(tradeForDecimals);
    const ordersFiltered = orders.filter(v => !v.invalid).filter(v => {
      return (BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === tradeForAddress && v.tokenGive === selectedAddress);
    }).map((v) => clone(v)).map((v) => {
      v.priceRational = BigRational(v.amountGive).divide(selectedFactor).divide(BigRational(v.amountGet).divide(tradeForFactor));
      v.price = v.priceRational.toDecimal();
      return v;
    }).sort((a, b) => {
      if (b.priceRational.lt(a.priceRational)) return 1;
      if (b.priceRational.eq(a.priceRational)) return 0;
      return -1;
    });
    if (ordersFiltered[0]) {
      dispatch({
        type: 'LOAD_SELL_PRICE',
        payload: ordersFiltered[0].price
      });
      dispatch({
        type: 'LOAD_SELL_PRICE_RATIONAL',
        payload: ordersFiltered[0].priceRational
      });
    }
  });
  subscribeToEvent('SELECT_SELL_AMOUNT', (_, {
    tokens,
    tradeForMarket,
    selectedAccount,
    exchangeBalances,
    orders
  }) => {
    const tradeForIndex = tokens.findIndex((v) => {
      return v.symbol === tradeForMarket;
    });
    const tradeFor = tokens[tradeForIndex] || defaultToken;
    const {
      address: tradeForAddress,
      decimals: tradeForDecimals
    } = tradeFor;
    const tradeForFactor = BigNumber(10).pow(tradeForDecimals);
    dispatch({
      type: 'LOAD_SELL_AMOUNT',
      payload: BigRational(BigNumber(exchangeBalances[tradeForIndex]).minus(orders.filter((v) => {
        return v.user.toLowerCase() === selectedAccount.toLowerCase() && v.tokenGive === tradeForAddress;
      }).reduce((r, v) => r.add(v.amountGiveRemaining || v.amountGive), BigNumber(0)))).divide(tradeForFactor).toDecimal()
    });
  });
  subscribeToEvent('SELECT_SELL_TOTAL', (_, {
    tokens,
    selectedMarket,
    selectedAccount,
    tradeForMarket,
    exchangeBalances,
    orders
  }) => {
    const selectedIndex = tokens.findIndex((v) => {
      return v.symbol === selectedMarket;
    });
    const selected = tokens[selectedIndex] || defaultToken;
    const tradeForIndex = tokens.findIndex((v) => {
      return v.symbol === tradeForMarket;
    });
    const tradeFor = tokens[tradeForIndex] || defaultToken;
    const {
      address: selectedAddress,
      decimals: selectedDecimals
    } = selected;
    const {
      address: tradeForAddress,
      decimals: tradeForDecimals
    } = tradeFor;
    const selectedFactor = BigNumber(10).pow(selectedDecimals);
    const tradeForFactor = BigNumber(10).pow(tradeForDecimals);
    const ordersFiltered = orders.filter(v => !v.invalid).filter(v => {
      return (BigRational(v.amountGet).neq(0) && BigRational(v.amountGive).neq(0)) && (!v.amountGetRemaining || BigRational(v.amountGetRemaining).neq(0)) && (v.tokenGet === tradeForAddress && v.tokenGive === selectedAddress);
    }).map((v) => clone(v)).map((v) => {
      v.amountGetPrecision = BigRational(v.amountGet).divide(tradeForFactor);
      v.amountGetRemainingPrecision = v.amountGetRemaining && BigRational(v.amountGetRemaining).divide(tradeForFactor);
      v.amountGivePrecision = BigRational(v.amountGive).divide(selectedFactor);
      v.amountGiveRemainingPrecision = v.amountGiveRemaining && BigRational(v.amountGiveRemaining).divide(selectedFactor);
      v.priceRational = v.amountGivePrecision.divide(v.amountGetPrecision);
      v.price = v.priceRational.toDecimal();
      return v;
    }).sort((a, b) => {
      if (b.priceRational.lt(a.priceRational)) return 1;
      if (b.priceRational.eq(a.priceRational)) return 0;
      return -1;
    });
    if (ordersFiltered[0]) {
      let total;
      let balance = BigNumber(exchangeBalances[tradeForIndex]).minus(orders.filter((v) => v.user === selectedAccount && v.tokenGive === tradeForAddress).reduce((r, v) => r.add(v.amountGiveRemaining || v.amountGive), BigNumber(0)));
      if (BigNumber(balance).lt(ordersFiltered[0].amountGetRemaining || ordersFiltered[0].amountGet)) {
        total = BigRational(balance).divide(tradeForFactor).toDecimal();
      } else total = (ordersFiltered[0].amountGetRemainingPrecision || ordersFiltered[0].amountGetPrecision).toDecimal();
      dispatch({
        type: 'LOAD_SELL_PRICE',
        payload: ordersFiltered[0].price
      });
      dispatch({
        type: 'LOAD_SELL_PRICE_RATIONAL',
        payload: ordersFiltered[0].priceRational
      });
      dispatch({
        type: 'LOAD_SELL_AMOUNT',
        payload: total
      });
    }
  });
};
