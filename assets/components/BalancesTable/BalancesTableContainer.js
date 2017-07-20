"use strict"

import { connect } from "react-redux"
import BalancesTable from "./BalancesTableComponent"
import BigRational from "big-rational"
import clone from "clone"
import escapeRegExp from "escape-regexp"
import findTR from "../../lib/find-tr"
import findTD from "../../lib/find-td"
import pow from "../../lib/pow"

const PRECISION = 4

/* jshint ignore:start */

export default connect(
	({ tokens, exchangeBalances, balancesSearch, selectedAccount, balancesFavoritesOnly, favorites, orders }) => {
		const decimals = tokens.map(v => v.decimals)
		return {
			tokens: tokens
				.map((v, i) => {
					const totalAmount = exchangeBalances[i] || 0
					const tokenDecimals = decimals[i] || 0
					let inOrders = orders.filter(u => u.tokenGive === v.address).filter(u => !u.invalid).filter(u => u.user === selectedAccount).reduce((r, v) => r.add(v.amountGiveRemaining || v.amountGive), BigRational(0)).divide(pow(10, tokenDecimals)).toDecimal(PRECISION)
					const favorite = Boolean(favorites[v.symbol.toUpperCase()])
					const available = BigRational(totalAmount).divide(pow(10, tokenDecimals)).minus(BigRational(inOrders)).toDecimal(PRECISION)
					inOrders = BigRational(inOrders).toDecimal(PRECISION)
					return {
						...v,
						inOrders,
						available,
						favorite
					}
				})
				.filter(v => !balancesFavoritesOnly || v.favorite)
				.filter(v => !balancesSearch || RegExp(escapeRegExp(balancesSearch).replace(/\\\*/g, "(?:.*?)"), "i").test(v.symbol + " " + v.name)),
			searchFilter: balancesSearch,
			favoritesOnly: balancesFavoritesOnly
		}
	},
	dispatch => ({
		onChangeSearch(evt) {
			dispatch({
				type: "LOAD_BALANCES_SEARCH",
				payload: evt.target.value
			})
		},
		onToggleFavoritesOnly() {
			dispatch({
				type: "TOGGLE_BALANCES_FAVORITES_ONLY"
			})
		},
		onSelectRow(evt) {
			const tr = findTR(evt.target)
			const td = findTD(evt.target)
			if (tr.children[0] === td)
				dispatch({
					type: "TOGGLE_FAVORITE",
					payload: tr.children[1].innerHTML
				})
		}
	})
)(BalancesTable)

/* jshint ignore:end */
