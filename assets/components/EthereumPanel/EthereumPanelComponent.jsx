'use strict';

import React, { PropTypes } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';
import MdClear from 'react-icons/lib/md/clear';
import MdViewModule from 'react-icons/lib/md/view-module';
import config from '../../../config/client.json';
import Dropzone from 'react-dropzone';

class Dismiss extends MdClear {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 20, color: 'white' }
    };
  }
}

class View extends MdViewModule {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 20, color: 'white' }
    };
  }
}

export default ({
  isActive,
  web3Error,
  lastBlock,
  isPending,
  currentTransaction,
  transactions,
  lastTransaction,
  onToggle
}) => <div className={ classnames({
  'ethereum-panel': true,
  'ethereum-panel-active': isActive
}) }>
  <div className="ethereum-panel-header pointer" onClick= { onToggle }>
    <span>Current Block: { lastBlock }    </span>{ isPending && <span>(PENDING)</span> || <span></span> }
    <div className="pull-right">{ isActive && <Dismiss /> || <View /> }</div>
  </div>
  <div className="ethereum-panel-body">
    { isPending && currentTransaction && <div className="ethereum-panel-transaction-details">
        <div className="row margin-bottom-5">Waiting for <div><a target="_blank" href={ 'https://' + (config.env === 'development' && 'ropsten.' || '') + 'etherscan.io/tx/' + currentTransaction.tx } className="ethereum-panel-link">{ currentTransaction.tx }</a></div>to be mined ...</div>
        <div className="row">Called function <b>{ currentTransaction.fn }</b> on contract at <div><a target="_blank" href={ 'https://' + (config.env === 'development' && 'ropsten.' || '') + 'etherscan.io/address/' + currentTransaction.address } className="ethereum-panel-link">{ currentTransaction.address }</a></div></div>
      </div> || lastTransaction && <div className="ethereum-panel-transaction-details">
        <div className="row margin-bottom-5">Last transaction hash: <div><a target="_blank" href={ 'https://' + (config.env === 'development' && 'ropsten.' || '') + 'etherscan.io/tx/' + lastTransaction.tx } className="ethereum-panel-link">{ lastTransaction.tx }</a></div></div>
        <div className="row margin-bottom-5">Called function <b>{ lastTransaction.fn }</b> on contract at <div><a target="_blank" href={ 'https://' + (config.env === 'development' && 'ropsten.' || '') + 'etherscan.io/address/' + lastTransaction.address } className="ethereum-panel-link">{ lastTransaction.address }</a></div>
      </div>
      <div className="row">Gas Used: { lastTransaction.receipt.gasUsed }</div>
    </div> || <div className="row ethereum-panel-transaction-details">No transactions to display.</div> }
  </div>
</div>;
