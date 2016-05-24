'use strict';

const _ = require('lodash');
const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const template = require('gulp-template');
const rename = require('gulp-rename');
const ngAnnotate = require('gulp-ng-annotate');
const ngTemplates = require('gulp-ng-templates');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const inject = require('gulp-inject');
const series = require('stream-series');
const fsp = require('fs-promise');
const runSequence = require('run-sequence');


const SETTINGS = {
  OUT_PATH: path.resolve(__dirname, 'public'),
  SOURCES_PREFIX: new Date().getTime(),
  WATCH_INTERVAL: 500,
  BABEL: {presets: ['es2015']},
  NG_ANNOTATAE: {add: true, single_quotes: true, sourcemap: false, sourceMap: false},
  NG_TEMPLTES: {module: 'client.templates', standalone: true}
};

const PATHS = {
  CLIENT: {
    ASSETS: [
      'lib/client/index.html'
    ],
    JS: [
      '!lib/client/api/**',
      'lib/client/core/app/config.js',
      'lib/client/core/app/init.js',
      'lib/client/*/*.js',
      'lib/client/**/*.js'
    ],
    CSS: [
      '!lib/client/api/**',
      'lib/client/**//*.css'
    ],
    TEMPLATES: [
      '!lib/client/api/**',
      './lib/client/**/*.html'
    ]
  },
  COMPONENTS: {
    JS: [
      'lib/bower/jquery/dist/jquery.min.js',
      'lib/bower/metisMenu/dist/metisMenu.js',
      'lib/bower/lodash/dist/lodash.min.js',
      'lib/bower/chosen/chosen.jquery.js',
      'lib/bower/sweetalert/dist/sweetalert.min.js',
      'lib/bower/moment/min/moment-with-locales.js',
      'lib/bower/moment-timezone/builds/moment-timezone-with-data.min.js',
      'lib/bower/jstzdetect/jstz.min.js',
      'lib/bower/angular/angular.js',
      'lib/bower/angular-timezone-selector/dist/angular-timezone-selector.min.js',
      'lib/bower/angular-sanitize/angular-sanitize.min.js',
      'lib/bower/angular-resource/angular-resource.js',
      'lib/bower/ngSweetAlert/SweetAlert.js',
      'lib/bower/angular-animate/angular-animate.js',
      'lib/bower/angular-messages/angular-messages.js',
      'lib/bower/ngstorage/ngStorage.js',
      'lib/bower/angular-ui-router/release/angular-ui-router.js',
      'lib/bower/angular-ui-utils/ui-utils.js',
      'lib/bower/angular-bootstrap/ui-bootstrap-tpls.js',
      'lib/bower/angular-file-upload/dist/angular-file-upload.js',
      'lib/bower/owasp-password-strength-test/owasp-password-strength-test.js',
      'lib/bower/ui-select/dist/select.min.js',
      'lib/bower/angular-i18n/angular-locale_ru-ru.js',
      'lib/bower/angular-toastr/dist/angular-toastr.min.js',
      'lib/bower/angular-toastr/dist/angular-toastr.tpls.min.js',
      'lib/bower/angular-loading-bar/build/loading-bar.min.js',
      'lib/bower/ng-img-crop-full-extended/compile/minified/ng-img-crop.js',
      'lib/vendor/ng-infinite-scroll.js',
      'lib/bower/angular-input-masks/angular-input-masks-standalone.js',
      'lib/scripts.js'
    ],
    CSS: [
      'lib/bower/bootstrap/dist/css/bootstrap.css',
      'lib/bower/animate.css/animate.min.css',
      'lib/bower/metisMenu/dist/metisMenu.css',
      'lib/bower/angular-toastr/dist/angular-toastr.min.css',
      'lib/bower/angular-loading-bar/build/loading-bar.min.css',
      'lib/bower/chosen/chosen.css',
      'lib/bower/sweetalert/dist/sweetalert.css',
      'lib/bower/ng-img-crop-full-extended/compile/minified/ng-img-crop.css'
    ],
    FONTS: [
      'lib/bower/fontawesome/**'
    ]
  }
};

gulp.task('default', () => {
  runSequence('clean', ['client', 'components'], 'injector');
});

gulp.task('watch', ['default'], () => {
  gulp.watch([PATHS.CLIENT.JS], {interval: SETTINGS.WATCH_INTERVAL}, ['client.js']);
  gulp.watch([PATHS.CLIENT.TEMPLATES], {interval: SETTINGS.WATCH_INTERVAL}, ['client.templates']);
  gulp.watch([PATHS.CLIENT.CSS], {interval: SETTINGS.WATCH_INTERVAL}, ['client.css']);
});

gulp.task('clean', () => {
  return gulp.src(`${SETTINGS.OUT_PATH}/*`, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('client', ['client.js', 'client.templates', 'client.css']);
gulp.task('client.js', () => {
  return gulp.src(PATHS.CLIENT.JS)
    .pipe(plumber())
    .pipe(babel(SETTINGS.BABEL))
    .pipe(ngAnnotate(SETTINGS.NG_ANNOTATAE))
    .pipe(concat(`application${SETTINGS.SOURCES_PREFIX}.js`))
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'js')));
});
gulp.task('client.templates', () => {
  return gulp.src(PATHS.CLIENT.TEMPLATES)
    .pipe(ngTemplates(SETTINGS.NG_TEMPLTES))
    .pipe(concat(`client.templates${SETTINGS.SOURCES_PREFIX}.js`))
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'js')));
});
gulp.task('client.css', () => {
  return gulp.src(PATHS.CLIENT.CSS)
    .pipe(concat(`application${SETTINGS.SOURCES_PREFIX}.css`))
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'css')));
});

gulp.task('components', ['components.js', 'components.css', 'components.fonts']);
gulp.task('components.js', () => {
  return gulp.src(PATHS.COMPONENTS.JS)
    .pipe(concat(`components${SETTINGS.SOURCES_PREFIX}.js`))
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'js')));
});
gulp.task('components.css', () => {
  return gulp.src(PATHS.COMPONENTS.CSS)
    .pipe(concat(`components${SETTINGS.SOURCES_PREFIX}.css`))
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'css')));
});
gulp.task('components.fonts', () => {
  return gulp.src(PATHS.COMPONENTS.FONTS)
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH, 'fonts')));
});

gulp.task('injector', () => {
  let componentsCSS = gulp.src(path.resolve(SETTINGS.OUT_PATH, `css/components${SETTINGS.SOURCES_PREFIX}.css`), {read: false});
  let appCSS = gulp.src(path.resolve(SETTINGS.OUT_PATH, `css/application${SETTINGS.SOURCES_PREFIX}.css`), {read: false});
  let componentsJS = gulp.src(path.resolve(SETTINGS.OUT_PATH, `js/components${SETTINGS.SOURCES_PREFIX}.js`), {read: false});
  let templatesJS = gulp.src(path.resolve(SETTINGS.OUT_PATH, `js/client.templates${SETTINGS.SOURCES_PREFIX}.js`), {read: false});
  let appJS = gulp.src(path.resolve(SETTINGS.OUT_PATH, `js/application${SETTINGS.SOURCES_PREFIX}.js`), {read: false});
  return gulp.src(PATHS.CLIENT.ASSETS)
    .pipe(inject(series(componentsCSS, appCSS, componentsJS, templatesJS, appJS), {ignorePath: 'public', addRootSlash: false}))
    .pipe(gulp.dest(path.resolve(SETTINGS.OUT_PATH)));
});
