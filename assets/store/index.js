'use strict'

/*
 * RAY this code basically extends and overrides the default Redux' store behaviour, as I see it.
 * The normal Redux `subscribe` function is easy to screw up because you have to manually keep track of the last state tree and the current state tree. This seems simple but it becomes needlessly complex when you have dispatches within dispatches and subscribers get called from within subscribers. I add the following functions:
 *
 * subscribeToState(function (lastState, currentState) { // compare last tree to current tree })
 * subscribeToKey('someBranch', function (lastBranch, currentBranch) { // only gets fired when that particular key gets changed })
 * subscribeToEvent('SOME_EVENT', function (lastTree, currentTree) { // called when the event is dispatched })
 *
 * Each function returns an unsubscribe function.
 * There is also a subscribeToXXXOnce function which does the same thing but is only called once.
 *
 * Calling subscribers from within subscribers can be a source of unnecessary infinite recursion, so there is a mutex feature. Since Redux containers are passed in only the `dispatch` function, I decided to make a `dispatch.mutexDispatch` that can be called if you want to dispatch an event that only calls the reducers, and skips over the subscribers. Subscriptions can be tricky in Redux and also costly, so if you have an event you want to dispatch only for the direct effect on the state tree from the reducers, you can use `dispatch.mutexDispatch`
 */

const path = require('path-browserify')
window.path = path
import { combineReducers, createStore } from 'redux'
import Reducer from '../lib/reducer'
import reducers from './reducers'
import { loadState, saveSelectedAccount, saveState } from '../lib/localStorage'
import throttle from '../lib/throttle'
import BigRational from 'big-rational'
import BigNumber from 'big-number'
import isAllowed from '../lib/is-allowed'
import { rowEnterDuration } from '../fixtures'
import difference from 'lodash/difference'
import differenceBy from 'lodash/differenceBy'
import intersectionBy from 'lodash/intersectionBy'
import injectSubscribe from 'redux-advanced-subscribe'
import sortBy from 'lodash/sortBy'
import clone from 'clone'
const parse = require('path-parse')

const { keys, assign } = Object
const { isArray } = Array

const persistedState = loadState()

const defaultToken = {
	symbol: 'N/A',
	name: 'N/A',
	unselected: true
}

let { log } = console

log = log.bind(console)

/* RAY explain what all that mutex stuff is for.
 * Also the subscribeToKey and subscribeToEvent and subscribeToState are your own extensions to Redux, right?
 * Please eplain what they do. Maybe not here but in a separate readme in this directory. */
const generateStore = reducers => {
	let store = injectSubscribe(assign({}, createStore(combineReducers(keys(reducers).reduce((r, v) => (r[v] = Reducer(reducers[v]).getReducer()) && r, {})), persistedState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())))
	const { dispatch: oldDispatch } = store
	const { mutexDispatch: oldMutexDispatch, interrupt: oldInterrupt, setMutex: oldSetMutex, releaseMutex: oldReleaseMutex } = oldDispatch
	store.dispatch = evt => {
		console.log(evt)
		return oldDispatch(evt)
	}
	store.dispatch.setMutex = oldSetMutex
	store.dispatch.releaseMutex = oldReleaseMutex
	store.dispatch.interrupt = oldInterrupt
	store.dispatch.mutexDispatch = evt => {
		console.log(evt)
		return oldMutexDispatch(evt)
	}
	return store
}

const store = generateStore(reducers)
const { getState, dispatch, subscribe, subscribeToKey, subscribeToState, subscribeToEvent, subscribeToEventOnce } = store
const { mutexDispatch } = dispatch

