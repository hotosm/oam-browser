var gulp = require('gulp');
var compass = require('gulp-compass');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
// Used to stream bundle for further handling
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash').assign;
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');


////////////////////////////////////////////////////////////////////////////////
//--------------------------- Variables --------------------------------------//
//----------------------------------------------------------------------------//

// Control whether the browser should reload.
var shouldReload = true;
// Control weather we're watching for changes.
// Basically means the watch task was called.
var shouldWatch = false;
// Environment for the script.
var ENV = 'development';

////////////////////////////////////////////////////////////////////////////////
//------------------------- Callable tasks -----------------------------------//
//----------------------------------------------------------------------------//

// Default task.
// Builds the website, watches for changes and starts browserSync.
gulp.task('default', function(done) {
  shouldWatch = true;
  runSequence('build', 'watch', 'browser-sync', done);
});

// Main build task
gulp.task('build', function(done) {
  runSequence(['copy_files', 'scripts', 'compass'], done);
});

// Prod build task
gulp.task('prod', function(done) {
  // Change environment.
  ENV = 'production';
  runSequence('clean', ['copy_files', 'scripts', 'compass'], done);
});

// Clean.
gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('no-reload', function(done) {
  shouldReload = false;
  shouldWatch = true;
  runSequence('build', 'watch', 'browser-sync', done);
});


////////////////////////////////////////////////////////////////////////////////
//------------------------- Browserify tasks ---------------------------------//
//--------------------- (Not directly callable) ------------------------------//
//----------------------------------------------------------------------------//

gulp.task('scripts:build', function() {
  var b = browserify({
    entries: ['./app/assets/scripts/main.js'],
    debug: true,
    transform: [reactify],
  })
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    .pipe(buffer());

    // Source maps.
    if (ENV != 'production') {
      b = b.pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'));
    }

    if (ENV == 'production') {
      b = b.pipe(streamify(uglify()));
    }

    // Output.
    b.pipe(gulp.dest('./dist/assets/scripts'));

});

gulp.task('scripts:build:watch', function() {
  var watcher  = watchify(browserify({
    entries: ['./app/assets/scripts/main.js'],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  return watcher.on('update', function () {
    watcher.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('main.js'))
      .pipe(buffer())
      // Source maps.
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/assets/scripts'))
      .on('end', browserReload);
      console.log('Scripts updated');
  })
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    .pipe(buffer())
    // Source maps.
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/assets/scripts'))
    .on('end', browserReload);
});


////////////////////////////////////////////////////////////////////////////////
//--------------------------- Helper tasks -----------------------------------//
//----------------------------------------------------------------------------//

// I'm watching you!
gulp.task('watch', function() {

  gulp.watch('app/assets/styles/**/*.scss', function() {
    runSequence('compass', browserReload);
  });

  gulp.watch(['app/**/*', '!app/assets/styles/**', '!app/assets/scripts/**'], function() {
    runSequence('copy_files', browserReload);
  });
});

gulp.task('scripts', function(done) {
  runSequence(shouldWatch ? 'scripts:build:watch' : 'scripts:build', done);
});

gulp.task('copy_files', function() {
  return gulp.src(['app/**/*', '!app/assets/styles/**', '!app/assets/scripts/**'])
    .pipe(gulp.dest('dist'));
});

gulp.task('compass', function() {
  return gulp.src('app/assets/styles/*.scss')
    .pipe(compass({
      css: 'dist/assets/styles',
      sass: 'app/assets/styles',
      style: ENV = 'production' ? 'compressed' : 'expanded',
      sourcemap: ENV = 'production' ? false : true,
      bundle_exec: true
    }));
});

// Setup browserSync.
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./dist"
    }
  });
});


////////////////////////////////////////////////////////////////////////////////
//------------------------- Helper functions ---------------------------------//
//----------------------------------------------------------------------------//

function browserReload() {
  if (shouldReload) {
    browserSync.reload();
  }
}
