"use strict";

import React from 'react';
import BuyPanel from '../BuyPanel';
import StopLimit from '../StopLimit';
import SellPanel from '../SellPanel';
import BuySellOrders from '../BuySellOrders';
import TradeHistory from '../TradeHistory';
import OpenOrders from '../OpenOrders';

export default () => {
          return <div className="row">
            <div className="col-sm-12 col-md-12 col-sm-12">
              <div className="row buy-stop-sell">
                <BuyPanel />
                <SellPanel />
              </div>
              <BuySellOrders />
              <OpenOrders />
              <TradeHistory />
            </div>
          </div>;
};
