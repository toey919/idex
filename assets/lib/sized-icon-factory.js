'use strict';

import React, { PropTypes, createClass } from 'react';

export default (Icon, cfg) => class extends Icon {
  /* jshint ignore:start */
  childContextTypes: {
    reactIconBase: PropTypes.object
  }
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: cfg
    };
  }
};
