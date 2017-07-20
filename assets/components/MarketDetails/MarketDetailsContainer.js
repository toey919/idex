"use strict";

import { connect } from 'react-redux';
import MarketDetails from './MarketDetailsComponent';
import BigRational from 'big-rational';

const defaultToken = {
  symbol: 'N/A',
  name: 'N/A',
  unselected: true
};

export default connect(({
  tokens,
  selectedTab,
  selectedMarket,
  tradeForMarket,
  marketActive,
}) => {
  const selected = tokens.find((v) => {
    return v.symbol === selectedMarket;
  }) || defaultToken;
  const tradeFor = tokens.find((v) => {
    return v.symbol === tradeForMarket;
  }) || defaultToken;
  return {
    selectedMarket: selected,
    marketActive,
    selectedTab,
    tradeForMarket: tradeFor,
  };
}, (dispatch) => ({
  onSelectTab(key) {
    dispatch({
      type: 'LOAD_SELECTED_TAB',
      payload: key
    });
  }
}))(MarketDetails);
