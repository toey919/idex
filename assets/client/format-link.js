"use strict"

import { internal, env, hostname, port, protocol } from "../../config/client.json"
import { format } from "url"
import add from "lodash/add"
import partial from "lodash/partial"

let prefix = ""
if (!internal)
	prefix += format({
		hostname,
		port,
		protocol
	})

export default partial(add, prefix)
