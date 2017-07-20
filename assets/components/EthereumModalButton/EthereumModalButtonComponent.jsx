'use strict';

import React from 'react';

export default ({ openEthereumModal }) => <div className="dropdown btn-group btn-group-preserve-vendor-dropdown">
  <button id="ethereum-panel-button" role="button" aria-haspopup="true" aria-expanded="false" type="button" className="dropdown-toggle btn btn-preserve-vendor-dropdown" onClick={ openEthereumModal }>
    <a>
      <span>Wallet</span>
      <i className="fa fa-angle-down"></i>
    </a>
  </button>
</div>;
