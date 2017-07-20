'use strict'

const { performTrade } = require('../lib/core')
const { serializableFromError } = require('../lib/error')

module.exports = {
	method: 'POST',
	handler: ({ params: { orderHash, user, v, r, s } }, reply) => {
		performTrade({
			orderHash,
			user,
			v,
			r,
			s
		})
			.then(() => reply({ success: true }))
			.catch(err => reply(serializableFromError(err)))
	}
}
