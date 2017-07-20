'use strict'

import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { rowEnterDuration, rowLeaveDuration } from '../../fixtures'
import classnames from 'classnames'

export default ({ selectedMarket, tradeForMarket, total, orders, filledOrder, onSelectBuy }) =>
	<div className="col-md-6">
		<div className="portlet box blue-chambray">
			<div className="portlet-title">
				<div className="caption">BUY ORDERS </div>
				<div className="tools">
					<span>
						Total: <b>{total}</b> {selectedMarket.symbol.toUpperCase()}
					</span>
				</div>
			</div>
			<div className="portlet-body padding-none">
				<div className="scroller wt-scroller wt-scroller-fixed">
					<table className="table table-bordered table-striped table-hover table-condensed flip-content">
						<thead className="flip-content">
							<tr>
								<th> Price </th>
								<th>
									{' '}{tradeForMarket.symbol.toUpperCase()}{' '}
								</th>
								<th>
									{' '}{selectedMarket.symbol.toUpperCase()}{' '}
								</th>
								<th>
									{' '}Sum({selectedMarket.symbol.toUpperCase()}){' '}
								</th>
							</tr>
						</thead>
						<ReactCSSTransitionGroup className="text-right" component="tbody" transitionName="data-row" transitionEnterTimeout={rowEnterDuration} transitionLeaveTimeout={rowLeaveDuration}>
							{orders.map((v, i) =>
								<tr
									className={classnames({
										'buy-row-enter-partial': typeof filledOrder[v.hash] === 'number' && filledOrder[v.hash] >= 1,
										'buy-row-enter-active-partial': typeof filledOrder[v.hash] === 'number' && filledOrder[v.hash] >= 2
									})}
									onClick={onSelectBuy.bind(null, v)}
									key={v.hash}
								>
									<td>
										{v.price}
									</td>
									<td>
										{v.buy}
									</td>
									<td>
										{v.sell}
									</td>
									<td>
										{v.sum}
									</td>
								</tr>
							)}
						</ReactCSSTransitionGroup>
					</table>
				</div>
			</div>
		</div>
	</div>
