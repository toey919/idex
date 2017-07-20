'use strict'

import React from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import EthereumModalButton from '../EthereumModalButton'
import ReloadButton from '../ReloadButton'
import InstructionsButton from '../InstructionsButton'
import EtherscanButton from '../EtherscanButton'
import TOSButton from '../TOSButton'

export default ({ onMarketClick, onToggleSidebar }) =>
	<div className="page-header navbar navbar-fixed-top">
		<div className="page-header-inner ">
			<div className="page-logo">
				<a href="/">
					<div className="dc-logo" />
					<span>IDEX</span>
				</a>
			</div>
			<div className="hor-menu">
				<ul className="nav navbar-nav margin-none">
					<li className="classNameic-menu-dropdown" onClick={onMarketClick}>
						<a href="javascript:;" id="sidebar">
							{' '}Markets <i className="fa fa-angle-down" />
						</a>
					</li>
				</ul>
			</div>
			<div className="top-menu">
				<ul className="nav navbar-nav pull-right">
					<li className="wt-li dropdown dropdown-user preserve-vendor-dropdown">
						<EthereumModalButton />
					</li>
					<li className="wt-li dropdown dropdown-user preserve-vendor-dropdown">
						<DropdownButton
							id="dropdown-help"
							title={
								<a>
									<span>Help</span>
									<i className="fa fa-angle-down" />
								</a>
							}
						>
							<ReloadButton />
							<InstructionsButton />
							<EtherscanButton />
							<TOSButton />
						</DropdownButton>
					</li>
					<li style={{ width: '80px' }} />
				</ul>
			</div>
		</div>
	</div>
