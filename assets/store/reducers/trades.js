'use strict'

import uniqBy from 'lodash/uniqBy'

export default {
	key: 'trades',
	defaultValue: [],
	inject: {
		updateBy: 'txHash',
		reloadable: true,
		loader: true
	},
	reducer: (state, action) => {
		switch (action.type) {
			case 'PUSH_TRADES':
				return action.payload.concat(state)
			case 'POLL_UPDATE':
				if (action.payload && action.payload.trades && action.payload.trades.length)
					//          return uniqBy(action.payload.trades, 'transactionHash').filter((v) => !state.find((u) => v.id === u.id || v.transactionHash === u.transactionHash)).concat(state);
					return action.payload.trades.concat(state)
		}
		return state
	}
}
