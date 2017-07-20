'use strict';

import React from 'react';
import Button from 'muicss/lib/react/button';

export default ({
  selectedMarket,
  tradeForMarket,
  baseDepositAmount,
  tradeDepositAmount,
  onBaseDepositAmountChange,
  onTradeDepositAmountChange,
  onDeposit,
  onSelectMaxBase,
  onSelectMaxTrade
}) => <div className="col-md-6 wallet-deposit">
  <div className="portlet box grey-cararra">
    <div className="portlet-title">
      <div className="caption"><i className="icon-note"></i> Deposit </div>
    </div>
    <div className="portlet-body">
      <div className="font-dark row">
        <div className="col-md-6">Available Balance: </div><div className="col-md-6">{ selectedMarket.balance !== 'Loading' && selectedMarket.balance !== 'Disconnected' && <span><b>{ selectedMarket.balance }</b> { selectedMarket.symbol }</span> || selectedMarket.balance }</div>
      </div>
      <div className="font-dark row">
        <div className="col-md-6">Available Balance: </div><div className="col-md-6">{ tradeForMarket.balance !== 'Loading' && tradeForMarket.balance !== 'Disconnected' && <span><b>{ tradeForMarket.balance }</b> { tradeForMarket.symbol }</span> || tradeForMarket.balance }</div>
      </div>
      <form role="form" className="margin-top-30">
        <div className="row">
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Quantity</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <span className="input-group-btn">
                  <button className="btn blue-madison" type="button" onClick={ onSelectMaxBase }>Max</button>
                </span>
                <input type="text" className="form-control" onChange={ onBaseDepositAmountChange } value={ baseDepositAmount } />
                <span className="input-group-btn">
                  <button className="btn default" type="button" onClick={ onSelectMaxBase }>{ selectedMarket.symbol }</button>
                </span>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 col-sm-12 col-xs-3 control-label">Quantity</label>
            <div className="col-md-9 col-sm-12 col-xs-9">
              <div className="input-group">
                <span className="input-group-btn">
                  <button className="btn blue-madison" type="button" onClick={ onSelectMaxTrade }>Max</button>
                </span>
                <input type="text" className="form-control" onChange={ onTradeDepositAmountChange } value={ tradeDepositAmount } />
                <span className="input-group-btn">
                  <button className="btn default" type="button" onClick={ onSelectMaxTrade }>{ tradeForMarket.symbol.toUpperCase() }</button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="form-group text-center">
          <div className="withdraw-button-container">
            <Button onClick={ onDeposit } type="submit" variant="raised" className="buy-button">Deposit</Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>;
