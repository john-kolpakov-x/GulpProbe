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

var jadeTaskFunction = function (suffixArray, destinationDir) {

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
            var s = ">>>> rename basename " + path.basename + " -> ";
            path.basename = path.basename.slice(0, -e.length);
            s += path.basename;
            console.log(s)
          }
        });
      }))
      .pipe(gulp.dest(destinationDir)) // Записываем собранные файлы
    ;
  };
};
gulp.task('jadeStand', jadeTaskFunction(['.all', '.stand'], './public/'));
gulp.task('jadeProduct', jadeTaskFunction(['.all', '.product'], './build/'));

var stylusTaskFunction = function (destinationDir) {

  return function () {

    gulp.src('./assets/stylus/screen.styl')
      .pipe(stylus()) // собираем stylus
      .on('error', console.log) // Если есть ошибки, выводим и продолжаем
      .pipe(myth()) // добавляем префиксы - http://www.myth.io/
      .pipe(gulp.dest(destinationDir + '/css/')) // записываем css
    ;

  };

};

gulp.task('stylus', stylusTaskFunction('./public'));

var sassTaskFunction = function (destinationDir) {

  return function () {
    gulp.src('./assets/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(destinationDir + '/css/'))
    ;
  };

};

gulp.task('sass', sassTaskFunction('./public'));

gulp.task('bootstrapStand', function () {
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
gulp.task('bootstrapProduct', function () {
  gulp.src('./assets/bootstrap/fonts/**/*')
    .pipe(gulp.dest('./build/fonts/'))
  ;

  gulp.src([
    './assets/bootstrap/css/bootstrap.min.css',
    './assets/bootstrap/css/bootstrap-theme.min.css',
  ]).pipe(gulp.dest('./build/css/'))
  ;

  gulp.src(
    './assets/bootstrap/js/bootstrap.min.js'
  ).pipe(gulp.dest('./build/js/'))
  ;
});

// Запуск сервера разработки gulp watch
gulp.task('watch', function () {
  // Предварительная сборка проекта
  gulp.run('bootstrapStand');
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
  gulp.run("bootstrapProduct");

  sassTaskFunction('./build')();
  stylusTaskFunction('./build')();
});
