'use strict'

const parse = require('path-parse')

export default require.context('./', true, /\.(?:jsx?)$/).keys().reduce((r, v, i, arr) => {
	const { dir } = parse(v)
	const { dir: baseDir, base } = parse(dir)
	if (baseDir === '.') r[base] = require(`./${base}/index`)
	return r
}, {})
