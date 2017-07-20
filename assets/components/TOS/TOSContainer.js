"use strict";

import { connect } from 'react-redux';
import TOS from './TOSComponent';

export default connect(({
  showTOS
}) => ({
  isActive: showTOS
}), (dispatch) => ({
  dismiss(evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_SHOW_TOS',
      payload: false
    });
  }
}))(TOS);
