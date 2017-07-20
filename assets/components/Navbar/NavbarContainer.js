"use strict"

import { connect } from "react-redux"
import Navbar from "./NavbarComponent"
import { toggleMarketActive, toggleSidebarActive } from "../../actions"

export default connect(
	state => ({}),
	dispatch => ({
		onMarketClick() {
			return dispatch(toggleMarketActive())
		},
		onToggleSidebar() {
			return dispatch(toggleSidebarActive())
		}
	})
)(Navbar)
