"use strict"

import formatLink from "./format-link"
import defer from "../lib/defer"

const { parse, stringify } = JSON

export default ({ url, method = "POST", data = {} } = {}) => {
	const { promise, resolve, reject } = defer()
	const xhr = new XMLHttpRequest()
	xhr.open(method, formatLink(url))
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.responseText && xhr.status) {
				try {
					resolve(parse(xhr.responseText))
				} catch (e) {
					return reject(e)
				}
			} else {
				return reject(Error("Invalid response"))
			}
		}
	}
	xhr.send(stringify(data))
	return {
		promise,
		cancel: () => xhr.abort()
	}
}
