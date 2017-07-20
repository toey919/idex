'use strict';

import { getState, dispatch, subscribeToEvent, subscribeToState } from '../store';
import escapeRegExp from 'escape-regexp';
import pow from '../lib/pow';
import difference from 'lodash/difference';
import setImmediate from '../lib/set-immediate';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
const { floor } = Math;
const { now } = Date;

function ln(v) { console.log(v); return v; }

const supportedResolutions = ['1', '5', '15', '30', '60', '120', '360', '1D', '1W'];

const onReady = (callback) => {
  const { tokens } = getState();
  const callReady = () => {
    callback({
      exchanges: [],
      symbols_types: [],
      supported_resolutions: supportedResolutions,
      supportedResolutions,
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true
    });
    dispatch({
      type: 'LOAD_CHART_DEPLOYED',
      payload: true
    });
  };
  if (tokens.length) return setImmediate(callReady);
  const unsubscribe = subscribeToEvent('POLL_UPDATE', () => {
    callReady();
    unsubscribe();
  });
};
const searchSymbolsByName = (userInput, exchange, symbolType, onResultReadyCallback) => {
  setImmediate(() => {
    onResultReadyCallback(getState().tokens.filter(v => RegExp(escapeRegExp(userInput.replace(/IDEX:\s*/, '')).replace(/\\\*/g, '(?:.*?)')).test(v.symbol + ' ' + v.name)).map(v => {
      const { symbol, name: full_name } = v;
      return {
        symbol,
        full_name,
        exchange: full_name,
        ticker: symbol,
        type: 'index',
        description: ''
      };
    }));
  });
};

const toSymbolInfo = (token) => {
  const { symbol: ticker, name: description } = token;
  return {
    ticker,
    name: 'IDEX: ' + ticker.toUpperCase(),
    description,
    session: '24x7',
    exchange: 'IDEX',
    timezone: 'UTC',
    minmov: 1,
    pricescale: 100,
    fractional: true,
    minmove2: 0,
    has_intraday: true,
    intraday_multipliers: ['1'],
    has_seconds: true,
    seconds_multipliers: ['1'],
    has_daily: false,
    has_weekly_and_monthly: false,
    has_empty_bars: true,
    force_session_rebuild: false,
    has_no_volume: false,
    volume_precision: 2,
    data_status: 'pulsed',
    expired: false,
    currency_code: ticker
  };
};

const resolveSymbol = (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
  setImmediate(() => {
    const token = getState().tokens.find(v => v.symbol.toUpperCase() === symbolName.toUpperCase());
    if (!token) return onResolveErrorCallback(Error('No symbol found by name ' + symbolName + '.'));
    return onSymbolResolvedCallback(toSymbolInfo(token));
  });
};

const yearsRe = /(\d*)Y$/i,
      weeksRe = /(\d*)W$/i,
      monthsRe = /(\d*)M$/i,
      daysRe = /(\d*)D$/i,
      hoursRe = /(\d*)H$/i,
      secondsRe = /(\d*)S$/i;

const resolutionToInterval = (s) => {
  let parts;
  if ((parts = daysRe.exec(s))) return 1000*60*60*24*(+(parts[1] || 1));
  if ((parts = weeksRe.exec(s))) return 1000*60*60*24*7*(+(parts[1] || 1));
  if ((parts = monthsRe.exec(s))) return 1000*60*60*24*30*(+(parts[1] || 1));
  if ((parts = hoursRe.exec(s))) return 1000*60*60*(+(parts[1] || 1));
  if ((parts = secondsRe.exec(s))) return 1000*(+(parts[1] || 1));
  return 1000*60*(+s);
};

const getBars = (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
  const { tokens, selectedMarket, tradeForMarket, pricedTrades: trades } = getState();
  const decimals = tokens.map(v => v.decimals);
  const selectedIndex = tokens.findIndex(v => v.symbol === selectedMarket),
        tradeForIndex = tokens.findIndex(v => v.symbol === symbolInfo.ticker),
        selectedToken = tokens[selectedIndex],
        tradeForToken = tokens[tradeForIndex],
        selectedDecimals = decimals[selectedIndex] || 0,
        tradeForDecimals = decimals[tradeForIndex] || 0;
  const { address: selectedAddress } = selectedToken;
  const { address: tradeForAddress } = tradeForToken;
  const isSell = (v) => v && v.tokenGive === tradeForAddress;
  const priceOf = (v) => v && (isSell(v) && v.sellPrice.toDecimal() || v.buyPrice.toDecimal());
  const tradesFiltered = trades.filter(v => ((v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress || v.tokenGive === selectedAddress && v.tokenGet === tradeForAddress) && !BigNumber(v.amountGive).equals(0) && !BigNumber(v.amountGet).equals(0)));
  from *= 1000;
  to *= 1000;
  if (firstDataRequest) to = now();
  const interval = resolutionToInterval(resolution);
  const barForInterval = (start, end) => {
    const selectedTrades = tradesFiltered.filter(v => +new Date(v.time) >= start && +new Date(v.time) <= end);
    if (!selectedTrades.length) return null;
    const open = +priceOf(selectedTrades[selectedTrades.length - 1]);
    const close = +priceOf(selectedTrades[0]);
    const time = +new Date(selectedTrades[0].time);
    const volume = +(selectedTrades.map(v => isSell(v) && BigRational(v.amountGive) || BigRational(v.amountGet)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, tradeForDecimals)).toDecimal());
    const selectedTradesSorted = selectedTrades.map(priceOf).sort((a, b) => +BigRational(b).minus(BigRational(a)));
    const high = +selectedTradesSorted[0];
    const low = +selectedTradesSorted[(selectedTradesSorted.length || 1) - 1];
    return {
      time,
      close,
      open,
      high,
      low,
      volume
    };
  };
  const firstAfterInterval = trades.slice().reverse().find((v) => {
    return +new Date(v.time) >= from;
  });
  let earliest;
  if (firstAfterInterval) earliest = +new Date(firstAfterInterval.time);
  (function genIntervals(start, end, cb, accum, depth) {
    if (!accum) accum = [];
    if (depth === undefined) depth = 0;
    const next = () => {
      if (end >= to) return cb(accum.concat(barForInterval(start, to) || []));
      genIntervals(start + interval, end + interval, cb, accum.concat(barForInterval(start, end) || []), depth !== 1000 && depth + 1 || 0);
    };
    if (depth === 1000) setImmediate(next);
    else next();
  })((earliest || from), (earliest || from) + interval, (bars) => {
    let meta = { noData: false };
    if (!bars.length) {
      if (!trades.find(v => +new Date(v.time) <= from)) {
        meta.noData = true;
      }
      const lastTradeBeforeIndex = trades.findIndex(v => +new Date(v.time) <= +new Date(to));
      if (~lastTradeBeforeIndex && trades[lastTradeBeforeIndex + 1]) {
        meta.nextTime = floor(+new Date(trades[lastTradeBeforeIndex + 1].time) / 1000);
      }
    }
    onHistoryCallback(bars, meta);
  });
};

