(function() {
    'use strict';

    var concat = require('gulp-concat');
    var gulp = require('gulp');
    var del = require('del');
    var path = require('path');
    var insert = require('gulp-insert');
    var karma = require('karma');
    var ngAnnotate = require('gulp-ng-annotate');
    var sass = require('gulp-sass');
    var sourcemaps = require('gulp-sourcemaps');
    var wiredep = require('wiredep').stream;
    var coffee = require('gulp-coffee');
    var filter = require('gulp-filter');

    var paths = {
        sass: ['app/sass/app.sass', 'app/dashboard/modules/**/*.sass'],
        js: ['app/**/*.module.js', 'app/**/*.js', '!app/resources/**/*.js', '!app/**/*.spec.js'],
        main: {
            directory: 'app',
            template: 'index.tpl.html',
            generated: 'index.html'
        },
        bower: 'bower.json',
        coffee: ['app/**/*.coffee']
    };

    gulp.task('sass', function() {
        gulp.src(paths.sass)
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(concat('style.css'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./app/resources/css/'));
    });

    gulp.task('sass:watch', function() {
        gulp.watch('./app/**/*.sass', ['sass']);
    });

    gulp.task('js', function() {
        var coffeeFilter = filter('**/*.coffee', { restore: true });
        var jsFilter = filter('**/*.js');

        gulp.src(paths.js.concat(paths.coffee))
            .pipe(sourcemaps.init())
            .pipe(coffeeFilter)
            .pipe(coffee())
            .pipe(coffeeFilter.restore)
            .pipe(jsFilter)
            .pipe(concat('app.js'))
            .pipe(ngAnnotate())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./app/resources/js/'));
    });

    gulp.task('js:watch', function() {
        gulp.watch(['./app/**/*.js', '!./app/resources/**/*.js', './app/**/*.coffee'], ['js']);
    });

    gulp.task('bower', function() {
        gulp.src(paths.main.directory + '/' + paths.main.template)
            .pipe(wiredep())
            .pipe(insert.prepend('<!-- NOTE: This file has been generated automatically -->\n'))
            .pipe(concat(paths.main.generated))
            .pipe(gulp.dest(paths.main.directory));
    });

    gulp.task('bower:watch', function() {
        gulp.watch(paths.bower, ['bower']);
    });

    gulp.task('test', function(done) {
        new karma.Server({
            configFile: __dirname + '/karma.conf.js',
            singleRun: true
        }).start(done);
    });

    gulp.task('test:watch', function(done) {
        new karma.Server({
            configFile: __dirname + '/karma.conf.js'
        }).start(done);
    });

    gulp.task('default', [
        'sass',
        'js',
        'bower',
        'test'
    ]);

    gulp.task('watch', [
      'bower:watch',
      'sass:watch',
      'js:watch',
      'test:watch']);
})();
