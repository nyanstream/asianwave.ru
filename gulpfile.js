'use strict'

let
	project =     require('./package.json'),
	gulp =        require('gulp'),
	tube =        require('gulp-pipe'),
	bom =         require('gulp-bom'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	plumber =     require('gulp-plumber'),
	csso =        require('gulp-csso'),
	pug =         require('gulp-pug'),
	liveServer =  require('browser-sync')

let sass = {
	compile:  require('gulp-sass'),
	watch:    require('gulp-watch-sass'),
	vars:     require('gulp-sass-variables')
}

let uglify = {
	core:      require('uglify-es'),
	composer:  require('gulp-uglify/composer')
}

let
	minifyJS = uglify.composer(uglify.core, console),
	reloadServer = () => liveServer.stream()

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

gulp.task('liveReload', () => liveServer({
	server: { baseDir: paths.html.prod },
	port: 8080,
	notify: false
}))

gulp.task('pug', () => tube([
	watch(paths.html.dev, { ignoreInitial: false }),
	plumber(),
	pug({ locals: {
		VERSION: project.version,
		PATHS: {
			js: `/${folders.prod.main}/js`,
			css: `/${folders.prod.main}/css`,
			img: `/${folders.prod.main}/img`,
			other: `/${folders.prod.main}/other`
		}
	}}),
	bom(),
	rename(file => {
		switch (file.dirname) {
			case 'api':
				file.extname = '.php'; break
			case 'other':
				file.dirname = `${folders.prod.main}/${file.dirname}`
				file.extname = '.htm'
		}
	}),
	gulp.dest(paths.html.prod),
	reloadServer()
]))

gulp.task('get-kamina', () => tube([
	gulp.src(paths.js.kamina),
	bom(),
	gulp.dest(paths.js.prod)
]))

gulp.task('minify-js', () => tube([
	watch(paths.js.dev, { ignoreInitial: false }),
	plumber(),
	minifyJS({}),
	bom(),
	rename({suffix: '.min'}),
	gulp.dest(paths.js.prod),
	reloadServer()
]))

/*
 * Раньше здесь была проблема, связанная с тем, что для SCSS нужен нормальный вочер, который понимает @import-ы, а единственный такой на npm работает не совсем правильно, и его нельзя использовать совместно с gulp.src. Поэтому приходится делать вот так.
 * @TODO решение не сработало, найти новое
 */

let scssTubes = [
	plumber(),
	sass.vars({ $VERSION: project.version }),
	sass.compile({outputStyle: 'compressed'}),
	csso(),
	bom(),
	rename({suffix: '.min'}),
	gulp.dest(paths.css.prod)
]

gulp.task('scss:only-compile', () => tube(
	[gulp.src(paths.css.dev)].concat(scssTubes)
))

gulp.task('scss:dev', () => tube(
	[sass.watch(paths.css.dev)].concat(scssTubes, [reloadServer()])
))

gulp.task('default', ['pug', 'get-kamina', 'minify-js', 'scss:dev'])
gulp.task('dev', ['liveReload', 'default'])
