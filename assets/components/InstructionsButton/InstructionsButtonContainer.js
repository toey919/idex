'use strict'

import { connect } from 'react-redux'
import InstructionsButton from './InstructionsButtonComponent'

export default connect(
	() => ({}),
	dispatch => ({
		onClick() {
			dispatch({
				type: 'LOAD_FORCE_DISMISSABLE_ON',
				payload: true
			})
		}
	})
)(InstructionsButton)
