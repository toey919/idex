"use strict";

import React from 'react';
import classnames from 'classnames';

export default ({ isActive, onToggleSidebar }) => <div className={ classnames({
  'page-quick-sidebar-open': isActive
}) }>
  <a className="page-quick-sidebar-toggler" onClick={ onToggleSidebar }>
    <i className="icon-login"></i>
  </a>
  <div className="page-quick-sidebar-wrapper">
    <div className="page-quick-sidebar">
      <div className="tab-content">
        <h3 className="list-heading margin-top-40 margin-bottom-40">Login Area</h3>
        <form action="#" className="col-xs-12">
          <div className="form-group">
            <label>Username</label>
            <div className="input-group">
              <input type="text" placeholder="Aqeel" className="form-control dark bg-blue-ebonyclay" />
              <span className="input-group-addon bg-blue-chambray border-none"><i className="icon-user"></i></span>
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <input type="password" placeholder="*******" className="form-control dark bg-blue-ebonyclay" />
              <span className="input-group-addon bg-blue-chambray border-none"><i className="icon-eye"></i></span>
            </div>
          </div>
          <div className="form-group">
            <button type="button" className="btn blue-dark font-grey-salt">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div className="btn-sidebar-toggle display-none font-blue-hoki">
    <i className="fa fa-exchange"></i>
  </div>
</div>;
