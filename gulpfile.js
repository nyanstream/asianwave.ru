'use strict'

let
	project =      require('./package.json'),
	gulp =         require('gulp'),
	tube =         require('gulp-pipe'),
	bom =          require('gulp-bom'),
	rename =       require('gulp-rename'),
	watch =        require('gulp-watch'),
	plumber =      require('gulp-plumber'),
	composer =     require('gulp-uglify/composer'),
	uglifyjs =     require('uglify-es'),
	csso =         require('gulp-csso'),
	pug =          require('gulp-pug'),
	live_server =  require('browser-sync')

let sass = {
	compile:  require('gulp-sass'),
	watch:    require('gulp-watch-sass'),
	vars:     require('gulp-sass-variables')
}

let
	minifyJS = composer(uglifyjs, console),
	reloadServer = () => live_server.stream()

let folders = {
	dev: 'source',
	prod: {
		root: 'build',
		main: 'files'
	}
}

let paths = {
	html: {
		dev: [`${folders.dev}/pug/**/*.pug`, `!${folders.dev}/pug/inc/**/*.pug`],
		prod: `${folders.prod.root}/`
	},
	js: {
		dev: `${folders.dev}/js/**/*.js`,
		prod: `${folders.prod.root}/${folders.prod.main}/js/`,
		kamina: 'node_modules/kamina-js/dist/kamina.min.js',
	},
	css: {
		dev: `${folders.dev}/scss/**/*.scss`,
		prod: `${folders.prod.root}/${folders.prod.main}/css/`
	}
}

gulp.task('liveReload', () => live_server({
	server: { baseDir: 'build/' },
	port: 8080,
	notify: false
}))

gulp.task('pug', () => tube([
	gulp.src(paths.html.dev),
	plumber(),
	watch(paths.html.dev),
	pug({ locals: {
		VERSION: project.version,
		PATHS: {
			js: `/${folders.prod.main}/js`,
			css: `/${folders.prod.main}/css`,
			img: `/${folders.prod.main}/img`,
			other: `/${folders.prod.main}/other`
		}
	}}),
	rename(file => {
		switch (file.dirname) {
			case 'api':
				file.extname = '.php'; break
			case 'other':
				file.dirname = `files/${file.dirname}`
				file.extname = '.htm'
		}
	}),
	bom(),
	gulp.dest(paths.html.prod),
	reloadServer()
]))

gulp.task('get-kamina', () => tube([
	gulp.src(paths.js.kamina),
	bom(),
	gulp.dest(paths.js.prod)
]))

gulp.task('minify-js', () => tube([
	gulp.src(paths.js.dev),
	plumber(),
	watch(paths.js.dev),
	minifyJS({}),
	rename({suffix: '.min'}),
	bom(),
	gulp.dest(paths.js.prod),
	reloadServer()
]))

/*
 * Раньше здесь была проблема, связанная с тем, что для SCSS нужен нормальный вочер, который понимает @import-ы, а единственный такой на npm работает не совсем правильно, и его нельзя использовать совместно с gulp.src. Поэтому приходится делать вот так.
 * @TODO поискать более элегантное решение
 */

let scssTubes = [
	plumber(),
	sass.vars({ $VERSION: project.version }),
	sass.compile({outputStyle: 'compressed'}),
	csso(),
	rename({suffix: '.min'}),
	bom(),
	gulp.dest(paths.css.prod)
]

gulp.task('scss:full', () => tube(
	[gulp.src(paths.css.dev)].concat(scssTubes)
))

gulp.task('scss:dev', () => tube(
	[sass.watch(paths.css.dev)].concat(scssTubes, [reloadServer()])
))

gulp.task('scss', () => gulp.parallel('scss:full', 'scss:dev'))

gulp.task('default', gulp.parallel('pug', 'get-kamina', 'minify-js', 'scss'))
gulp.task('dev', gulp.parallel('liveReload', 'default'))
