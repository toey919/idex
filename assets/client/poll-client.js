"use strict"

import { dispatch, getState } from "../store"
import noop from "lodash/noop"
import formatLink from "./format-link"
import abortableJSONRequest from "./abortable-json-request"
import { timeout, deterministicTimeout } from "../lib/async"
import { pollTimeout, retryTimeout } from "../fixtures"

let cancelPoll = null

export const sync = () => {
	const { selectedAccount: address } = getState()
	const { promise, cancel } = abortableJSONRequest({
		url: "/api/sync",
		data: {
			address
		}
	})
	cancelPoll = () => {
		cancel()
		cancelPoll = null
	}
	return promise.then(payload => {
		dispatch({
			type: "DO_SYNC",
			payload
		})
		return payload
	})
}

export const interruptPoll = () => {
	if (cancelPoll) {
		cancelPoll()
		return Promise.resolve(true)
	}
	return Promise.resolve(false)
}

export const beginSync = () => interruptPoll().then(sync).then(() => dispatchPoll()).catch(() => deterministicTimeout(retryTimeout).then(beginSync))

export const reloadAndPoll = () => {
	dispatch({
		type: "RELOAD_DATA"
	})
	return beginSync()
}

export const dispatchPoll = () => {
	const { selectedAccount, highestTradeId, highestCancelId, highestOrderId, highestPendingTradeId, highestPendingCancelId, highestInvalidPendingId, highestInvalidOrderId } = getState()
	dispatch({
		type: "DISPATCH_POLL"
	})
	const { cancel, promise } = abortableJSONRequest({
		url: "/api/poll",
		data: {
			address: selectedAccount,
			after: getState().timestamp || 0,
			highestOrderId,
			highestCancelId,
			highestTradeId,
			highestInvalidPendingId,
			highestPendingTradeId,
			highestPendingCancelId,
			highestInvalidOrderId
		}
	})
	const { timer, cancel: cancelTimeout } = timeout(45000)
	cancelPoll = () => {
		cancelTimeout()
		cancel()
		cancelPoll = null
	}
	timer
		.then(() => {
			cancel()
			return dispatchPoll()
		})
		.catch(noop)
	return promise
		.then(payload => {
			dispatch({
				type: "POLL_UPDATE",
				payload
			})
			cancelTimeout()
			setImmediate(() => dispatchPoll())
		})
		.catch(noop)
}
