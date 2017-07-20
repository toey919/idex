"use strict";

import React from 'react';
import Button from 'muicss/lib/react/button';
import BigRational from 'big-rational';
import classnames from 'classnames';

export default ({
  selectedMarket,
  tradeForMarket,
  buyPrice,
  buyTotal,
  buyExpiry,
  buyAmount,
  isMinimized,
  onToggle,
  onRefresh,
  onBuy,
  onBuyPriceChange,
  onTotalChange,
  onBuyAmountChange,
  onBuyExpiryChange,
  isTaker,
  onSelectPrice,
  onSelectAmount,
  onSelectTotal
 }) => <div className="col-md-6 col-xs-6">
  <div className="portlet box blue-chambray">
    <div className="portlet-title">
      <div className="caption">
        BUY { tradeForMarket.symbol.toUpperCase() }
      </div>
      <div className="tools">
        <a href="" onClick={ onRefresh } className="reload"> </a>
        <a href="" onClick={ onToggle } className="collapse"> </a>
      </div>
    </div>
    <div className={ classnames({
      'portlet-body': true,
      hidden: isMinimized
    }) }>
      <form role="form" onSubmit={ onBuy }>
        <div className="row buy-nbt">
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Price</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" onChange={ onBuyPriceChange } value={ buyPrice } />
                <span className="input-group-btn">
                  <button data-tip="Match best price" onClick={ onSelectPrice } className="no-disabled-fade pointer btn blue-hoki" type="button">{ selectedMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Amount</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" onChange={ onBuyAmountChange } value={ buyAmount } />
                <span className="input-group-btn">
                  <button className="no-disabled-fade pointer btn blue-hoki" type="button" onClick={ onSelectAmount } data-tip="Buy into best offer">{ tradeForMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">{ isTaker && <span>0.2%</span> || <span>0.1%</span> } Fee</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" disabled value={ buyAmount && BigRational(buyAmount).multiply(isTaker && 0.002 || 0.001).toDecimal(6) || '' } />
                <span className="input-group-btn">
                  <button disabled className="no-disabled-fade pointer btn default blue-hoki-stripe" type="button">{ tradeForMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Total</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" value={ buyTotal } onChange={ onTotalChange } />
                <span className="input-group-btn">
                  <button className="no-disabled-fade pointer btn blue-hoki" type="button" onClick={ onSelectTotal } data-tip="Buy with all available tokens">{ selectedMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Expiry</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" value={ buyExpiry } onChange={ onBuyExpiryChange } />
                <span className="input-group-btn">
                  <button disabled className="no-disabled-fade pointer btn blue-hoki" type="button">BLKS</button>
                </span>
              </div>
            </div>
          </div>
          <div className="buy-button-container">
            <Button type="submit" variant="raised" className="buy-button">Buy</Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>;
