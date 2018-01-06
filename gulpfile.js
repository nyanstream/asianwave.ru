'use strict'

let
	project =      require('./package.json'),
	gulp =         require('gulp'),
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

gulp.task('liveReload', () => live_server({
	server: { baseDir: 'build/' },
	port: 8080,
	notify: false
}))

gulp.task('pug', () => gulp.src(paths.html.dev)
	.pipe(plumber())
	.pipe(watch(paths.html.dev))
	.pipe(pug({ locals: { VERSION: project.version } }))
	.pipe(rename(file => {
		switch (file.dirname) {
			case 'api':
				file.extname = '.php'; break
			case 'other':
				file.dirname = `files/${file.dirname}`
				file.extname = '.htm'
		}
	}))
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
	.pipe(minifyJS({}))
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.js.prod))
	.pipe(reloadServer())
)

gulp.task('scss', () => sass.watch(paths.css.dev)
	//gulp.src(paths.css.dev)
	.pipe(plumber())
	.pipe(sass.vars({ $VERSION: project.version }))
	.pipe(sass.compile({outputStyle: 'compressed'}))
	.pipe(csso())
	.pipe(rename({suffix: '.min'}))
	.pipe(bom())
	.pipe(gulp.dest(paths.css.prod))
	.pipe(reloadServer())
)

gulp.task('default', gulp.parallel('pug', 'get-kamina', 'minify-js', 'scss'))
gulp.task('dev', gulp.parallel('liveReload', 'default'))
