'use strict';

require.context('./', true, /.(?:less|scss|styl|css)$/)
  .keys()
  .forEach((v) => require(`${v}`));

import Component from './RowComponent.jsx';
export default Component;