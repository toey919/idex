'use strict'

export default {
	key: 'address',
	defaultValue: '',
	inject: {
		loader: true
	},
	reducer: (state, action) => {
		switch (action.type) {
			case 'POLL_UPDATE':
				return action.payload.address || state
			case 'DO_SYNC':
				return action.payload.address || state
		}
		return state
	}
}
