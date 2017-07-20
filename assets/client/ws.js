"use strict"

const { parse, stringify } = JSON
import { format } from "url"
import { hostname, port, socketPath } from "../../config/client"
import { getState, dispatch } from "../store/container"
import get from "lodash/get"
import { resolve, setImmediatePromise, all } from "../../lib/promise"
import defer from "../lib/defer"
import exportSingleton from "../../lib/singleton"
import isPossibleEthAddress from "../lib/possible-eth-address"
import { v1 } from "node-uuid"
import { syncChunkSize, pingTimeout } from "../fixtures"

const ln = v => {
	console.log(v)
	return v
}

class WSClient {
	constructor() {
		this.init()
	}
	init() {
		this._queue = []
		this._map = {}
		this.connect()
		this._syncing = true
		return this
	}
	connect() {
		this.setSocket(
			new WebSocket(
				format({
					protocol: "ws:",
					hostname,
					port,
					pathname: socketPath
				})
			)
		)
		this.bindHandlers()
	}
	getBalanceSheet() {
		return this.send({
			method: "getBalanceSheet",
			payload: {
				address: getState().selectedAccount
			}
		})
	}
	ping() {
		return this.send({
			method: "ping"
		})
	}
	keepPinging() {
		this._retryTimeout = setTimeout(() => this.init(), pingTimeout)
		this.ping()
			.then(() => {
				clearTimeout(this._retryTimeout)
				setTimeout(() => this.keepPinging(), pingTimeout)
			})
			.catch(() => setTimeout(() => this.keepPinging(), pingTimeout))
	}
	handleOpen() {
		this.doSync()
			.then(() => this.doSyncOrders())
			.then(() => this.doSyncTrades())
			.then(() => this.doSyncCancels())
			.then(() => this.dispatchQueued())
			.then(() => this.setSyncing(false))
			.then(() => {
				const { selectedAccount } = getState()
				if (selectedAccount !== "0x0") return all([this.registerAddress(selectedAccount), this.getBalanceSheet()])
				return true
			})
			.catch(err => {
				console.log(err.stack)
				return this.init()
			})
	}
	dispatchQueued() {
		this._getQueue().forEach(v => v())
	}
	setSyncing(bool) {
		this._syncing = bool
		return this
	}
	getSyncing() {
		return this._syncing
	}
	_getQueue() {
		return this._queue
	}
	queue(job) {
		if (this.getSyncing()) this._getQueue().push(job)
		else job()
	}
	registerAddress(address) {
		return this.send({
			method: "subscribeEthereumAddress",
			payload: address.toLowerCase()
		})
	}
	getSocket() {
		return this._sock
	}
	setSocket(s) {
		this._sock = s
		return this
	}
	queueReconnect() {
		if (this._reconnecting) return false
		this._reconnecting = true
		setImmediate(() => {
			this._reconnecting = false
			setTimeout(() => this.connect(), pingTimeout)
		})
	}
	bindHandlers() {
		this.getSocket().addEventListener("open", () => this.handleOpen())
		this.getSocket().addEventListener("close", () => setTimeout(() => this.queueReconnect(), pingTimeout))
		this.getSocket().addEventListener("error", () => setTimeout(() => this.queueReconnect(), pingTimeout))
		this.getSocket().addEventListener("message", m => {
			try {
				this.handleMessage(parse(m.data))
			} catch (e) {}
		})
	}
	getMap() {
		return this._map
	}
	send(payload) {
		const id = v1()
		payload.id = id
		console.log(payload)
		this.getMap()[id] = defer()
		this.getSocket().send(stringify(payload))
		return this.getMap()[id].promise
	}
	makeOrder(payload) {
		return this.send({
			method: "makeOrder",
			payload
		})
	}
	makeCancel(payload) {
		return this.send({
			method: "makeCancel",
			payload
		})
	}
	makeWithdrawal(payload) {
		return this.send({
			method: "makeWithdrawal",
			payload
		})
	}
	makeTrade(payload) {
		return this.send({
			method: "makeTrade",
			payload
		})
	}
	getOrders({ id, limit } = {}) {
		return this.send({
			method: "getOrders",
			payload: { id, limit }
		})
	}
	doSync() {
		const { selectedAccount } = getState()
		return this.send({
			method: "doSync",
			payload: {
				selectedAccount
			}
		}).then(({ nonce, address }) => {
			dispatch({
				type: "DO_SYNC",
				payload: {
					nonce,
					address
				}
			})
		})
	}
	doSyncOrders() {
		const { highestOrderId } = getState()
		return this.send({
			method: "doOrderSync",
			payload: {
				highestOrderId,
				limit: syncChunkSize
			}
		}).then(orders => {
			if (!orders.length) return true
			dispatch({
				type: "PUSH_ORDERS",
				payload: orders
			})
			return setImmediatePromise().then(() => this.doSyncOrders())
		})
	}
	doSyncTrades() {
		const { highestTradeId } = getState()
		return this.send({
			method: "doTradeSync",
			payload: {
				highestTradeId,
				limit: syncChunkSize
			}
		}).then(trades => {
			if (!trades.length) return true
			dispatch({
				type: "PUSH_TRADES",
				payload: trades
			})
			return setImmediatePromise().then(() => this.doSyncTrades())
		})
	}
	doSyncCancels() {
		const { highestCancelId } = getState()
		return this.send({
			method: "doCancelSync",
			payload: {
				highestCancelId,
				limit: syncChunkSize
			}
		}).then(cancels => {
			if (!cancels.length) return true
			dispatch({
				type: "PUSH_CANCELS",
				payload: cancels
			})
			return setImmediatePromise().then(() => this.doSyncCancels())
		})
	}
	handleMessage({ method, payload, id }) {
		console.log({
			method,
			payload,
			id
		})
		switch (method) {
			case "notifyTradeInserted":
				this.queue(() =>
					dispatch({
						type: "PUSH_TRADES",
						payload: [payload]
					})
				)
				break
			case "notifyOrderInserted":
				this.queue(() =>
					dispatch({
						type: "PUSH_ORDERS",
						payload: [payload]
					})
				)
				break
			case "pushCancel":
			case "notifyCancelInserted":
				this.queue(() =>
					dispatch({
						type: "PUSH_CANCELS",
						payload: [payload]
					})
				)
				break
			case "pushBalanceSheet":
				dispatch({
					type: "LOAD_EXCHANGE_BALANCES",
					payload: getState().tokens.map(v => payload[v.address] || 0)
				})
				break
			case "pushTransactionGraph":
				dispatch({
					type: "LOAD_TRANSACTION_GRAPH",
					payload
				})
				break
			case "notifyWithdrawalComplete":
				console.log("notifyWithdrawalComplete")
				break
			case "notifyTradeComplete":
				console.log("notifyTradeComplete")
				break
			case "notifyOrderComplete":
				console.log("notifyOrderComplete")
				break
			case "notifyTradeDispatched":
				console.log("notifyTradeDispatched")
				break
			case "notifyWithdrawalDispatched":
				console.log("notifyWithdrawalDispatched")
				break
			case "notifyOrderDispatched":
				console.log("notifyOrderDipsatched")
				break
			case "returnValue":
				if (get(this.getMap(), [id, "resolve"])) {
					this.getMap()[id].resolve(payload)
					if (payload.error) {
						dispatch({
							type: "LOAD_ERROR",
							payload: payload.message
						})
					}
				}
				break
			case "pushNonce":
				dispatch({
					type: "LOAD_NONCE",
					payload
				})
				break
		}
		delete this.getMap()[id]
	}
}

let instance

const initializeWSClient = () => {
	instance = new WSClient()
	return resolve(instance)
}

const getWSClient = () => instance

export default exportSingleton(getWSClient, WSClient.prototype, {
	getWSClient,
	initializeWSClient
})
