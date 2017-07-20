"use strict";

import React from 'react';
import classnames from 'classnames';

const noop = () => {};

export default ({
  tokens,
  selectedMarket,
  onSelectRow
}) => <div className="sidebar-tables">
  <table className="table table-font-xs table-striped table-bordered table-hover table-checkable order-column" id="sample_2">
    <thead>
      <tr>
        <th><i className="fa fa-star"></i></th>
        <th> Coin </th>
        <th> Price </th>
        <th> Volume </th>
        <th> Change </th>
        <th> Name </th>
      </tr>
    </thead>
    <tbody>
      { tokens.map((v, i) => <tr key={i} onClick={ onSelectRow }>
          <td><i className={ classnames({
            fa: true,
            'fa-star': v.favorite,
            'fa-star-o': !v.favorite
          }) }></i></td>
          <td>{ v.symbol }</td>
          <td>{ v.lastPrice }</td>
          <td>{ v.selectedVolume }</td>
          <td className={ classnames({
            'font-green-meadow': v.change.substr(0, 1) === '+',
            'font-red': v.change.substr(0, 1) === '-'
          }) }>{ v.change }</td>
          <td>{ v.name }</td>
        </tr>) }
    </tbody>
  </table>
</div>;
