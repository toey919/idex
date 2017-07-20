"use strict";

import React from 'react';
import SidebarTable from '../SidebarTable';
import BalancesTable from '../BalancesTable';
import ChatBox from '../ChatBox';
import classnames from 'classnames';

export default ({
  tokens,
  isActive,
  onSelectMarket,
  onToggleFavoritesOnly,
  favoritesOnly,
  searchFilter,
  onChangeSearch,
  selectableTokens,
  selectedMarket
}) => <div className={ classnames({
  'col-sm-4': true,
  sidebar: true,
  'sidebar-hide': true,
  'md-no-padding': true,
  hidden: !isActive
}) }>
  <div className="tabbable-custom nav-justified">
    <div className="tab-content">
      <div id="tab_1_1_1" className="tab-pane active">
        <div className="portlet light padding-none">
          <div className="portlet-body">
            <div className="table-toolbar margin-none">
              <div className="row tab-top">
                <div className="col-md-12">
                  <div className="portlet-body form">
                    <div className="form-horizontal form-row-seperated inline-block">
                      <div className="form-body">
                        <div className="form-group padding-none border-none">
                          <select className="bs-select input-small form-control" onChange={ onSelectMarket } value={ selectedMarket }>
                            { selectableTokens.map((v, i) => <option key={i}>{ v.symbol }</option>) }
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="show-only inline-block">
                      <label><input type="checkbox" onChange={ onToggleFavoritesOnly } value={ favoritesOnly } /> Show</label>
                      <label><i className="fa fa-star"></i> only</label>
                    </div>
                    <div className="search-field inline-block pull-right">
                      <input type="search" value={ searchFilter } onChange={ onChangeSearch } placeholder="Search" className="form-control input-sm input-small input-inline" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <SidebarTable />
          </div>
        </div>
      </div>
    </div>
    <BalancesTable />
    <ChatBox />
  </div>
</div>;
