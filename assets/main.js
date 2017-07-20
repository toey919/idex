'use strict'

import { dispatch } from './store'
import address from '../config/address'

let canUseLocalStorage
try {
	localStorage.setItem('k', 1)
	canUseLocalStorage = true
} catch (e) {
	canUseLocalStorage = false
}

if (canUseLocalStorage) {
	if (localStorage.getItem('seen') !== address) {
		localStorage.setItem('seen', address)
		dispatch({
			type: 'RELOAD_DATA'
		})
	}
}
import 'es5-shim'
import 'es5-shim/es5-sham'
import 'console-polyfill'
if (!window._babelPolyfill) {
	require('babel-polyfill')
}
import 'muicss/dist/css/mui.css'
import 'material-icons/css/material-icons.css'
import 'react-select/dist/react-select.css'
import './style/images.less'
import './lib/reload'
import './application.jsx'

dispatch({
	type: 'LOAD_TOKENS',
	payload: require('../fixtures/tokens')
})

const { assign } = Object
import store from './store'
import client from './client/ws'
window.client = client
assign(window, store)
