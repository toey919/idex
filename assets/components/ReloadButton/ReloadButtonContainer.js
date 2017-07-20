'use strict';

import { connect } from 'react-redux';
import reload from '../../lib/reload';
import ReloadButton from './ReloadButtonComponent';

const { parse, stringify } = JSON;

export default connect(() => ({}), (dispatch) => ({
  onClick() {
    const { ethereumRPC, accounts, selectedAccount } = parse(localStorage.getItem('state') || '{}');
    reload();
    try {
      localStorage.setItem('state', stringify({
        ethereumRPC,
        accounts,
        selectedAccount
      }));
    } catch (e) {}
  }
}))(ReloadButton);
