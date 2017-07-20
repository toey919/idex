'use strict';

import 'set-immediate';

/* jshint ignore:start */

const setImmediate = window.setImmediate;
const clearImmediate = window.setImmediate;
delete window.setImmediate;
delete window.clearImmediate;

export default {
  setImmediate,
  clearImmediate
};

/* jshint ignore:end */
