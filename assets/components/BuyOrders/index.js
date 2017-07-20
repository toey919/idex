'use strict'

require.context('./', true, /.(?:less|scss|styl|css)$/).keys().forEach(v => require(`${v}`))

import Container from './BuyOrdersContainer.js'
export default Container
