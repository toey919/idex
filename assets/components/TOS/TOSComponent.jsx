"use strict";

import React, { PropTypes } from 'react';
import Modal from 'react-modal';
import Button from 'muicss/lib/react/button';
import Clearfix from '../Clearfix';
import MdClear from 'react-icons/lib/md/clear';
import TOSText from '../TOSText';

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

export default ({
  isActive,
  dismiss
}) => (
  <Modal style={ { content: {
    top: '30%',
    left: '20%',
    width: '80%',
    height: '70%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-10%, -25%)'
  } } } isOpen={ Boolean(isActive) } onRequestClose={ dismiss } closeTimeoutMS={ 30 } contentLabel="Error">
    <div><span onClick={ dismiss } className="pointer pull-right"><Dismiss /></span></div>
    <form onSubmit={ dismiss } style={ { height: '85%' } }>
      <div className="tos-box">
        <TOSText />
      </div>
      <div className="error-ok-button-container"><Button type="submit">Done</Button></div>
    </form>
  </Modal>
);
