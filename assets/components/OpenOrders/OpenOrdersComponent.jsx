"use strict";

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';
import { rowEnterDuration, rowLeaveDuration } from '../../fixtures';

export default ({
  selectedMarket,
  tradeForMarket,
  orders,
  onToggle,
  onCancel,
  isHidden
}) => <div className="row my-open-orders">
  <div className="col-xs-12">
    <div className="portlet box blue-chambray">
      <div className="portlet-title">
        <div className="caption">MY OPEN ORDERS </div>
        <div className="tools">
          <a onClick={ onToggle } className="collapse"> </a>
        </div>
      </div>
      <div className={ classnames({
        'portlet-body': true,
        'padding-none': true,
        hidden: isHidden
      }) }>
        <div className="scroller wt-scroller">
          <table className="table table-bordered table-striped table-hover table-condensed flip-content" >
            <thead className="flip-content bg-default">
              <tr>
                <th> Type </th>
                <th> Price ({ selectedMarket.symbol.toUpperCase() }) </th>
                <th> Amount ({ tradeForMarket.symbol.toUpperCase() }) </th>
                <th> Total ({ selectedMarket.symbol.toUpperCase() }) </th>
                <th> Date </th>
                <th> Expires </th>
                <th> Action </th>
              </tr>
            </thead>
            { orders.length && <ReactCSSTransitionGroup className="text-right" component="tbody" transitionName="data-row" transitionEnterTimeout={rowEnterDuration} transitionLeaveTimeout={rowLeaveDuration}>
              { orders.map((v, i) => <tr key={v.hash}>
                  <td className={ classnames({
                    'font-red': v.isSell,
                    'font-green-meadow': !v.isSell
                  }) }>{ v.type }{ v.invalid && <span> (Invalid)</span> || null }</td>
                  <td>{ v.price }</td>
                  <td>{ v.amount }</td>
                  <td>{ v.total }</td>
                  <td>{ v.date }</td>
                  <td>{ v.expires }</td>
                  <td><a onClick={ onCancel.bind(null, v.hash) }>Cancel</a></td>
                </tr>) }
            </ReactCSSTransitionGroup> || <tbody><tr><td colSpan="7" className="order-row-none">You have no open orders</td></tr></tbody> }
          </table>
        </div>
      </div>
    </div>
  </div>
</div>;
