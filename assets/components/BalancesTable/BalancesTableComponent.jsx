"use strict"

import React from "react"
import classnames from "classnames"

export default ({ tokens, searchFilter, favoritesOnly, onSelectRow, onToggleFavoritesOnly, onChangeSearch }) =>
	<div className="tab-content">
		<div className="tab-pane active">
			<div className="portlet box blue-chambray light padding-none balances-portlet">
				<div className="portlet-title balances-title">
					<div className="caption">Balances</div>
				</div>
				<div className="portlet-body balances-portlet-body">
					<div className="sidebar-tables">
						<table className="table table-font-xs table-striped table-bordered table-hover table-checkable order-column" id="sample_2">
							<thead>
								<tr>
									<th> Coin </th>
									<th> Available </th>
									<th> In Open Orders </th>
								</tr>
							</thead>
							<tbody>
								{tokens.map((v, i) =>
									<tr key={i}>
										<td>
											{v.symbol}
										</td>
										<td className="balances-currency-width">
											{v.available}
										</td>
										<td className="balances-currency-width">
											{v.inOrders}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
