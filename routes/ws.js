'use strict'

const { addSocket, removeSocket } = require('../lib/ws-server')

const addClient = ({ ws }) => {
	addSocket(ws)
}

const removeClient = ({ ws }) => {
	removeSocket(ws)
}

module.exports = {
	method: 'POST',
	config: {
		plugins: {
			websocket: {
				only: true,
				connect: addClient,
				disconnect: removeClient
			}
		}
	},
	handler: (request, reply) => reply({ success: true })
}
