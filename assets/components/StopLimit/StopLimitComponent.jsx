'use strict'

import React from 'react'

export default ({ selectedMarket, tradeForMarket }) => {
	return (
		<div className="col-md-4 col-xs-6">
			<div className="portlet box blue-chambray">
				<div className="portlet-title">
					<div className="caption">
						<i className="icon-basket-loaded" /> STOP LIMIT{' '}
					</div>
					<div className="tools">
						<a href="" className="reload">
							{' '}
						</a>
						<a href="" className="collapse">
							{' '}
						</a>
					</div>
				</div>
				<div className="portlet-body">
					<form role="form">
						<div className="row buy-nbt">
							<div className="form-group">
								<label className="col-md-3 col-sm-12 col-xs-3 control-label">Stop</label>
								<div className="col-md-9 col-sm-12 col-xs-9">
									<div className="input-group">
										<input type="text" className="form-control" />
										<span className="input-group-btn">
											<button className="btn blue-hoki btn-outline" type="button">
												{tradeForMarket.symbol.toUpperCase()}
											</button>
										</span>
									</div>
								</div>
							</div>
							<div className="form-group">
								<label className="col-md-3 col-sm-12 col-xs-3 control-label">Limit</label>
								<div className="col-md-9 col-sm-12 col-xs-9">
									<div className="input-group">
										<input type="text" className="form-control" />
										<span className="input-group-btn">
											<button className="btn blue-hoki btn-outline" type="button">
												{selectedMarket.symbol.toUpperCase()}
											</button>
										</span>
									</div>
								</div>
							</div>
							<div className="form-group">
								<label className="col-md-3 col-sm-12 col-xs-3 control-label">Amount</label>
								<div className="col-md-9 col-sm-12 col-xs-9">
									<div className="input-group">
										<input type="text" className="form-control" />
										<span className="input-group-btn">
											<button className="btn blue-hoki btn-outline" type="button">
												{selectedMarket.symbol.toUpperCase()}
											</button>
										</span>
									</div>
								</div>
							</div>
							<hr />
							<div className="form-group">
								<label className="col-md-3 col-sm-12 col-xs-3 control-label">Total</label>
								<div className="col-md-9 col-sm-12 col-xs-9">
									<div className="input-group">
										<input type="text" className="form-control" />
										<span className="input-group-btn">
											<button className="btn blue-hoki btn-outline" type="button">
												{tradeForMarket.symbol.toUpperCase()}
											</button>
										</span>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
