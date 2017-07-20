"use strict";

import React from 'react';
import classnames from 'classnames';
import MarketTrades from '../MarketTrades';
import MyTrades from '../MyTrades';

export default ({
  onSelectTab,
  selectedMarket,
  tradeForMarket,
  selectedTab
}) => <div className="trade-history">
  <div className="portlet light padding-none box blue-chambray margin-none">
    <div className="portlet-title tabbable-line bg-blue-chambray margin-none">
      <div className="caption">
        <span className="caption-subject bold uppercase">TRADE HISTORY</span>
      </div>
      <ul className="nav nav-tabs">
        <li className={ classnames({
          active: selectedTab === 0
        }) }>
          <a onClick={ onSelectTab.bind(null, 0) }> MARKET TRADES </a>
        </li>
        <li className={ classnames({
          active: selectedTab === 1
        }) }>
          <a onClick={ onSelectTab.bind(null, 1) }> MY TRADES </a>
        </li>
      </ul>
    </div>
    <div className="portlet-body padding-none">
      <div className="tab-content">
        <div className="tab-pane active" id="portlet_tab1">
          <div className="portlet-body padding-none">
            <div className="scroller wt-scroller">
              <table className="table table-bordered table-striped table-hover table-condensed flip-content" >
                <thead className="flip-content bg-default">
                  <tr>
                    <th> Date </th>
                    <th> Type </th>
                    <th> Price ({ selectedMarket.symbol.toUpperCase() }) </th>
                    <th> Amount ({ tradeForMarket.symbol.toUpperCase() }) </th>
                    <th> Total ({ selectedMarket.symbol.toUpperCase() }) </th>
                  </tr>
                </thead>
                <MarketTrades />
                <MyTrades />
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>;
