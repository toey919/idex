"use strict";

import clone from 'clone';
import BigRational from 'big-rational';
import BigNumber from 'big-number';
import uniqBy from 'lodash/uniqBy';

export default {
  key: 'orders',
  defaultValue: [],
  inject: {
    loader: true,
    reloadable: true,
    updateBy: 'txHash'
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'PUSH_TRADES':
        (action.payload || []).forEach(u => {
          const i = state.findIndex(v => v.hash === u.hash);
          if (~i) {
            if (BigRational(state[i].amountGetRemaining || state[i].amountGet).leq(BigRational(u.amountGet))) {
              state = state.slice(0, i).concat(state.slice(i + 1));
              return;
            }
            try {
              const newOrder = clone(state[i]);
              const lastAmt = BigNumber(newOrder.amountGetRemaining || newOrder.amountGet);
              const lastAmtMutative = BigNumber(lastAmt);
              const amountGetRemaining = lastAmtMutative.minus(BigNumber(u.amountGet));
              const amountGetRemainingMutative = BigNumber(amountGetRemaining);
              const amountGiveRemaining = amountGetRemainingMutative.multiply(BigNumber(newOrder.amountGiveRemaining || newOrder.amountGive)).div(lastAmt);
              newOrder.amountGetRemaining = amountGetRemaining.toString();
              newOrder.amountGiveRemaining = amountGiveRemaining.toString();
              state = state.slice(0, i).concat(newOrder).concat(state.slice(i + 1));
            } catch (e) { console.log(e.stack); }
          }
        });
        break;
      case 'PUSH_CANCELS':
        (action.payload || []).forEach(u => {
          const i = state.findIndex(v => v.hash === u.hash);
          if (~i) state = state.slice(0, i).concat(state.slice(i + 1));
        });
        break;
      case 'PUSH_ORDERS':
        return state.concat(action.payload);
      case 'POLL_UPDATE':
        if (action.payload.block && state.find(v => BigRational(action.payload.block).gt(v.expires))) state = state.filter(v => BigRational(v.expires).gt(action.payload.block));
//        state = action.payload.orders && uniqBy(action.payload.orders, 'hash').filter(v => !state.find(u => v.hash === u.hash)).concat(state) || state;
        state = action.payload.orders && action.payload.orders.concat(state) || state;
        (action.payload.trades || []).forEach(u => {
          const i = state.findIndex(v => v.hash === u.hash);
          console.log(i);
          if (~i) {
            if (BigRational(state[i].amountGetRemaining || state[i].amountGet).leq(BigRational(u.amountGet))) {
              state = state.slice(0, i).concat(state.slice(i + 1));
              return;
            }
            try {
              const newOrder = clone(state[i]);
              const lastAmt = BigNumber(newOrder.amountGetRemaining || newOrder.amountGet);
              const lastAmtMutative = BigNumber(lastAmt);
              const amountGetRemaining = lastAmtMutative.minus(BigNumber(u.amountGet));
              const amountGetRemainingMutative = BigNumber(amountGetRemaining);
              const amountGiveRemaining = amountGetRemainingMutative.multiply(BigNumber(newOrder.amountGiveRemaining || newOrder.amountGive)).div(lastAmt);
              newOrder.amountGetRemaining = amountGetRemaining.toString();
              newOrder.amountGiveRemaining = amountGiveRemaining.toString();
              state = state.slice(0, i).concat(newOrder).concat(state.slice(i + 1));
            } catch (e) { console.log(e.stack); }
          }
        });
        (action.payload.cancels || []).forEach(u => {
          const i = state.findIndex(v => v.hash === u.hash);
          if (~i) state = state.slice(0, i).concat(state.slice(i + 1));
        });
        if (action.payload.invalidOrder) console.log(action.payload.invalidOrder);
        (action.payload.invalidOrder || []).forEach((v) => {
          const i = state.findIndex((u) => u.hash === v.hash);
          if (~i) {
            const newOrder = clone(state[i]);
            newOrder.invalid = true;
            state = state.slice(0, i).concat(newOrder).concat(state.slice(i + 1));
          }
        });
        return state;
    }
    return state;
  }
};
