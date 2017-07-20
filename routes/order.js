'use strict'

const { performOrder } = require('../lib/core')
const { serializableFromError } = require('../lib/error')

module.exports = {
	method: 'POST',
	handler: ({ params: { tokenBuy, amountBuy, tokenSell, amountSell, user, nonce, expires } }, reply) => {
		performOrder({
			tokenBuy,
			amountBuy,
			tokenSell,
			amountSell,
			user,
			nonce,
			expires
		})
			.then(() =>
				reply({
					success: true
				})
			)
			.catch(err => reply(serializableFromError(err)))
	}
}
