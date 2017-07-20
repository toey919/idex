'use strict'

import { connect } from 'react-redux'
import StopLimit from './StopLimitComponent'

const defaultToken = {
	symbol: 'N/A',
	name: 'N/A',
	unselected: true
}

export default connect(
	state => {
		const selectedMarket =
			state.tokens.find(v => {
				return v.symbol === state.selectedMarket
			}) || defaultToken
		const tradeForMarket =
			state.tokens.find(v => {
				return v.symbol === state.tradeForMarket
			}) || defaultToken
		return {
			selectedMarket,
			tradeForMarket
		}
	},
	dispatch => ({})
)(StopLimit)
