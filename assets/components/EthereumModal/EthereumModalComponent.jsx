"use strict";

import React, {
  Component,
  PropTypes
} from 'react';
import Modal from 'react-modal';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Select from 'react-select';
import Button from 'muicss/lib/react/button';
import Clearfix from '../Clearfix';
import MdSave from 'react-icons/lib/md/save';
import MdEdit from 'react-icons/lib/md/edit';
import MdClear from 'react-icons/lib/md/clear';
import Dropzone from 'react-dropzone';
import setImmediate from '../../lib/set-immediate';

const { parse } = JSON;

class Save extends MdSave {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 36, style: { 'margin-top': '10px', padding: '12px' } }
    };
  }
};

class Edit extends MdEdit {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 36, style: { padding: '4px' } }
    };
  }
};

class Dismiss extends MdClear {
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  getChildContext() {
    return {
      reactIconBase: { size: 36, style: { padding: '4px' } }
    };
  }
}

export default class EthereumModal extends Component {
  render() {
    const {
      isOpen,
      setRPCURL,
      ethereumRPC,
      selectAccount,
      editingRPCURL,
      onRPCURLChange,
      editRPCURL,
      saveRPCURL,
      tmpRPCURL,
      tmpSelectedAccount,
      selectedAccount,
      closeEthereumPanel,
      dismissEthereumPanel,
      gas,
      multiplier,
      changeGas,
      changeMultiplier,
      accounts
    } = this.props;
    return <Modal style={ {
      content: {
        top: '30%',
        left: '20%',
        width: '80%',
        height: '70%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-10%, -25%)',
      },
      overlay: {
        zIndex: 100000
      }
    } } isOpen={ isOpen } closeTimeoutMS={ 80 } contentLabel="Select Ethereum">
      <span className="pull-left">
        <h1>Wallet</h1>
      </span>
      <span className="pull-right pointer ethereum-modal-dismiss-container" onClick={ dismissEthereumPanel }>
        <Dismiss />
      </span>
      <Clearfix />
      <Dropzone onDrop={ (ev) => this.onDrop(ev) } className="drop-zone">
        Drag MyEtherWallet file here
      </Dropzone>
      <input type="password" onChange={ ({ target: { value } }) => this.props.onSetWalletPassword(value) } />
    </Modal>;
  }
  onDrop([ wallet ]) {
    const reader = new FileReader();
    const {
      onLoadWallet,
      onWalletLoadJSONError
    } = this.props;
    reader.onload = ({
      target: { result }
    }) => {
      try {
        onLoadWallet(parse(result))
      } catch (e) {
        onWalletLoadJSONError(e);
      }
    };
    reader.readAsText(wallet);
  }
}
