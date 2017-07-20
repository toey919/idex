'use strict';

import React, { PropTypes } from 'react';
import MdReply from 'react-icons/lib/md/reply';

class Reply extends MdReply {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 15, color: '#666' }
    };
  }
};

export default ({ onClick }) => <li role="presentation">
  <a role="menuitem" tabIndex="-1" onClick={ onClick } >
    <span className="reload-button-icon-container"><Reply /></span><span> Reset</span>
  </a>
</li>
