'use strict'

import React, { Component } from 'react'
import datafeed from '../../lib/datafeed'
import TradingView from '../../lib/trading-view'
import getParameterByName from '../../lib/get-parameter-by-name'
import { determine } from 'jstz'
const parse = require('path-parse')
window.path = path
import { getState, dispatch, subscribeToEvent } from '../../store'

import supportedTimezones from '../../fixtures/timezones'
let timezone = determine().name()
if (!~supportedTimezones.indexOf(timezone)) timezone = 'UTC'

const supportedLocales = require.context('../../../vendor/charting_library/charting_library/static/localization/translations', true, /\.json$/).keys().map(v => parse(v).name)
let locale = getParameterByName('lang')
if (!locale || !~supportedLocales.indexOf(locale)) locale = 'en'

let chart

const maybeRemoveChart = () => {
	if (chart && getState().chartDeployed) {
		chart.remove()
		chart = null
	}
	dispatch({
		type: 'LOAD_CHART_DEPLOYED',
		payload: false
	})
}

const deployTradingView = symbol => {
	if (getState().chartReady) {
		maybeRemoveChart()
		chart = new TradingView.widget({
			symbol,
			timezone,
			interval: '60',
			container_id: 'trading-chart',
			locale,
			datafeed,
			drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
			disabled_features: ['use_localstorage_for_settings', 'volume_force_overlay'],
			favorites: {
				intervals: ['1', '5', '15', '30', '60', '120', '360', '1D', '1W']
			},
			overrides: {
				'paneProperties.background': '#222222',
				'paneProperties.vertGridProperties.color': '#454545',
				'paneProperties.horzGridProperties.color': '#454545',
				'symbolWatermarkProperties.transparency': 90,
				'scalesProperties.textColor': '#AAA',
				volumePaneSize: 'kustom'
			}
		})
	}
}

export default class Chart extends Component {
	componentWillReceiveProps(nextProps) {
		deployTradingView(nextProps.tradeForMarket)
	}
	componentDidMount() {
		deployTradingView(this.props.tradeForMarket)
	}
	componentWillUnmount() {
		maybeRemoveChart()
	}
	render() {
		return (
			<div className="trading-chart-container">
				<div id="trading-chart" />
			</div>
		)
	}
}

if (getState().tokens.length) {
	dispatch({
		type: 'LOAD_CHART_READY',
		payload: true
	})
} else {
	const unsubscribe = subscribeToEvent('POLL_UPDATE', () => {
		unsubscribe()
		dispatch({
			type: 'LOAD_CHART_READY',
			payload: true
		})
	})
}
