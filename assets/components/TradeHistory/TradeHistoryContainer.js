'use strict';

import { connect } from 'react-redux';
import TradeHistory from './TradeHistoryComponent';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
};

export default connect(({
  tradeHistorySelectedTab,
  tokens,
  selectedMarket,
  tradeForMarket
}) => ({
  selectedTab: tradeHistorySelectedTab,
  selectedMarket: tokens.find(v => v.symbol === selectedMarket) || defaultToken,
  tradeForMarket: tokens.find(v => v.symbol === tradeForMarket) || defaultToken
}), (dispatch) => ({
  onSelectTab(tab, evt) {
    evt.preventDefault();
    dispatch({
      type: 'LOAD_TRADE_HISTORY_SELECTED_TAB',
      payload: tab
    });
  }
}))(TradeHistory);
