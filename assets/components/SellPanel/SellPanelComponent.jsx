"use strict";

import React from 'react';
import Button from 'muicss/lib/react/button';
import BigRational from 'big-rational';
import classnames from 'classnames';

export default ({
  selectedMarket,
  tradeForMarket,
  sellPrice,
  sellAmount,
  sellExpiry,
  sellTotal,
  isMinimized,
  onToggle,
  onSellExpiryChange,
  onSell,
  onRefresh,
  onTotalChange,
  onSellPriceChange,
  isTaker,
  onSellAmountChange,
  onSelectTotal,
  onSelectAmount,
  onSelectPrice
}) => <div className="col-md-6 col-xs-6">
  <div className="portlet box blue-chambray">
    <div className="portlet-title">
      <div className="caption">
        SELL { tradeForMarket.symbol.toUpperCase() }
      </div>
      <div className="tools">
        <a onClick={ onRefresh } href="" className="reload"> </a>
        <a href="" onClick={ onToggle } className="collapse"> </a>
      </div>
    </div>
    <div className={ classnames({
      'portlet-body': true,
      hidden: isMinimized
    }) }>
      <form role="form" onSubmit={ onSell }>
        <div className="row buy-nbt">
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Price</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" value={ sellPrice } onChange={ onSellPriceChange } />
                <span className="input-group-btn">
                  <button data-tip="Match best price" onClick={ onSelectPrice } className="pointer no-disabled-fade btn default blue-hoki-stripe" type="button">{ selectedMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Amount</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" onChange={ onSellAmountChange } value={ sellAmount } />
                <span className="input-group-btn">
                  <button data-tip="Sell all available tokens" onClick={ onSelectAmount } className="no-disabled-fade pointer btn default blue-hoki-stripe" type="button">{ tradeForMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">{ isTaker && <span>0.2%</span> || <span>0.1%</span> } Fee</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" disabled value={ sellTotal && BigRational(sellTotal).multiply(isTaker && 0.002 || 0.001).toDecimal(6) || '' } />
                <span className="input-group-btn">
                  <button disabled className="no-disabled-fade pointer btn default blue-hoki-stripe" type="button">{ selectedMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Total</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" value={ sellTotal } onChange={ onTotalChange } />
                <span className="input-group-btn">
                  <button data-tip="Sell into best offer" onClick={ onSelectTotal } className="no-disabled-fade pointer btn default blue-hoki-stripe" type="button">{ selectedMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Expiry</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <input type="text" className="form-control" onChange={ onSellExpiryChange } value={ sellExpiry } />
                <span className="input-group-btn">
                  <button className="no-disabled-fade pointer btn default blue-hoki-stripe" type="button">BLKS</button>
                </span>
              </div>
            </div>
          </div>
          <div className="sell-button-container">
            <Button type="submit" variant="raised" className="sell-button">Sell</Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>;
