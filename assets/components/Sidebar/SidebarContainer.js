"use strict";

import { connect } from 'react-redux';
import Sidebar from './SidebarComponent';

const allowed = ['ETH', 'USD.DC', 'BTC.DC'];

const SidebarContainer = connect(({
  marketActive,
  selectedMarket,
  tokens,
  sidebarSearch,
  sidebarFavoritesOnly
}) => {
  const selectableTokens = tokens.filter(v => ~allowed.indexOf(v.symbol.toUpperCase()));
  return {
    isActive: marketActive !== false,
    selectedMarket,
    tokens,
    selectableTokens,
    searchFilter: sidebarSearch,
    favoritesOnly: sidebarFavoritesOnly
  };
}, (dispatch) => ({
  onChangeSearch(evt) {
    dispatch({
      type: 'LOAD_SIDEBAR_SEARCH',
      payload: evt.target.value
    });
  },
  onSelectMarket(evt) {
    dispatch({
      type: 'SELECT_MARKET',
      payload: evt.target.value
    });
  },
  onToggleFavoritesOnly() {
    dispatch({
      type: 'TOGGLE_SIDEBAR_FAVORITES_ONLY'
    });
  }
}))(Sidebar);

export default SidebarContainer;
