"use strict"

/*
 * RAY please explain why this is outside of the /components dir
 * This is an "action" which can be dispatched by any component or module, it contains extra code that stores state and is not expressed purely by dispatch calls / state subscribers. This is just one way to allow components to share actions with modules
 */

import { dispatch, getState } from "../store/container"
import { ethereumPanelTimeout } from "../fixtures"

let timer, isToggledOn

export const openEthereumPanel = () => {
	if (!getState().displayTooltip)
		dispatch({
			type: "LOAD_DISPLAY_TOOLTIP",
			payload: true
		})
	if (timer) clearTimeout(timer)
	if (!isToggledOn)
		timer = setTimeout(() => {
			dispatch({
				type: "LOAD_DISPLAY_TOOLTIP",
				payload: false
			})
			timer = null
		}, ethereumPanelTimeout)
}

export const toggleEthereumPanel = () => {
	if (timer) clearTimeout(timer)
	if (!getState().displayTooltip) isToggledOn = true
	else isToggledOn = false
	dispatch({
		type: "TOGGLE_DISPLAY_TOOLTIP"
	})
}