const subscribers = [];

const subscribeBars = (symbolInfo, resolution, onRealtimeCallbackStub, subscriberUID, onResetCacheNeededCallback) => {
  setImmediate(() => {
    const interval = resolutionToInterval(resolution);
    const start = now() - (now() % interval);
    const onRealtimeCallback = (bar) => {
      onRealtimeCallbackStub(bar);
//      onResetCacheNeededCallback();
    };
    let currentInterval = start, nextInterval = start + interval;
    let subscribedTrades = getState().pricedTrades.filter((v) => {
      return +new Date(v.time) > start;
    });
    let timer;
    const clearSchedule = () => {
      if (timer) clearTimeout(timer);
    };
    const unsubscribeFn = subscribeToState((() => {
      let afterFirst = false;
      return (lastState, currentState) => {
        if (!currentState.tokens.length) return;
        const decimals = currentState.tokens.map(v => v.decimals);
        const selectedIndex = currentState.tokens.findIndex(v => v.symbol === currentState.selectedMarket),
              tradeForIndex = currentState.tokens.findIndex(v => v.symbol === symbolInfo.ticker),
              selectedToken = currentState.tokens[selectedIndex],
              tradeForToken = currentState.tokens[tradeForIndex],
              selectedDecimals = decimals[selectedIndex] || 0,
              tradeForDecimals = decimals[tradeForIndex] || 0;
        const { address: selectedAddress } = selectedToken;
        const { address: tradeForAddress } = tradeForToken;
        const scheduleNextBar = () => {
          timer = setTimeout(() => {
            if (subscribedTrades.length) onRealtimeCallback(barFor(subscribedTrades));
            subscribedTrades = [];
            timer = null;
            currentInterval = nextInterval;
            nextInterval = nextInterval + interval;
            scheduleNextBar();
          }, nextInterval - now());
        };
        const isSell = (v) => v && v.tokenGive === tradeForAddress;
        const priceOf = (v) => v && (isSell(v) && v.sellPrice.toDecimal() || v.buyPrice.toDecimal());
        const barFor = (selectedTrades) => {
          if (!selectedTrades.length) return null;
          const open = +priceOf(selectedTrades[selectedTrades.length - 1]);
          const close = +priceOf(selectedTrades[0]);
          const time = floor(+new Date(selectedTrades[0].time));
          const volume = +(selectedTrades.map(v => isSell(v) && BigRational(v.amountGive) || BigRational(v.amountGet)).reduce((r, v) => r.add(v), BigRational(0)).divide(pow(10, tradeForDecimals)).toDecimal());
          const selectedTradesSorted = selectedTrades.map(priceOf).sort((a, b) => +BigRational(b).minus(BigRational(a)));
          const high = +selectedTradesSorted[0];
          const low = +selectedTradesSorted[(selectedTradesSorted.length || 1) - 1];
          return {
            time,
            close,
            open,
            high,
            low,
            volume
          };
        };
        let newTrades = difference(currentState.pricedTrades, lastState.pricedTrades).filter((v) => ((v.tokenGet === selectedAddress && v.tokenGive === tradeForAddress || v.tokenGive === selectedAddress && v.tokenGet === tradeForAddress) && +new Date(v.time) > currentInterval));
        subscribedTrades = newTrades.concat(subscribedTrades);
        if (newTrades.length) {
          console.log(barFor(subscribedTrades));
          onRealtimeCallback(barFor(subscribedTrades));
        } else if (!afterFirst) {
          afterFirst = true;
          scheduleNextBar();
        }
      };
    })());
    const unsubscribe = () => {
      unsubscribeFn();
      clearSchedule();
    };
    subscribers.push({
      unsubscribe,
      subscriberUID
    });
  });
};

const unsubscribeBars = (subscriberUID) => {
  const i = subscribers.findIndex(v => v.subscriberUID === subscriberUID);
  if (~i) {
    subscribers[i].unsubscribe();
    subscribers.splice(i, 1);
  }
};

const getServerTime = (cb) => {
  setImmediate(() => cb(floor(now() / 1000)));
};

const calculateHistoryDepth = () => undefined;

export default {
  onReady,
  searchSymbolsByName,
  resolveSymbol,
  getBars,
  subscribeBars,
  unsubscribeBars,
  getServerTime,
  calculateHistoryDepth
};
