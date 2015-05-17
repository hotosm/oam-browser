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


// From: https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
// Add custom browserify options here
var customOpts = {
  entries: ['./app/assets/scripts/main.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts)); 
// Add transformations here
b.transform(reactify);

gulp.task('scripts:build', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist/assets/scripts'))
    .on('end', browserReload);
}



gulp.task('copy_files', function() {
  return gulp.src(['app/**/*', '!app/assets/styles/**', '!app/assets/scripts/**'])
    .pipe(gulp.dest('dist'));
});

gulp.task('compass', function() {
  return gulp.src('app/assets/styles/*.scss')
    .pipe(compass({
      css: 'dist/assets/styles',
      sass: 'app/assets/styles',
      style: 'expanded',
      sourcemap: true,
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

// Main build task
gulp.task('build', function(done) {
  runSequence(['copy_files', 'scripts', 'compass'], done);
});

gulp.task('scripts', function(done) {
  runSequence('scripts:build', done);
});

// I'm watching you!
gulp.task('watch', function() {
  gulp.watch('app/assets/styles/**/*.scss', function() {
    runSequence('compass', browserReload);
  });

  gulp.watch(['app/**/*', '!app/assets/styles/**', '!app/assets/scripts/**'], function() {
    runSequence('copy_files', browserReload);
  });
});

// Default task.
// Builds the website, watches for changes and starts browserSync.
gulp.task('default', function(done) {
  runSequence('build', 'watch', 'browser-sync', done);
});

var shouldReload = true;
gulp.task('no-reload', function(done) {
  shouldReload = false;
  runSequence('build', 'watch', 'browser-sync', done);
});

////////////////////////////////////////////////////////////////////////////////
//------------------------- Helper functions ---------------------------------//
//----------------------------------------------------------------------------//

function browserReload() {
  if (shouldReload) {
    browserSync.reload();
  }
}
