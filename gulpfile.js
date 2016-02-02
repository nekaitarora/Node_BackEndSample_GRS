'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');
var jsdoc = require('gulp-jsdoc');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps'),
livereload = require('gulp-livereload'),
sass = require('gulp-ruby-sass'),
uglify = require('gulp-uglify'),
nodemon = require('gulp-nodemon'),
jshint = require('gulp-jshint');
var cleanup = require('gulp-clean');

var paths = {
    livereload: ['public/styles/**/*.css', 'views/**/*.jade'],
    sass: ['scss/**/*.scss'],
    scripts: ['public/scripts/**/*.js', '!public/scripts/vendor/**/*.js', '!public/scripts/dist/**/*.js'],
    jshintpath : ['controllers/**/*.js', 'models/**/*.js', 'lib/**/*.js', 'routes/**/*.js']
};

gulp.task('livereload', function () {
    return gulp.src(paths.livereload)
        .pipe(livereload());
});

gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({style: 'compressed'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('scripts', function () {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/scripts/dist'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.livereload, ['livereload']);
});

gulp.task('lint', function () {
    gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function () {
    nodemon({ script: 'index.js', ext: 'html js', ignore: ['public/*']})
        .on('change', ['lint'])
        .on('restart', function () {
            console.log('restarted!');
        });
});

// The build task (called when you run `gulp build` from cli)
gulp.task('install', ['lint', 'sass', 'scripts']);

// The default task (called when you run `gulp` from cli) *
gulp.task('default', ['lint', 'sass', 'scripts', 'watch', 'nodemon']);

gulp.task('build-watch', ['lint', 'sass', 'scripts', 'watch']);

gulp.task('clean-doc', function () {
    return gulp.src('docs', { read: false })
      .pipe(cleanup());
});

gulp.task('doc', ['clean-doc'], function () {
    return gulp.src(paths.jshintpath)
      .pipe(jsdoc('docs'));
});

gulp.task('lint', function () {
    gulp.src(paths.jshintpath)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));

    gulp.src(paths.jshintpath)
        .pipe(jscs({configPath: '.jscsrc'}))        // enforce style guide
        .on('warning', function () {
            process.exit(1);                        // Stop on error
        })
        .pipe(stylish());                           // log style errors
});

gulp.task('docs', ['doc']);
