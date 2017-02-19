// See https://habrahabr.ru/post/208890/

var gulp = require('gulp'), // Сообственно Gulp JS
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  jade = require('gulp-jade'), // Плагин для Jade
  stylus = require('gulp-stylus'), // Плагин для Stylus
  livereload = require('gulp-livereload'), // Livereload для Gulp
  myth = require('gulp-myth'), // Плагин для Myth - http://www.myth.io/
  csso = require('gulp-csso'), // Минификация CSS
  imagemin = require('gulp-imagemin'), // Минификация изображений
  uglify = require('gulp-uglify'), // Минификация JS
  concat = require('gulp-concat') // Склейка файлов
  ;

// Собираем html из Jade

var jadeTaskFunction = function (suffixArray) {

  var srcFilter = [];

  suffixArray.map(function (suffix) {
    return './assets/template/**/*' + suffix + '.jade';
  }).forEach(function (s) {
    srcFilter.push(s);
  });
  srcFilter.push('!./assets/template/**/_*.jade');

  return function () {
    gulp.src(srcFilter)
      .pipe(jade({
        pretty: true
      }))  // Собираем Jade только в папке ./assets/template/ исключая файлы с _*
      .on('error', console.log) // Если есть ошибки, выводим и продолжаем
      .pipe(rename(function (path) {
        suffixArray.forEach(function (e) {
          if (path.basename.endsWith(e)) {
            path.basename = path.basename.slice(0, -e.length);
          }
        });
      }))
      .pipe(gulp.dest('./public/')) // Записываем собранные файлы
    ;
  };
};
gulp.task('jadeStand', jadeTaskFunction(['.all', '.stand']));
gulp.task('jadeProduct', jadeTaskFunction(['.all', '.product']));

gulp.task('stylus', function () {
  gulp.src('./assets/stylus/screen.styl')
    .pipe(stylus()) // собираем stylus
    .on('error', console.log) // Если есть ошибки, выводим и продолжаем
    //.pipe(myth()) // добавляем префиксы - http://www.myth.io/
    .pipe(gulp.dest('./public/css/')) // записываем css
  ;
});

gulp.task('sass', function () {

  gulp.src('./assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css/'))
  ;

});

gulp.task('bootstrap', function () {
  gulp.src('./assets/bootstrap/fonts/**/*')
    .pipe(gulp.dest('./public/fonts/'))
  ;

  gulp.src([
    './assets/bootstrap/css/bootstrap.css',
    './assets/bootstrap/css/bootstrap-theme.css',
  ]).pipe(gulp.dest('./public/css/'))
  ;

  gulp.src(
    './assets/bootstrap/js/bootstrap.js'
  ).pipe(gulp.dest('./public/js/'))
  ;
});

// Запуск сервера разработки gulp watch
gulp.task('watch', function () {
  // Предварительная сборка проекта
  gulp.run('bootstrap');
  gulp.run('jadeStand');
  gulp.run('stylus');
  gulp.run('sass');

  gulp.watch('assets/template/**/*.jade', function () {
    gulp.run('jadeStand');
  });

  gulp.watch('assets/stylus/**/*.styl', function () {
    gulp.run('stylus');
  });

  gulp.watch('assets/sass/**/*.scss', function () {
    gulp.run('sass');
  });
});

// СБОРКА ПРОЕКТА
gulp.task('build', function () {
  gulp.run("jadeProduct");
});
