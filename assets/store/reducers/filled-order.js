'use strict'

import clone from 'clone'
export default {
	key: 'filledOrder',
	defaultValue: {},
	reducer: (state, action) => {
		switch (action.type) {
			case 'INITIATE_FILL_TRANSITION':
				const copy = clone(state)
				copy[action.payload] = 1
				return copy
			case 'PERFORM_FILL_TRANSITION':
				const copy2 = clone(state)
				copy2[action.payload] = 2
				return copy2
			case 'REMOVE_FILL_TRANSITION':
				const copy3 = clone(state)
				delete copy3[action.payload]
				return copy3
		}
		return state
	}
}
