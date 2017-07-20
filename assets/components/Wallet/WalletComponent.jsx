'use strict';

import React from 'react';
import Deposit from '../Deposit';
import Withdraw from '../Withdraw';

export default () => <div className="tab-pane fade in" id="tab_1_4">
  <div className="row">
    <Deposit />
    <Withdraw />
  </div>
</div>
