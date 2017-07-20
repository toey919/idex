'use strict'

require.context('./', true, /.(?:less|scss|styl|css)$/).keys().forEach(v => require(`${v}`))

import Component from './FullWidthWrapperComponent.jsx'
export default Component
