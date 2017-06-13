// Gulp.js configuration
var
  // modules
  gulp = require('gulp'),
  webserver = require('gulp-webserver'),
  plumber = require('gulp-plumber'),
  flatmap = require('gulp-flatmap'),
  streamify = require('stream-array'),
  through = require('through2'),
  handlebars = require('gulp-compile-handlebars'),
  // gulpHandlebars = require('gulp-compile-handlebars')(handlebars), //default to require('handlebars') if not provided
  rename = require('gulp-rename'),
  clean = require('gulp-clean'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  concat = require('gulp-concat'),
  deporder = require('gulp-deporder'),
  stripdebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  assets = require('postcss-assets'),
  autoprefixer = require('autoprefixer'),
  mqpacker = require('css-mqpacker'),
  cssnano = require('cssnano'),
  path = require('path'),
  // development mode?
  devBuild = (process.env.NODE_ENV !== 'production'),

  // folders
  folder = {
    src: 'src/',
    build: 'build/'
  };

// image processing
gulp.task('images', function () {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(plumber())
    .pipe(newer(out))
    .pipe(imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(out));
});

// HTML processing
gulp.task('html', ['clear-html', 'images'], function () {
  var
    out = folder.build,
    page = gulp.src(folder.src + 'html/**/*')
    .pipe(newer(out));

  // minify production code
  if (!devBuild) {
    page = page.pipe(htmlclean());
  }

  return page.pipe(plumber()).pipe(gulp.dest(out));
});

//compile handlebars
gulp.task('handlebars', ['clear-html'], function () {
  var templateData,
    options = {
      batch: ['./' + folder.src + 'html/partials'],
      allowedExtensions: ['hbs'],
      ignorePartials: true
    };

  return gulp.src('./page-manifest.json')
    .pipe(flatmap(function (stream, file) {
      var contents = JSON.parse(file.contents.toString('utf8'));
      var src, build;
      //contents.files is an array
      return streamify(contents.pages)
        .pipe(through.obj(function (page, enc, cb) {
          src = page.src;
          build = page.build;
          templateData = page.data;
          this.push(gulp.src('./' + src)
            .pipe(handlebars(templateData, options))
            .pipe(rename(build))
            .pipe(gulp.dest(folder.build))
          );
          cb();
        }))
    }))
});
// JavaScript processing
gulp.task('js', ['clear-js'], function () {

  var jsbuild = gulp.src(folder.src + 'js/**/*')
    .pipe(plumber())
    .pipe(deporder())
    .pipe(concat('main.js'));

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

// CSS processing
gulp.task('css', ['clear-css', 'images'], function () {

  var postCssOpts = [
    assets({
      loadPaths: ['images/']
    }),
    autoprefixer({
      browsers: ['last 2 versions', '> 2%']
    }),
    mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/main.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true,
    }))
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(folder.build + 'css/'));
});

// clear html files
gulp.task('clear-html', function () {
  return gulp.src(folder.build + '/**/*.html', {
      read: false
    })
    .pipe(clean());
});

// clear images files
gulp.task('clear-images', function () {
  return gulp.src(folder.build + 'images', {
      read: false
    })
    .pipe(clean());
});

// clear js files
gulp.task('clear-js', function () {
  return gulp.src(folder.build + 'js', {
      read: false
    })
    .pipe(clean());
});

// clear js files
gulp.task('clear-css', function () {
  return gulp.src(folder.build + 'css', {
      read: false
    })
    .pipe(clean());
});

// clear all
gulp.task('clear-all', ['clear-html', 'clear-images', 'clear-js', 'clear-css']);

// run all tasks
gulp.task('run', ['handlebars', 'css', 'js']);

// watch for changes
gulp.task('watch', function () {
  // image changes
  gulp.watch(folder.src + 'images/**/*', ['images']);

  // html changes
  gulp.watch(folder.src + 'html/**/*', ['handlebars']);

  // new page changes
  gulp.watch(folder.src + '../page-manifest.json', ['handlebars']);

  // javascript changes
  gulp.watch(folder.src + 'js/**/*', ['js']);

  // css changes
  gulp.watch(folder.src + 'scss/**/*', ['css']);

});

// gulp server
gulp.task('serve', ['run', 'watch'], function () {
  gulp.src(folder.build)
    .pipe(plumber())
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

// default task
gulp.task('default', ['run', 'watch']);