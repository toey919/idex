"use strict";

import { connect } from 'react-redux';
import QuickSidebar from './QuickSidebarComponent';
import { toggleSidebarActive } from '../../actions';

export default connect((state) => ({
  isActive: state.sidebarActive === true
}), (dispatch) => ({
  onToggleSidebar() {
    return dispatch(toggleSidebarActive());
  }
}))(QuickSidebar);
