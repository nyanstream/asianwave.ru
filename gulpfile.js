'use strict'

let
	gulp =      require('gulp'),
	rename =    require('gulp-rename'),
	watch =     require('gulp-watch'),
	composer =  require('gulp-uglify/composer'),
	uglifyjs =  require('uglify-es'),
	sass =      require('gulp-sass'),
	pump =      require('pump')

let minify = composer(uglifyjs, console)

let paths = {
	'js': 'files/js/',
	'js_dev': 'files/code/js/**/*.js',
	'css': 'files/css/',
	'scss_dev': 'files/code/scss/**/*.scss'
}

gulp.task('minify-js', (cb) => {
  pump([
    gulp.src(paths.js_dev),
		watch(paths.js_dev),
    minify({}),
    rename({suffix: '.min'}),
    gulp.dest(paths.js)
  ], cb)
})

gulp.task('scss', (cb) => {
  pump([
    gulp.src(paths.scss_dev),
		watch(paths.scss_dev),
    sass({outputStyle: 'compressed'}).on('error', sass.logError),
    rename({suffix: '.min'}),
    gulp.dest(paths.css)
  ], cb)
})

gulp.task('watch', () => {
	//gulp.watch(paths.js_dev, ['minify-js'])
	//gulp.watch(paths.scss_dev, ['scss'])
})

gulp.task('default', ['minify-js', 'scss'])
