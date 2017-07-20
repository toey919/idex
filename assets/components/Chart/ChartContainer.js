'use strict'

import { connect } from 'react-redux'
import Chart from './ChartComponent'

export default connect(
	({ selectedMarket, tradeForMarket, chartReady }) => ({
		selectedMarket,
		tradeForMarket,
		isReady: chartReady
	}),
	dispatch => ({})
)(Chart)
