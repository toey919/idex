"use strict"

/*
 * RAY please explain here, or in a read.me in store/reducers/ how the dynamic injection of Actions works.
 * I started looking for reducers that handle certain actions by grepping for a LOAD_XX but couldn't find all.
 * Understood why when I met this code. P
 * I actually don't use the dynamically generated actions from this module, although as you can see I was playing with the idea, I use direct dispatches because it is easier to reason about for me. However if you require this file, you will get an object of actions depending on what properties are in the "inject" object in the reducer. As an example, you can do `dispatch(loadSelectedAccount('USD'))` or `dispatch(toggleSidebar())`
 */

import reducers from "../store/reducers/index"
import { constant } from "change-case"
import forOwn from "lodash/forOwn"

function capitalize(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1)
}

function createActions(reducers) {
	let actions = {}
	forOwn(reducers, (value, key) => {
		forOwn(value.inject || {}, (v, key) => {
			switch (key) {
				case "loader":
					actions["load" + capitalize(value.key)] = data => {
						return { type: "LOAD_" + constant(value.key), payload: data }
					}
					break
				case "updateBy":
					actions["update" + capitalize(value.key)] = data => {
						return { type: "UPDATE_" + constant(value.key), payload: data }
					}
					break
				case "toggle":
					actions["toggle" + capitalize(value.key)] = () => {
						return { type: "TOGGLE_" + constant(value.key) }
					}
					break
			}
		})
	})
	return actions
}
export default (window.actions = createActions(reducers))