subscribe(
	throttle(2000)(() => {
		const { selectedAccount, timestamp, ethereumRPC, tokens, lastBlock, changes, tradeForMarket, selectedMarket, gas, multiplier, accounts, exchangeBalances, balances, address, orders, trades, favorites, decimals, transactions, currentTransaction, highestOrderId, highestTradeId, highestCancelId, nonce, wallet, walletPassword, pendingTrades, pendingCancels, dontShow } = store.getState()
		saveState({
			dontShow,
			wallet,
			walletPassword,
			pendingTrades,
			pendingCancels,
			accounts,
			favorites,
			exchangeBalances,
			balances,
			decimals,
			address,
			transactions,
			highestOrderId,
			highestTradeId,
			highestCancelId,
			currentTransaction,
			lastBlock,
			orders,
			selectedAccount,
			timestamp,
			ethereumRPC,
			tokens,
			changes,
			trades,
			tradeForMarket,
			selectedMarket,
			multiplier,
			gas,
			nonce
		})
	})
)

/* jshint ignore:start */

const calcPricedTrades = (lastTree, currentTree) => {
	const newTrades = difference(currentTree.trades, lastTree.trades)
	if (newTrades.length) {
		const { tokens } = currentTree
		const decMap = tokens.reduce((r, v) => {
			r[v.address.toLowerCase()] = BigNumber(10).pow(v.decimals)
			return r
		}, {})
		const payload = newTrades.filter(v => !BigNumber(v.amountGet).equals(0) && !BigNumber(v.amountGive).equals(0)).map(v => {
			const amountGivePrecision = BigRational(v.amountGive).divide(decMap[v.tokenGive.toLowerCase()])
			const amountGetPrecision = BigRational(v.amountGet).divide(decMap[v.tokenGet.toLowerCase()])
			const buyPrice = amountGivePrecision.divide(amountGetPrecision)
			let sellPrice = BigRational(buyPrice)
			try {
				sellPrice = buyPrice.reciprocate()
			} catch (e) {}
			return {
				...v,
				buyPrice,
				sellPrice,
				amountGivePrecision,
				amountGetPrecision
			}
		})
		mutexDispatch({
			type: 'UNSHIFT_PRICED_TRADES',
			payload
		})
	}
}

const calcPricedPendingTrades = (lastTree, currentTree) => {
	const newTrades = difference(currentTree.pendingTrades, lastTree.pendingTrades)
	if (newTrades.length) {
		const { tokens } = currentTree
		const decMap = tokens.reduce((r, v) => {
			r[v.address.toLowerCase()] = BigNumber(10).pow(v.decimals)
			return r
		}, {})
		const payload = newTrades.filter(v => !BigNumber(v.amountGet).equals(0) && !BigNumber(v.amountGive).equals(0)).map(v => {
			const amountGivePrecision = BigRational(v.amountGive).divide(decMap[v.tokenGive.toLowerCase()])
			const amountPrecision = BigRational(v.amount).divide(decMap[v.tokenGet.toLowerCase()])
			const amountGiveAdjustedPrecision = BigRational(v.amountGiveAdjusted).divide(decMap[v.tokenGive.toLowerCase()])
			const amountGetPrecision = BigRational(v.amountGet).divide(decMap[v.tokenGet.toLowerCase()])
			const buyPrice = amountGivePrecision.divide(amountGetPrecision)
			const sellPrice = buyPrice.reciprocate()
			return {
				...v,
				buyPrice,
				sellPrice,
				amountGivePrecision,
				amountGiveAdjustedPrecision,
				amountGetPrecision,
				amountPrecision
			}
		})
		mutexDispatch({
			type: 'PUSH_PRICED_PENDING_TRADES',
			payload
		})
	}
}

