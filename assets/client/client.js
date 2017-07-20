"use strict"

/*
 * Contains all the code that communicates with Ethereum or Metamask,
 * but also contains code to interact with the server.
 *
 * It interacts directly with the state.
 */

import partial from "lodash/partial"
import BigNumber from "big-number"
import BigRational from "big-rational"
import pow from "../lib/pow"
import { all } from "../../lib/promise"
import { signOrder, signCancel, signTrade, signWithdrawal } from "../lib/sign"
import { getMarketContract, getMarketContractFromState, sendRawTransactionFormat, call, getBalance, instantiateEthereumClient, getBlockNumber, getTokenContract } from "./eth"
import { deterministicTimeout } from "../lib/async"
import { initializeWSClient, makeOrder, makeCancel, makeWithdrawal, makeTrade } from "./ws"
import { blockPollInterval } from "../fixtures"
import { getState, dispatch } from "../store/container"
import { map } from "bluebird"
import { resolve } from "../../lib/promise"
import isPossibleEthAddress from "../lib/possible-eth-address"

instantiateEthereumClient()
initializeWSClient()

const dispatchGetBlockNumber = () =>
	getBlockNumber()
		.then(payload => {
			if (getState().lastBlock !== payload)
				dispatch({
					type: "LOAD_BLOCK",
					payload
				})
		})
		.then(() => deterministicTimeout(blockPollInterval))
		.then(() => dispatchGetBlockNumber())
		.catch(() => deterministicTimeout(blockPollInterval).then(() => dispatchGetBlockNumber()))

const order = ({ tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce }) => {
	const { selectedAccount: user, address } = getState()
	const { v, r, s, hash } = signOrder({
		user,
		address,
		tokenBuy,
		amountBuy,
		tokenSell,
		amountSell,
		expires,
		nonce
	})
	return makeOrder({
		tokenBuy,
		amountBuy,
		tokenSell,
		amountSell,
		expires,
		nonce,
		user,
		hash,
		v,
		r,
		s
	})
}

const withdraw = () => {
	const { baseWithdrawQuantity, tradeWithdrawQuantity, selectedMarket, tradeForMarket, tokens } = getState()
	let amt = baseWithdrawQuantity || tradeWithdrawQuantity
	let token
	let idx
	if (baseWithdrawQuantity) token = tokens.find((v, i) => ((idx = i), v.symbol === selectedMarket))
	else token = tokens.find((v, i) => ((idx = i), v.symbol === tradeForMarket))
	amt = BigRational(amt).multiply(BigNumber(10).pow(token.decimals)).toDecimal()
	const { hash, v, r, s } = signWithdrawal({
		user: getState().selectedAccount,
		token: token.address,
		amount: amt,
		nonce: getState().nonce
	})
	return makeWithdrawal({
		user: getState().selectedAccount,
		token: token.address,
		amount: amt,
		nonce: getState().nonce,
		v,
		r,
		s
	})
		.then(() => dispatch({ type: "CLEAR_WITHDRAW" }))
		.catch(err => console.log(err))
}

dispatchGetBlockNumber()

const getAndDispatchBalances = () =>
	map(getState().tokens, v => {
		if (isPossibleEthAddress(v.address)) return getBalance(getState().selectedAccount)
		return call(getTokenContract(v.address), "balanceOf", getState().selectedAccount)
	}).then(balances =>
		dispatch({
			type: "LOAD_BALANCES",
			payload: balances.map(String)
		})
	)

const deposit = () => {
	if (getState().tradeDepositAmount) return tradeDeposit()
	return baseDeposit()
}

const baseDeposit = () => {
	let idx
	const { address, decimals } = getState().tokens.find((v, i) => ((idx = i), getState().selectedMarket === v.symbol))
	const { baseDepositAmount, exchangeBalances, balances } = getState()
	const amtRational = BigRational(getState().baseDepositAmount)
	if (amtRational.leq(0))
		return dispatch({
			type: "LOAD_ERROR",
			payload: "Please enter a valid deposit amount"
		})
	const amt = BigRational(baseDepositAmount).multiply(pow(10, decimals)).toDecimal()
	if (isPossibleEthAddress(address)) return sendRawTransactionFormat(getMarketContractFromState(), "deposit", { value: amt }).mined
	return sendRawTransactionFormat(getTokenContract(address), "approve", getState().address, amt).mined.then(() => sendRawTransactionFormat(getMarketContractFromState(), "depositToken", address, amt).mined)
}

