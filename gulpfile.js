'use strict';

const gulp            = require('gulp');
const webpackStream   = require('webpack-stream');
const webpack         = require('webpack');
const webpackConfig   = require('./webpack.config.js');
const zip             = require('gulp-zip');
const clean           = require('gulp-clean');
const runSequence     = require('run-sequence');


const TARGET_DIR              = 'chrome';
const TARGET_MINIFIED_DIR     = 'chrome_minified';



// CLEAN
gulp.task('clean', function () {
  return gulp.src(`${TARGET_DIR}/`, {read: false})
    .pipe(clean());
});

// CLEAN MINIFIED
gulp.task('clean-production', function () {
  return gulp.src(`${TARGET_MINIFIED_DIR}/`, {read: false})
    .pipe(clean());
});


// IMAGES
gulp.task('images', function() {
  return gulp.src('./assets/images/**/*.*')
    .pipe(gulp.dest(`./${TARGET_DIR}/public/images/`));
});

// IMAGES FOR MINIFIED
gulp.task('images-production', function() {
  return gulp.src('./assets/images/**/*.*')
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}/public/images/`));
});




// LIB
gulp.task('lib', function() {
  return gulp.src('./assets/lib/**/*.*')
    .pipe(gulp.dest(`./${TARGET_DIR}/public/lib/`));
});

// LIB FOR MINIFIED
gulp.task('lib-production', function() {
  return gulp.src('./assets/lib/**/*.*')
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}/public/lib/`));
});





// HTML
gulp.task('html', function() {
  return gulp.src('./assets/**.html')
    .pipe(gulp.dest(`./${TARGET_DIR}`));
});

// HTML FOR MINIFIED
gulp.task('html-production', function() {
  return gulp.src('./assets/*.html')
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}`));
});



// FAVICON
gulp.task('favicon', function() {
  return gulp.src('./assets/images/favicon/dev/**.*')
    .pipe(gulp.dest(`./${TARGET_DIR}/public/images/favicon/`));
});

// FAVICON FOR MINIFIED
gulp.task('favicon-production', function() {
  return gulp.src('./assets/images/favicon/production/**.*')
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}/public/images/favicon/`));
});




// MANIFEST
gulp.task('manifest', function() {
  return gulp.src('./assets/manifest.json')
    .pipe(gulp.dest(`./${TARGET_DIR}`));
});

// MANIFEST FOR MINIFIED
gulp.task('manifest-production', function() {
  return gulp.src('./assets/manifest.json')
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}`));
});


// MOVE FOR DEV
gulp.task('move', ['images', 'lib', 'html', 'favicon', 'manifest']);

// MOVE FOR MINIFIED
gulp.task('move-production', ['images-production', 'lib-production', 'html-production', 'favicon-production', 'manifest-production']);


// WEBPACK
gulp.task('webpack', function() {
  // PACK NON-UGLIFIED
  return gulp.src('./assets')
    .pipe(webpackStream(webpackConfig.debug, webpack))
    .pipe(gulp.dest(`./${TARGET_DIR}/public/js`));
});


// WEBPACK FOR MINIFIED
gulp.task('webpack-production', function() {
  // PACK PROD UGLIFIED
  return gulp.src('./assets')
    .pipe(webpackStream(webpackConfig.uglified, webpack))
    .pipe(gulp.dest(`./${TARGET_MINIFIED_DIR}/public/js`));
});



/*
* UNMINIFIED BUILD PROCESS
*
* $ gulp dev
*/
gulp.task('dev', function() {
  runSequence('clean', 'move', 'webpack');

  gulp.watch('./assets/**/*', ['webpack']);
  gulp.watch('./assets/**.html', ['html']);
  gulp.watch('./assets/manifest.json', ['manifest']);

  console.log('Watching...');
});



/*
* MINIFIED BUILD PROCESS
*
* $ gulp
*/
gulp.task('default', function() {
  runSequence('clean-production', 'move-production', 'webpack-production', 'zip');
});



// ZIP UP THE MINIFIED VERSION
gulp.task('zip', function() {
  return gulp.src(`./${TARGET_MINIFIED_DIR}/**/*`)
    .pipe(zip('chrome_extension.zip'))
    .pipe(gulp.dest('./'));
});


/*
* SET ENVIRONMENT
*
*/

// gulp.task('production-env', function() {
//   return process.env.NODE_ENV = 'production';
// });


module.exports = gulp;