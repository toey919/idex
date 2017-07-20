'use strict'

import React from 'react'

export default () =>
	<div name="flashchat" style={{ height: '500px', width: '100%' }}>
		<object classID="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="100%" height="100%" wmode="transparent">
			<param name="allowScriptAccess" value="sameDomain" />
			<param name="movie" value="http://flashirc.geekshed.net/tflash.php?embed=1&amp;joinonconnect=IDEX_Trading%2C%23IDEX_Help%2C%23IDEX_General&amp;chatonly=1&amp;isrestricted=0&amp;altfont=0&amp;key=&amp;nick=" />
			<param name="quality" value="high" />
			<embed src="http://flashirc.geekshed.net/tflash.php?embed=1&amp;joinonconnect=IDEX_Trading%2C%23IDEX_Help%2C%23IDEX_General&amp;chatonly=1&amp;isrestricted=0&amp;altfont=0&amp;key=&amp;nick=" wmode="transparent" type="application/x-shockwave-flash" width="100%" height="100%" />
		</object>
	</div>
