'use strict'

const { performWithdrawal } = require('../lib/core')
const { serializableFromError } = require('../lib/error')

module.exports = {
	method: 'POST',
	handler: ({ params: { user, amount, token, nonce, v, r, s } }, reply) => {
		performWithdrawal({
			user,
			amount,
			token,
			nonce,
			v,
			r,
			s
		})
			.then(() => reply({ success: true }))
			.catch(err => reply(serializableFromError(err)))
	}
}
