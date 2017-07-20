'use strict'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'
import { setStore } from './store/container'
import Exchange from './components/Exchange'
import DataSync from './components/DataSync'
import './client'

setStore(store)

render(
	<Provider store={store}>
		<DataSync>
			<Exchange />
		</DataSync>
	</Provider>,
	document.getElementById('root')
)
