'use strict'

import React from 'react'

export default ({ onClick }) =>
	<li role="presentation">
		<a role="menuitem" tabIndex="-1" onClick={onClick}>
			<span>Terms of Service</span>
		</a>
	</li>
