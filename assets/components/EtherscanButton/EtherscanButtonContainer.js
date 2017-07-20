'use strict';

import { connect } from 'react-redux';
import EtherscanButton from './EtherscanButtonComponent';

const { parse, stringify } = JSON;

export default connect(() => ({}), (dispatch) => ({
  onClick() {
    dispatch({
      type: 'OPEN_ETHERSCAN_CONTRACT'
    });
  }
}))(EtherscanButton);
