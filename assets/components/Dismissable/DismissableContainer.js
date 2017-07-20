'use strict'

import { connect } from 'react-redux'
import Dismissable from './DismissableComponent'

export default connect(
	({ dismissedInfo, dontShow, forceDismissableOn, tmpDontShow }) => ({
		isActive: (!dontShow && !dismissedInfo) || forceDismissableOn,
		dontShow: tmpDontShow,
		realDontShow: dontShow
	}),
	dispatch => ({
		dismiss(dontShow, evt) {
			evt.preventDefault()
			dispatch({
				type: 'LOAD_DONT_SHOW',
				payload: dontShow
			})
			dispatch({
				type: 'LOAD_DISMISSED_INFO',
				payload: true
			})
			dispatch({
				type: 'LOAD_FORCE_DISMISSABLE_ON',
				payload: false
			})
		},
		onChange(evt) {
			dispatch({
				type: 'LOAD_TMP_DONT_SHOW',
				payload: Boolean(evt.target.value)
			})
		}
	})
)(Dismissable)
