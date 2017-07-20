'use strict'

import { connect } from 'react-redux'
import BuyOrders from './BuyOrdersComponent'
import findTR from '../../lib/find-tr'
import { computeBuyOrders, computeBuyTotal } from '../../selectors/buy-orders'

/* jshint ignore:start */

const defaultToken = {
	symbol: 'N/A',
	name: 'N/A',
	unselected: true
}

export default connect(
	({ tokens, selectedMarket, tradeForMarket, orders, filledOrder, pendingTrades, pendingCancels }) => {
		const selected =
			tokens.find(v => {
				return v.symbol.toLowerCase() === selectedMarket.toLowerCase()
			}) || defaultToken
		const tradeFor =
			tokens.find(v => {
				return v.symbol.toLowerCase() === tradeForMarket.toLowerCase()
			}) || defaultToken
		return {
			selectedMarket: selected,
			tradeForMarket: tradeFor,
			orders: computeBuyOrders({
				tokens,
				selectedMarket,
				tradeForMarket,
				orders,
				pendingTrades,
				pendingCancels
			}),
			total: computeBuyTotal({
				tokens,
				selectedMarket,
				tradeForMarket,
				orders,
				filledOrder,
				pendingTrades,
				pendingCancels
			}),
			filledOrder
		}
	},
	dispatch => ({
		onSelectBuy(order, evt) {
			const tr = findTR(evt.target)
			dispatch({
				type: 'LOAD_BUY_FROM_TABLE',
				payload: {
					price: order.priceRational.toDecimal(),
					rational: order.priceRational,
					get: order.buyRational.toDecimal(),
					give: order.sellRational.toDecimal()
				}
			})
		}
	})
)(BuyOrders)

/* jshint ignore:end */
