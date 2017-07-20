"use strict";

import React, { PropTypes } from 'react';
import Modal from 'react-modal';
import Button from 'muicss/lib/react/button';
import Clearfix from '../Clearfix';
import MdClear from 'react-icons/lib/md/clear';

class Dismiss extends MdClear {
  /* jshint ignore:start */
  static childContextTypes = {
    reactIconBase: PropTypes.object
  };
  /* jshint ignore:end */
  getChildContext() {
    return {
      reactIconBase: { size: 36, style: { padding: '4px'} }
    };
  }
};

export default ({ dismiss, error }) => (
  <Modal style={ { content: {
    width: '500px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  } } } isOpen={ Boolean(error) } onRequestClose={ dismiss } closeTimeoutMS={ 30 } contentLabel="Error">
    <div><span onClick={ dismiss } className="pointer pull-right"><Dismiss /></span></div>
    <form onSubmit={ dismiss }>
    <h4 className="error-message">{ error }</h4>
      <div className="error-ok-button-container"><Button type="submit">OK</Button></div>
    </form>
  </Modal>
);
