'use strict'

let
	gulp =      require('gulp'),
	rename =    require('gulp-rename'),
	watch =     require('gulp-watch'),
	plumber =   require('gulp-plumber'),
	composer =  require('gulp-uglify/composer'),
	uglifyjs =  require('uglify-es'),
	sass =      require('gulp-sass')

let minify = composer(uglifyjs, console)

let paths = {
	'js': {
		'dev': 'files/code/js/**/*.js',
		'prod': 'files/js/'
	},
	'css': {
		'dev': 'files/code/scss/**/*.scss',
		'prod': 'files/css/'
	}
}

gulp.task('minify-js', () => gulp.src(paths.js.dev)
	.pipe(plumber())
	.pipe(watch(paths.js.dev))
	.pipe(minify({}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.js.prod))
)

gulp.task('scss', () => gulp.src(paths.css.dev)
	.pipe(plumber())
	.pipe(watch(paths.css.dev))
	.pipe(sass({outputStyle: 'compressed'}))
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest(paths.css.prod))
)

gulp.task('default', ['minify-js', 'scss'])
