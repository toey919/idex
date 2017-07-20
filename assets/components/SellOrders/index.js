'use strict';

require.context('./', true, /.(?:less|scss|styl|css)$/)
  .keys()
  .forEach((v) => require(`${v}`));

import Container from './SellOrdersContainer.js';
export default Container;