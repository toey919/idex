'use strict'

import React from 'react'
import MarketDetails from '../MarketDetails'
import Trades from '../Trades'
import Navbar from '../Navbar'
import Clearfix from '../Clearfix'
import PageContent from '../PageContent'
import PageContainer from '../PageContainer'
import FullWidthWrapper from '../FullWidthWrapper'
import Sidebar from '../Sidebar'
import EthereumPanel from '../EthereumPanel'
import Row from '../Row'
import QuickSidebar from '../QuickSidebar'
import EthereumModal from '../EthereumModal'
import ErrorModal from '../ErrorModal'
import Dismissable from '../Dismissable'
import TOS from '../TOS'
import ReactTooltip from 'react-tooltip'

export default () =>
	<FullWidthWrapper>
		<ReactTooltip />
		<ErrorModal />
		<TOS />
		<Dismissable />
		<EthereumModal />
		<Navbar />
		<PageContainer>
			<PageContent>
				<Row>
					<Sidebar />
					<MarketDetails />
				</Row>
				<Clearfix />
			</PageContent>
		</PageContainer>
		<QuickSidebar />
		<EthereumPanel />
	</FullWidthWrapper>