/*
const calcPricedOrders = (lastTree, currentTree) => {
  const newOrders = differenceBy(currentTree.orders, lastTree.orders, 'hash');
  const differentOrders = difference(currentTree.orders, lastTree.orders);
  const updatedOrders = intersectionBy(difference(currentTree.orders, lastTree.orders), lastTree.orders, 'hash');
  const removedOrders = differenceBy(lastTree.orders, currentTree.orders, 'hash');
  let decMap;
  if (newOrders.length || updatedOrders.length)
    decMap = tokens.reduce((r, v) => {
      r[v.address.toLowerCase()] = BigNumber(10).pow(v.decimals);
      return r;
    }, {});
  if (newOrders.length) {
    const { tokens } = currentTree;
    const payload = newOrders.filter((v) => !BigNumber(v.amountGet).equals(0) && !BigNumber(v.amountGive).equals(0)).map((v) => {
      const amountGivePrecision = BigRational(v.amountGive).divide(decMap[v.tokenGive.toLowerCase()]);
      const amountGetPrecision = BigRational(v.amountGet).divide(decMap[v.tokenGet.toLowerCase()]);
      const buyPrice = amountGivePrecision.divide(amountGetPrecision);
      const sellPrice = buyPrice.reciprocate();
      let amountGiveRemainingPrecision, amountGetRemainingPrecision;
      if (v.amountGiveRemaining)
        amountGiveRemainingPrecision = BigRational(v.amountGiveRemaining).divide(decMap[v.tokenGive.toLowerCase()]);
      if (v.amountGetRemaining)
        amountGetRemainingPrecision = BigRational(v.amountGetRemaining).divide(decMap[v.tokenGive.toLowerCase()]);
      return {
        ...v,
        buyPrice,
        sellPrice,
        amountGivePrecision,
        amountGetPrecision,
        amountGiveRemainingPrecision,
        amountGetRemainingPrecision
      };
    });
    mutexDispatch({
      type: 'PUSH_PRICED_ORDERS',
      payload
    });
  }
  if (updatedOrders.length) {
    mutexDispatch({
      type: 'UPDATE_PRICED_ORDERS',
      payload: updatedOrders.map((v) => {
        const { amountGetRemaining, amountGiveRemaining } = v;
        let amountGetRemainingPrecision, amountGiveRemainingPrecision;
        if (amountGetRemaining) amountGetRemainingPrecision = BigRational(amountGetRemaining).divide(decMap[v.tokenGet.toLowerCase()]);
        if (amountGiveRemaining) amountGiveRemainingPrecision = BigRational(amountGiveRemaining).divide(decMap[v.tokenGive.toLowerCase()]);
        return assign(clone(v), {
          amountGetRemainingPrecision,
          amountGiveRemainingPrecision
        });
      })
    });
  }
  if (removedOrders.length) {
    mutexDispatch({
      type: 'REMOVED_PRICED_ORDERS',
      payload: removedOrders
    });
  }
};
*/

/*
subscribeToKey(['orders'], calcPricedOrders);
*/
subscribeToKey(['trades'], calcPricedTrades)
subscribeToKey(['pendingTrades'], calcPricedPendingTrades)
subscribeToKey('pendingTrades', (lastPending, newPending) => {
	difference(lastPending, newPending).map(v => v.transactionHash).forEach(v => {
		dispatch({
			type: 'SPLICE_PRICED_PENDING',
			payload: v
		})
	})
})

const { orders, selectedMarket, tradeForMarket, trades, pendingTrades, tokens } = getState()

calcPricedTrades(
	{
		trades: []
	},
	{
		trades,
		tokens
	}
)

calcPricedPendingTrades(
	{
		pendingTrades: []
	},
	{
		pendingTrades,
		tokens
	}
)

/* jshint ignore:end */

/*
calcPricedOrders({
  orders: []
}, {
  orders,
  tokens
});
*/

