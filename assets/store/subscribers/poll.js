'use strict';

import { pollAll } from '../../client/eth';

export default ({
  subscribeToKey
}) => {
  subscribeToKey('lastBlock', pollAll);
};
