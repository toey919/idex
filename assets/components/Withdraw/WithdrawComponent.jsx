'use strict';

import React from 'react';
import BigRational from 'big-rational';
import Button from 'muicss/lib/react/button';

export default ({
  selectedMarket,
  tradeForMarket,
  onChangeWithdrawAddress,
  withdrawAddress,
  onChangeBaseWithdrawQuantity,
  onChangeTradeWithdrawQuantity,
  onMaxBase,
  onMaxTrade,
  onSelectDefaultAddress,
  baseWithdrawQuantity,
  tradeWithdrawQuantity,
  onWithdraw
}) => <div className="col-md-6 wallet-widthdraw">
  <div className="portlet box grey-cararra margin-none">
    <div className="portlet-title">
      <div className="caption">
        <i className="icon-share-alt"></i> Withdraw 
      </div>
    </div>
    <div className="portlet-body">
      <div className="font-dark row">
        <div className="col-md-6">Available Balance: </div><div className="col-md-6">{ selectedMarket.exchangeBalance !== 'Loading' && selectedMarket.exchangeBalance !== 'Disconnected' && <span><b>{ selectedMarket.exchangeBalance }</b> { selectedMarket.symbol }</span> || selectedMarket.exchangeBalance }</div>
      </div>
      <div className="font-dark row">
        <div className="col-md-6">Available Balance: </div><div className="col-md-6">{ tradeForMarket.exchangeBalance !== 'Loading' && tradeForMarket.exchangeBalance !== 'Disconnected' && <span><b>{ tradeForMarket.exchangeBalance }</b> { tradeForMarket.symbol }</span> || tradeForMarket.exchangeBalance }</div>
      </div>
      <form role="form" className="margin-top-30">
        <div className="row">
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Quantity</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <span className="input-group-btn">
                  <button className="btn blue-madison" type="button" onClick={ onMaxBase }>Max</button>
                </span>
                <input type="text" className="form-control" onChange={ onChangeBaseWithdrawQuantity } value={ baseWithdrawQuantity } />
                <span className="input-group-btn">
                  <button className="btn default" type="button" onClick={ onMaxBase }>{ selectedMarket.symbol }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Quantity</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <span className="input-group-btn">
                  <button className="btn blue-madison" type="button" onClick={ onMaxTrade }>Max</button>
                </span>
                <input type="text" className="form-control" onChange={ onChangeTradeWithdrawQuantity } value={ tradeWithdrawQuantity } />
                <span className="input-group-btn">
                  <button className="btn default" type="button" onClick={ onMaxTrade }>{ tradeForMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="form-group text-center">
          <div className="withdraw-button-container">
            <Button onClick={ onWithdraw } type="submit" variant="raised" className="buy-button">Withdraw</Button>
          </div>
        </div>
        <div className="note note-danger">
          <p className="block">Withdrawals will be sent back to the deposit address.</p>
        </div>
      </form>
    </div>
  </div>
</div>;