const tradeDeposit = () => {
	let idx
	const { address, decimals } = getState().tokens.find((v, i) => ((idx = i), getState().tradeForMarket === v.symbol))
	const amtRational = BigRational(getState().tradeDepositAmount)
	if (amtRational.leq(0))
		return dispatch({
			type: "LOAD_ERROR",
			payload: "Please enter a valid deposit amount"
		})
	const amt = BigRational(getState().tradeDepositAmount).multiply(pow(10, decimals)).toDecimal()
	const { exchangeBalances, balances } = getState()
	if (isPossibleEthAddress(address)) return sendRawTransactionFormat(getMarketContractFromState(), "deposit", { value: amt }).mined
	return sendRawTransactionFormat(getTokenContract(address), "approve", getState().address, amt).mined.then(() => sendRawTransactionFormat(getMarketContractFromState(), "depositToken", address, amt).mined).catch(err => console.log(err.stack))
}

const performTradeOrPlaceOrder = (type, amount) => {
	const { orders, selectedMarket, tradeForMarket, buyPrice, buyPriceRational, buyAmount, buyTotal, sellPrice, sellPriceRational, tokens, sellAmount, sellTotal, buyExpiry, sellExpiry, nonce } = getState()
	const decimals = tokens.map(v => v.decimals)
	const { address: tradeForAddress } = tokens.find(v => v.symbol === tradeForMarket)
	const { address: selectedAddress } = tokens.find(v => v.symbol === selectedMarket)
	const ordersFiltered = orders
		.filter(v => !v.invalid) //only valid orders
		.filter(
			v =>
				BigRational(v.amountBuy).neq(0) && //only orders with unzero wanted
				BigRational(v.amountSell).neq(0) && //only orders with unzero offered
				(!v.amountBuyRemaining || BigRational(v.amountBuyRemaining).neq(0)) && //only orders with unzero amountBuyRemaining or no amountBuyRemaining
				((type === "buy" && v.tokenSell === tradeForAddress && v.tokenBuy === selectedAddress) || (type === "sell" && v.tokenBuy === tradeForAddress && v.tokenSell === selectedAddress))
		) //select only matching pairs
	const tradeForDecimals = decimals[tokens.findIndex(v => v.symbol === tradeForMarket)] || 0
	const selectedDecimals = decimals[tokens.findIndex(v => v.symbol === selectedMarket)] || 0
	const amt = (type === "buy" && BigRational(buyTotal).multiply(pow(10, selectedDecimals)).toDecimal()) || (type === "sell" && BigRational(sellAmount).multiply(pow(10, tradeForDecimals)).toDecimal()) //determine amount
	let idx
	const target = ordersFiltered.find((v, i) => {
		idx = i
		const price = BigRational((type === "buy" && v.amountBuy) || v.amountSell).divide(pow(10, selectedDecimals)).divide(BigRational((type === "buy" && v.amountSell) || v.amountBuy).divide(pow(10, tradeForDecimals)))
		const priceIsEqual = price.eq(BigRational((type === "buy" && (buyPriceRational || buyPrice)) || (type === "sell" && (sellPriceRational || sellPrice))))
		const amountRemains = BigRational(v.amountBuyRemaining || v.amountBuy)
		const amountRemainsIsGeqAmt = amountRemains.geq(BigRational(amt))
		return priceIsEqual && amountRemainsIsGeqAmt
	})
	if (target !== null && target !== undefined) {
		const { hash, v, r, s } = signTrade({
			hash: target.hash,
			amount: amt,
			nonce: getState().nonce,
			user: getState().selectedAccount
		})
		makeTrade([
			{
				orderHash: target.hash,
				amount: amt,
				nonce: getState().nonce,
				user: getState().selectedAccount,
				v,
				r,
				s
			}
		])
			.then(() =>
				dispatch({
					type: (type === "sell" && "CLEAR_SELL") || "CLEAR_BUY"
				})
			)
			.catch(err => {
				console.log(err.stack)
				dispatch({
					type: "LOAD_ERROR",
					payload: err.message
				})
			})
	} else {
		let error
		const totalErr = "Please enter a valid total.",
			amountErr = "Please enter a valid amount."
		if (type === "buy") {
			if (BigNumber(buyTotal).equals(0)) {
				dispatch({
					type: "LOAD_ERROR",
					payload: totalErr
				})
				error = true
			} else if (BigNumber(buyAmount).equals(0)) {
				dispatch({
					type: "LOAD_ERROR",
					payload: amountErr
				})
				error = true
			}
		} else {
			if (BigNumber(sellTotal).equals(0)) {
				dispatch({
					type: "LOAD_ERROR",
					payload: totalErr
				})
				error = true
			} else if (BigNumber(sellAmount).equals(0)) {
				dispatch({
					type: "LOAD_ERROR",
					payload: amountErr
				})
				error = true
			}
		}
		if (error) return Promise.reject("Order/trade failed.")
		dispatch({
			type: "INCREMENT_NONCE"
		})
		return getBlockNumber()
			.then(number => {
				if (type === "buy") {
					/*
         * RAY what is the comma expression in below find functions?
         * idx simply stores the index of the token in the tokens array, this comes from older code where `decimals` was its own branch of the state tree, but now I store the `decimals` value in the database instead of relying on the `decimals()` call of an ERC20 token. I could just as easily store the tokenBuy object an access the `decimals` and `address` properties of that, but I use `decimals[idx]` which returns the precision of that particular token
         */
					const tokenBuy = tokens.find((v, i) => ((idx = i), v.symbol === tradeForMarket)).address,
						amountBuy = BigRational(buyAmount).multiply(pow(10, decimals[idx])).floor().toDecimal(),
						tokenSell = tokens.find((v, i) => ((idx = i), v.symbol === selectedMarket)).address,
						amountSell = BigRational(buyTotal).multiply(pow(10, decimals[idx])).floor().toDecimal(),
						expires = number + Number(buyExpiry)
					dispatch({
						type: "ORDER_DISPATCHED"
					})
					return order({
						tokenBuy,
						amountBuy,
						tokenSell,
						amountSell,
						expires,
						nonce
					})
						.then(() => {
							dispatch({
								type: "ORDER_SUBMITTED"
							})
							dispatch({
								type: "CLEAR_BUY"
							})
						})
						.catch(err => {
							console.log(err.stack)
							dispatch({
								type: "LOAD_ERROR",
								payload: err.message
							})
						})
				} else {
					const tokenSell = tokens.find((v, i) => ((idx = i), v.symbol === tradeForMarket)).address,
						amountSell = BigRational(sellAmount).multiply(pow(10, decimals[idx])).floor().toDecimal(),
						tokenBuy = tokens.find((v, i) => ((idx = i), v.symbol === selectedMarket)).address,
						amountBuy = BigRational(sellTotal).multiply(pow(10, decimals[idx])).floor().toDecimal(),
						expires = number + Number(sellExpiry)
					dispatch({
						type: "ORDER_DISPATCHED"
					})
					return order({
						tokenBuy,
						amountBuy,
						tokenSell,
						amountSell,
						expires,
						nonce
					})
						.then(() => {
							dispatch({
								type: "ORDER_SUBMITTED"
							})
							dispatch({
								type: "CLEAR_SELL"
							})
						})
						.catch(err => {
							console.log(err.stack)
							dispatch({
								type: "LOAD_ERROR",
								payload: err.message
							})
						})
				}
			})
			.catch(err => {
				console.log(err.stack)
				dispatch({
					type: "LOAD_ERROR",
					payload: err.message
				})
			})
	}
}

const performSellOrPlaceOrder = partial(performTradeOrPlaceOrder, "sell")
const performBuyOrPlaceOrder = partial(performTradeOrPlaceOrder, "buy")

const cancel = orderHash => {
	return resolve().then(() => {
		const { v, r, s, hash } = signCancel({
			hash: orderHash,
			nonce: getState().nonce
		})
		return makeCancel({
			v,
			r,
			s,
			nonce: getState().nonce,
			user: getState().selectedAccount,
			orderHash
		})
	})
}

export default {
	order,
	deposit,
	cancel,
	withdraw,
	getAndDispatchBalances,
	performBuyOrPlaceOrder,
	performSellOrPlaceOrder
}