subscribeToState((lastTree, currentTree) => {
	const { tradeForMarket, selectedMarket, tokens, buyPrice, buyTotal, sellPrice, sellTotal, buyAmount, sellAmount } = currentTree
	const { buyAmount: lastBuyAmount, buyPrice: lastBuyPrice, buyTotal: lastBuyTotal, sellAmount: lastSellAmount, sellPrice: lastSellPrice, sellTotal: lastSellTotal, tradeForMarket: lastTradeForMarket, selectedMarket: lastSelectedMarket } = lastTree
	if (buyPrice !== lastBuyPrice && buyAmount) {
		try {
			mutexDispatch({
				type: 'LOAD_BUY_TOTAL',
				payload: BigRational(buyPrice).multiply(BigRational(buyAmount)).toDecimal()
			})
		} catch (e) {}
	}
	if (buyAmount !== lastBuyAmount) {
		try {
			if (buyPrice)
				mutexDispatch({
					type: 'LOAD_BUY_TOTAL',
					payload: BigRational(buyPrice).multiply(BigRational(buyAmount)).toDecimal()
				})
			else
				mutexDispatch({
					type: 'LOAD_BUY_PRICE',
					payload: BigRational(buyTotal).divide(BigRational(buyAmount)).toDecimal()
				})
		} catch (e) {}
	}
	if (buyTotal !== lastBuyTotal) {
		try {
			if (buyPrice)
				mutexDispatch({
					type: 'LOAD_BUY_AMOUNT',
					payload: BigRational(buyTotal).divide(BigRational(buyPrice)).toDecimal()
				})
			else
				mutexDispatch({
					type: 'LOAD_BUY_PRICE',
					payload: BigRational(buyTotal).divide(BigRational(buyAmount)).toDecimal()
				})
		} catch (e) {}
	}
	if (sellPrice !== lastSellPrice && sellAmount) {
		try {
			mutexDispatch({
				type: 'LOAD_SELL_TOTAL',
				payload: BigRational(sellPrice).multiply(BigRational(sellAmount)).toDecimal()
			})
		} catch (e) {}
	}
	if (sellAmount !== lastSellAmount) {
		try {
			if (sellPrice)
				mutexDispatch({
					type: 'LOAD_SELL_TOTAL',
					payload: BigRational(sellPrice).multiply(BigRational(sellAmount)).toDecimal()
				})
			else
				mutexDispatch({
					type: 'LOAD_SELL_PRICE',
					payload: BigRational(sellTotal).divide(BigRational(sellAmount)).toDecimal()
				})
		} catch (e) {}
	}
	if (sellTotal !== lastSellTotal) {
		try {
			if (sellPrice)
				mutexDispatch({
					type: 'LOAD_SELL_AMOUNT',
					payload: BigRational(sellTotal).divide(BigRational(sellPrice)).toDecimal()
				})
			else
				mutexDispatch({
					type: 'LOAD_SELL_PRICE',
					payload: BigRational(sellTotal).divide(BigRational(sellAmount)).toDecimal()
				})
		} catch (e) {}
	}
	if (selectedMarket === tradeForMarket && selectedMarket !== lastSelectedMarket && tradeForMarket !== lastSelectedMarket && isAllowed(selectedMarket, lastSelectedMarket)) {
		dispatch({
			type: 'LOAD_TRADE_FOR_MARKET',
			payload: lastSelectedMarket
		})
	} else if (selectedMarket === tradeForMarket && tradeForMarket !== lastTradeForMarket && selectedMarket !== lastTradeForMarket && isAllowed(lastTradeForMarket, tradeForMarket)) {
		dispatch({
			type: 'LOAD_SELECTED_MARKET',
			payload: lastTradeForMarket
		})
	} else if (selectedMarket === tradeForMarket || tradeForMarket === 'N/A') {
		let idx,
			valid = tokens.filter(v => isAllowed(selectedMarket, v.symbol)),
			findval = valid.find((v, i) => ((idx = i), v.symbol === selectedMarket))
		if (findval)
			dispatch({
				type: 'LOAD_TRADE_FOR_MARKET',
				payload: (valid[(idx + 1) % valid.length] || defaultToken).symbol
			})
	}
})

subscribeToState((lastTree, currentTree) => {
	const { selectedMarket, tradeForMarket, tokens } = currentTree
	const allowed = tokens.filter(v => isAllowed(selectedMarket, v.symbol))
	if (!isAllowed(selectedMarket, tradeForMarket)) {
		dispatch.mutexDispatch({
			type: 'LOAD_TRADE_FOR_MARKET',
			payload: (allowed[0] || { symbol: 'N/A' }).symbol
		})
	}
})

