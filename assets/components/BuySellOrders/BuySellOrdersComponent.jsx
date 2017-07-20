"use strict";

import React from 'react';
import BuyOrders from '../BuyOrders';
import SellOrders from '../SellOrders';

export default () => <div className="row sell-buy-orders">
  <SellOrders />
  <BuyOrders />
</div>;
