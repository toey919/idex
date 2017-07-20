'use strict'

import { connect } from 'react-redux'
import TOSButton from './TOSButtonComponent'

const { parse, stringify } = JSON

export default connect(
	() => ({}),
	dispatch => ({
		onClick() {
			dispatch({
				type: 'LOAD_SHOW_TOS',
				payload: true
			})
		}
	})
)(TOSButton)
