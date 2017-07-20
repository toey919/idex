'use strict'

import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import Button from 'muicss/lib/react/button'
import Clearfix from '../Clearfix'
import MdClear from 'react-icons/lib/md/clear'

class Dismiss extends MdClear {
	/* jshint ignore:start */
	static childContextTypes = {
		reactIconBase: PropTypes.object
	}
	/* jshint ignore:end */
	getChildContext() {
		return {
			reactIconBase: { size: 36, style: { padding: '4px' } }
		}
	}
}

export default ({ isActive, onChange, dismiss, dontShow }) =>
	<Modal
		style={{
			content: {
				width: '500px',
				top: '50%',
				left: '50%',
				right: 'auto',
				bottom: 'auto',
				marginRight: '-50%',
				transform: 'translate(-50%, -50%)'
			}
		}}
		isOpen={Boolean(isActive)}
		onRequestClose={dismiss.bind(null, dontShow)}
		closeTimeoutMS={30}
		contentLabel="Error"
	>
		<div>
			<span onClick={dismiss.bind(null, dontShow)} className="pointer pull-right">
				<Dismiss />
			</span>
		</div>
		<form onSubmit={dismiss.bind(null, dontShow)}>
			<h4>Please register your Ethereum address to enable trading on IDEX.</h4>
			<h4>
				1) Sign up for a{' '}
				<a href="https://decentralizedcapital.com/#/sign-up" target="_blank">
					DC account
				</a>
			</h4>
			<h4>
				2) Fill out the{' '}
				<a href="https://decentralizedcapital.com/#/my-account/verification" target="_blank">
					verification form
				</a>
			</h4>
			<h4>
				3){' '}
				<a href="https://decentralizedcapital.com/#/my-account/idex" target="_blank">
					Whitelist
				</a>{' '}
				your IDEX address
			</h4>
			<input type="checkbox" value={dontShow} onChange={onChange} />
			<span style={{ marginLeft: '10px' }}>Don't show me this message again</span>
			<div className="error-ok-button-container">
				<Button type="submit">OK</Button>
			</div>
		</form>
	</Modal>
