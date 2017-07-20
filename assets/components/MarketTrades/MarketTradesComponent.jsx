"use strict";

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';
import { rowEnterDuration, rowLeaveDuration } from '../../fixtures';

export default ({
  isSelected,
  trades
}) => <ReactCSSTransitionGroup className={ classnames({
  'text-right': true,
  hidden: !isSelected
}) } component="tbody" transitionName="data-row" transitionEnterTimeout={rowEnterDuration} transitionLeaveTimeout={rowLeaveDuration}>
  { trades.length && trades.map((v, i) => <tr key={i}>
    <td>{ v.date }</td>
    <td className={ classnames({
      'font-red': !v.isBuy,
      'font-green-meadow': v.isBuy
    }) }>{ v.type }</td>
    <td>{ v.price }</td>
    <td>{ v.amount }</td>
    <td>{ v.total }</td>
  </tr>) || <tr key="none"><td colSpan="5" className="trades-row-none">There is no trade history to show</td></tr> }
</ReactCSSTransitionGroup>;
