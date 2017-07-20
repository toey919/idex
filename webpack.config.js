'use strict'

var path = require('path'),
	join = path.join,
	webpack = require('webpack'),
	HTMLWebpackPlugin = require('html-webpack-plugin'),
	ClosureCompilerPlugin = require('webpack-closure-compiler'),
	assetPath = join(__dirname, 'assets'),
	publicPath = join(__dirname, 'public')

var cfg = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		join(assetPath, 'main.js')
	],
	output: {
		path: publicPath,
		filename: 'bundle-[hash].js'
	},
	devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV)
			}
		}),
		new HTMLWebpackPlugin({
			template: join(__dirname, 'assets', 'index.ejs')
		}),
		new ClosureCompilerPlugin({
			compiler: {
				language_in: 'ECMASCRIPT6',
				language_out: 'ECMASCRIPT5'
			},
			concurrency: 3
		})
	],
	module: {
		loaders: [
			{
				test: /(?:\.jsx?$)/,
				loader: 'babel-loader',
				exclude: /(?:node_modules|vendor)/,
				query: {
					presets: ['es2015', 'stage-2', 'react'],
					plugins: ['add-module-exports']
				}
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader'
			},
			{
				test: /\.gif/,
				loader: 'url-loader?limit=10000&mimetype=image/gif'
			},
			{
				test: /\.jpe?g/i,
				loader: 'url-loader?limit=340000&mimetype=image/jpg'
			},
			{
				test: /\.png/i,
				loader: 'url-loader?limit=340000&mimetype=image/png'
			},
			{
				test: /\.woff|woff2$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /(?:\.(?:ttf|eot|svg))(\?.*$|$)/,
				loader: 'file-loader'
			},
			{
				test: /(?:handlebars|hbs)/,
				loader: 'handlebars-loader'
			}
		]
	},
	resolve: {
		extensions: ['.jsx', '.js', '.json']
	}
}

if (process.env.NODE_ENV !== 'production') {
	cfg.plugins.pop()
	cfg.plugins.push(new webpack.HotModuleReplacementPlugin())
}

if (process.env.NO_SOURCEMAP) delete cfg.devtool

if (process.env.WEBPACK_DEV !== undefined) {
	var loader = cfg.module.loaders[0].loader
	var query = cfg.module.loaders[0].query
	//  query.plugins.unshift('react-hot-loader/babel');
	query = JSON.stringify(query)
	delete cfg.module.loaders[0].loader
	delete cfg.module.loaders[0].query
	cfg.module.loaders[0].loaders = [loader + '?' + query]
} else cfg.entry = join(assetPath, 'main.js')

module.exports = cfg
