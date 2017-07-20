'use strict';

import React from 'react';
import classnames from 'classnames';

export default ({
  selectedMarket,
  tradeForMarket,
  lastPrice,
  high,
  low,
  change,
  tradeForVolume,
  selectedVolume
}) => <div className="col-sm-12 col-md-8">
  <title>{ lastPrice } { tradeForMarket.symbol.toUpperCase() }/{ selectedMarket.symbol.toUpperCase() }</title>
  <div className="well nubits-prices">
    <div className="row">
      <div className="col-sm-4 col-md-4">
        24hr Volume: <br />
        <b>{ tradeForVolume }</b> { tradeForMarket.symbol.toUpperCase() } / <br /><b>{ selectedVolume }</b> { selectedMarket.symbol.toUpperCase() }
      </div>
      <div className="col-sm-8 col-md-8">
        <div className="row">
          <div className="col-sm-5 col-md-6">
            <span>Last price<br /><b>{ lastPrice }</b></span>
          </div>
          <div className="col-sm-5 col-md-6">
            24hr High<br /><b>{ high }</b>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-5 col-md-6">
            24hr Change<br />
            <b className={ classnames({
              'font-red': change.substr(0, 1) === '-',
              'font-green-meadow': change.substr(0, 1) === '+'
            }) }>{ change }</b>
          </div>
          <div className="col-sm-5 col-md-6">
            24hr Low<br />
            <b>{ low }</b>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>;
