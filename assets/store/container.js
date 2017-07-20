'use strict'

import { createStore } from 'redux'
import singular from 'singular'

const { assign, create, keys } = Object
const dummy = createStore(() => ({}))

export default singular(
	create(
		assign(
			keys(dummy).reduce((r, v) => {
				r[v] = function(...args) {
					return this._store[v](...args)
				}
				return r
			}, {}),
			{
				getStore() {
					return this._store
				},
				setStore(store) {
					this._store = store
				}
			}
		)
	)
)
