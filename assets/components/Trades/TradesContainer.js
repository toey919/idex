"use strict";

import { connect } from 'react-redux';
import Trades from './TradesComponent';

export default connect((state) => ({
  trades: state.trades
}), (dispatch) => ({}))(Trades);
