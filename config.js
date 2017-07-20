'use strict'

const { assign } = Object

module.exports = assign({}, require('./config/config'), require('./config/client'))
