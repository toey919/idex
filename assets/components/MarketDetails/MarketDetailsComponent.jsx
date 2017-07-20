"use strict";

import React from 'react';
import Wallet from '../Wallet';
import Metrics from '../Metrics';
import Chart from '../Chart';
import Trades from '../Trades';
import { Tabs, Tab } from 'react-bootstrap-tabs';
import classnames from 'classnames';

export default ({
  marketActive,
  selectedMarket,
  tradeForMarket,
  selectedTab,
  onSelectTab
}) => <div className={ classnames({
  'col-sm-8': true,
  'content-area': true,
  'full-width': marketActive === false
}) }>
  <div className="row">
    <div className="col-sm-12 col-md-4">
      <div className="note note-info bg-white">
        <h2>{ tradeForMarket.symbol.toUpperCase() }/{ selectedMarket.symbol.toUpperCase() }</h2>
      </div>
    </div>
    <Metrics />
  </div>
  <div className="main-tabs portlet light bordered">
    <div className="portlet-body">
      <Tabs selected={ selectedTab } onSelect={ onSelectTab }>
        <Tab eventKey={0} label="TIMELINE" id="timeline-tab">
          <div className="tab-pane fade active in" id="tab_1_1">
            <Chart />
          </div>
        </Tab>
        <Tab eventKey={1} label="WALLET" id="wallet-tab">
          <Wallet />
        </Tab>
      </Tabs>
    </div>
  </div>
  <Trades />
</div>;