/* jshint ignore:start */

subscribeToState((lastTree, currentTree) => {
	const { orders: lastOrders, pendingTrades: lastPendingTrades } = lastTree
	const { orders, pendingTrades } = currentTree
	const ordersMapped = orders
		.map(v => {
			return {
				...v
			}
		})
		.filter(v => {
			let last = lastOrders.find(u => v.hash === u.hash)
			if (last) {
				v.lastPending = String(
					BigNumber(last.amountGetRemaining || last.amountGet).minus(
						lastPendingTrades
							.filter(u => {
								return v.hash === u.hash
							})
							.reduce((r, v) => r.add(v.amount), BigNumber(0))
					)
				)
				v.pending = String(BigNumber(v.amountGetRemaining || v.amountGet).minus(pendingTrades.filter(u => v.hash === u.hash).reduce((r, v) => r.add(v.amount), BigNumber(0))))
			}
			return last
		})
		.filter(v => {
			return v.pending !== v.lastPending
		})
		.forEach(v => {
			dispatch({
				type: 'INITIATE_FILL_TRANSITION',
				payload: v.hash
			})
			setImmediate(() =>
				dispatch({
					type: 'PERFORM_FILL_TRANSITION',
					payload: v.hash
				})
			)
			setTimeout(
				() =>
					dispatch({
						type: 'REMOVE_FILL_TRANSITION',
						payload: v.hash
					}),
				rowEnterDuration
			)
		})
})

/* jshint ignore:end */

subscribeToEventOnce('POLL_UPDATE', (lastTree, currentTree) => {
	mutexDispatch({
		type: 'LOAD_TOKENS',
		payload: sortBy(currentTree.tokens.slice(), 'name')
	})
})

subscribeToEvent('LOAD_SELL_FROM_TABLE', (_, currentTree) => {
	const { tokens, buyTotal, exchangeBalances, selectedMarket, buyPriceRational } = currentTree

	const i = tokens.findIndex(v => v.symbol.toUpperCase() === selectedMarket.toUpperCase())
	const { decimals } = tokens[i]
	const balance = exchangeBalances[i]
	const factor = BigNumber(10).pow(decimals)
	if (~i && BigRational(buyTotal).multiply(factor).gt(balance))
		setImmediate(() => {
			mutexDispatch({
				type: 'LOAD_BUY_TOTAL',
				payload: BigRational(balance).divide(factor).toDecimal()
			})
			const { buyTotal: buyTotalNew } = getState()
			mutexDispatch({
				type: 'LOAD_BUY_AMOUNT',
				payload: BigRational(buyTotalNew).divide(buyPriceRational).toDecimal()
			})
		})
})

subscribeToEvent('LOAD_BUY_FROM_TABLE', (_, currentTree) => {
	const { tokens, sellAmount, sellPriceRational, exchangeBalances, tradeForMarket } = currentTree
	const i = tokens.findIndex(v => v.symbol.toUpperCase() === tradeForMarket.toUpperCase())
	const { decimals } = tokens[i]
	const balance = exchangeBalances[i]
	const factor = BigNumber(10).pow(decimals)
	console.log(balance)
	console.log(BigRational(sellAmount).multiply(factor).toDecimal())
	if (~i && BigRational(sellAmount).multiply(factor).gt(balance))
		setImmediate(() => {
			mutexDispatch({
				type: 'LOAD_SELL_AMOUNT',
				payload: BigRational(balance).divide(factor).toDecimal()
			})
			const { sellAmount: sellAmountNew } = getState()
			mutexDispatch({
				type: 'LOAD_SELL_TOTAL',
				payload: BigRational(sellPriceRational).multiply(BigRational(sellAmountNew)).toDecimal()
			})
		})
})

require.context('./subscribers', true, /(?:\.js$)/).keys().map(v => parse(v).name).forEach(v => {
	require(`./subscribers/${v}`)(store)
})

export default (window.store = store)
