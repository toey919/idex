"use strict";

import { connect } from 'react-redux';
import ErrorModal from './ErrorModalComponent';

export default connect(({
  dismissedInfo,
  dontShow,
  error
}) => ({
  error: (dontShow || dismissedInfo) && error || null
}), (dispatch) => ({
  dismiss(evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_ERROR',
      payload: ''
    });
  }
}))(ErrorModal);
