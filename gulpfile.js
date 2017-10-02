'use strict'

let
	gulp =        require('gulp'),
	bom =         require('gulp-bom'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	watch_sass =  require('gulp-watch-sass'),
	plumber =     require('gulp-plumber'),
	composer =    require('gulp-uglify/composer'),
	uglifyjs =    require('uglify-es'),
	sass =        require('gulp-sass'),
	csso =        require('gulp-csso'),
	pug =         require('gulp-pug'),
	liveServer =  require('browser-sync')

let
	minify = composer(uglifyjs, console),
	reloadServer = () => liveServer.stream()

let paths = {
	html: {
		dev: ['source/pug/**/*.pug', '!source/pug/inc/**/*.pug'],
		prod: 'build/'
	},
	js: {
		dev: 'source/js/**/*.js',
		prod: 'build/files/js/',
		kamina: 'node_modules/kamina-js/dist/*.min.js',
	},
	css: {
		dev: 'source/scss/**/*.scss',
		prod: 'build/files/css/'
	}
}

gulp.task('liveReload', () => liveServer({
	server: {
		baseDir: 'build/'
	},
	port: 8080,
	notify: false
}))

gulp.task('pug', () => gulp.src(paths.html.dev)
	.pipe(plumber())
	.pipe(watch(paths.html.dev))
	.pipe(pug({}))
	.pipe(bom())
	.pipe(gulp.dest(paths.html.prod))
	.pipe(reloadServer())
)

gulp.task('get-kamina', () => gulp.src(paths.js.kamina)
	.pipe(bom())
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('minify-js', () => gulp.src(paths.js.dev)
	.pipe(plumber())
	.pipe(watch(paths.js.dev))
	.pipe(minify({}))
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.js.prod))
	.pipe(reloadServer())
)

gulp.task('scss', () => watch_sass(paths.css.dev)
	.pipe(plumber())
	//.pipe(watch_sass(paths.css.dev))
	//gulp.src(paths.css.dev)
	.pipe(sass({outputStyle: 'compressed'}))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.css.prod))
	.pipe(reloadServer())
)

gulp.task('default', ['pug', 'get-kamina', 'minify-js', 'scss'])
gulp.task('dev', ['liveReload', 'default'])
