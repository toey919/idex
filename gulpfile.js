'use strict'

var gulp = require('gulp'),
	path = require('path'),
	join = path.join,
	fs = require('fs'),
	readFileSync = fs.readFileSync,
	lstatSync = fs.lstatSync,
	writeFileSync = fs.writeFileSync,
	readdirSync = fs.readdirSync,
	forOwn = require('lodash/forOwn'),
	webpack = require('webpack'),
	gutil = require('gulp-util'),
	runSequence = require('run-sequence'),
	mocha = require('gulp-mocha'),
	babel = require('gulp-babel'),
	jshint = require('gulp-jshint'),
	spawnSync = require('child_process').spawnSync,
	clone = require('clone'),
	map = require('async').map,
	Karma = require('karma').Server,
	cfg = require('./config'),
	isArray = Array.isArray,
	deployTestrpc = require('./internal/deploy-testrpc'),
	deployTestnet = require('./internal/deploy-testnet'),
	webpackConfig = require('./webpack.config')

var jshintConfig = {}

require.extensions['.json'](jshintConfig, './.jshintrc')

var jshintServerConfig = jshintConfig.exports
var jshintClientConfig = clone(jshintServerConfig)

jshintClientConfig.predef = jshintClientConfig.predef.client
jshintServerConfig.predef = jshintServerConfig.predef.server

var packageJson = require('./package')

var componentPath = join(__dirname, 'assets', 'components')

var task = gulp.task.bind(gulp),
	tasks = gulp.tasks

task('default', ['build'])

var reserved = ['test', 'start', 'default']

var assetPath = 'assets/**/*',
	srcPath = 'src/**/*.js',
	componentPath = join(__dirname, 'assets', 'components')

function buildTask(exe, args) {
	args = (isArray(args) && args) || [args]
	return 'node ' + join('node_modules', '.bin', exe) + ((args.filter(Boolean).length && ' ') || '') + args.join(' ')
}

jshint.client = jshint.bind(null, jshintClientConfig)
jshint.server = jshint.bind(null, jshintServerConfig)

task('build:tasks', function() {
	packageJson.scripts = {}
	forOwn(gulp.tasks, function(value, key, obj) {
		if (~reserved.indexOf(key)) return
		packageJson.scripts[key] = buildTask('gulp', key)
	})
	packageJson.scripts.test = buildTask('mocha')
	packageJson.scripts.start = 'node ' + join('bin', 'idex') + ' --debug'
	fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 1))
})

task('build:client:prod', function() {
	var env = clone(process.env)
	env.NODE_ENV = 'production'
	spawnSync('node', [join('node_modules', '.bin', 'gulp'), 'build:client'], {
		stdio: 'inherit',
		env: env
	})
})

task('karma', function(done) {
	if (!process.env.DISPLAY) process.env.DISPLAY = ':0'
	new Karma(
		{
			configFile: join(__dirname, 'internal', 'karma.conf.js'),
			singleRun: true
		},
		done
	).start()
})

task('build', function(cb) {
	runSequence(['build:private', 'jshint', 'test'], cb)
})

task('watch', ['default'], function() {
	return gulp.watch([assetPath, srcPath], ['default'])
})

task('build:private', ['build:server', 'build:client'])

task('test', function() {
	return gulp.src('test/test.js', { read: false }).pipe(mocha({ reporter: 'nyan' }))
})

function copyIndex() {
	return gulp.src('./assets/index*.html').pipe(gulp.dest('./public/'))
}
function copyImages() {
	return gulp.src('./assets/images/**/*').pipe(gulp.dest('./public/images'))
}
function copyFavicon() {
	return gulp.src('./assets/favicon.*').pipe(gulp.dest('./public/'))
}

gulp.task('build:client', ['webpack', 'copy'])

gulp.task('copy:index', copyIndex)

gulp.task('copy:favicon', copyFavicon)
gulp.task('copy:images', copyImages)

gulp.task('copy', ['copy:index', 'copy:images', 'copy:favicon'])

gulp.task('build:client:dev', ['webpack:dev'], copyIndex)

function doWebpack(next) {
	return webpack(webpackConfig, function(err, stats) {
		if (err) throw new gutil.PluginError('webpack', err)
		gutil.log(
			'[webpack]',
			stats.toString({
				colors: true,
				chunkModules: false
			})
		)
		next()
	})
}

function doWebpackUnmin(next) {
	webpackConfig.plugins.splice(
		webpackConfig.plugins.findIndex(v => {
			return v instanceof webpack.optimize.UglifyJsPlugin
		}),
		1
	)
	return doWebpack(next)
}

gulp.task('webpack', doWebpack)

gulp.task('webpack:dev', doWebpackUnmin)

gulp.task('jshint', ['jshint:server', 'jshint:client'])

gulp.task('jshint:server', function() {
	return gulp.src('./src/**/*.js').pipe(jshint.server()).pipe(jshint.reporter('jshint-stylish'))
})
gulp.task('jshint:client', function() {
	return gulp.src('./assets/**/*.js').pipe(jshint.client()).pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('db:sync', function(next) {
	let seq = require('./dist/lib/db')(cfg)
	seq.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(results => {
		seq
			.sync({ force: true })
			.then(function() {
				next()
			})
			.catch(function(err) {
				next(err)
			})
	})
})

var styleLoaderCode = "require.context('./', true, /.(?:less|scss|styl|css)$/)\n" + '  .keys()\n' + '  .forEach((v) => require(`${v}`));\n\n'

task('index:components', function() {
	readdirSync(componentPath)
		.filter(function(v) {
			return lstatSync(join(componentPath, v)).isDirectory()
		})
		.forEach(function(v) {
			var pathOfComponent = join(componentPath, v)
			var files = readdirSync(pathOfComponent)
			var component = files.find(function(v) {
				return /Component/.test(v)
			})
			var container = files.find(function(v) {
				return /Container/.test(v)
			})
			if (container) {
				writeFileSync(join(pathOfComponent, 'index.js'), '' + "'use strict';\n\n" + styleLoaderCode + "import Container from './" + container + "';\n" + 'export default Container;')
			} else {
				writeFileSync(join(pathOfComponent, 'index.js'), '' + "'use strict';\n\n" + styleLoaderCode + "import Component from './" + component + "';\n" + 'export default Component;')
			}
		})
})

task('deploy:testrpc', deployTestrpc)
task('deploy:testnet', deployTestnet)

task('start:dev', function() {
	var env = clone(process.env)
	env.WEBPACK_DEV = 'true'
	spawnSync('node', [join('node_modules', '.bin', 'webpack-dev-server'), '--port', '3000', '--content-base', 'public/', '--progress', '--inline', '--hot'], {
		stdio: 'inherit',
		env: env
	})
})

task('start:dev:fast', function() {
	var env = clone(process.env)
	env.WEBPACK_DEV = 'true'
	env.NO_SOURCEMAP = 'true'
	spawnSync('node', [join('node_modules', '.bin', 'webpack-dev-server'), '--port', '3000', '--content-base', 'public/', '--progress', '--inline', '--hot'], {
		stdio: 'inherit',
		env: env
	})
})
