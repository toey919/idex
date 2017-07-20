'use strict'

var assign = require('object-assign')

module.exports = assign(
	require('./client'),
	{
		address: require('./address')
	},
	{
		cors: true,
		rpc: require('./rpc-mainnet-geth'),
		web: require('./web'),
		mysql: {
			host: 'localhost',
			user: 'root',
			password: 'password',
			database: 'idex'
		},
		jwt: '+_-1~++=3789D3Central1Z3dCAP1tal)*^!%*#^^'
	}
)
