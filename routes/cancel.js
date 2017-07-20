'use strict'

const { performCancel } = require('../lib/core')
const { serializableFromError } = require('../lib/error')

module.exports = {
	method: 'POST',
	handler: ({ params: { orderHash, nonce, user, v, r, s } }, reply) => {
		performCancel({
			orderHash,
			nonce,
			user,
			v,
			r,
			s
		})
			.then(() => reply({ success: true }))
			.catch(err => serializableFromError(err))
	}
}
