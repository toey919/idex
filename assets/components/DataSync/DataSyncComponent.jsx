'use strict'

import React, { Component } from 'react'
import { beginSync } from '../../client/poll-client'

class DataSync extends Component {
	render() {
		return React.Children.only(this.props.children)
	}
	componentDidMount() {}
}

export default DataSync
