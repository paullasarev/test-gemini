var gulp = require('gulp');
var gutil = require('gulp-util');
var _ = require('lodash');
var del = require('del');
var webserver = require('gulp-webserver');
var path = require('path');
//var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var cssbeautify = require('gulp-cssbeautify');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var exorcist = require('exorcist');
var transform = require('vinyl-transform');
var buffer = require('vinyl-buffer');
var jade = require('gulp-jade');
var jadeAffected = require('gulp-jade-find-affected');
var fs = require('fs');
var mkdirp = require('mkdirp');
var react = require('gulp-react');


var onError = function (err) {
    gutil.log(gutil.colors.red("ERROR", err.plugin), err.message);
    this.emit("end", new gutil.PluginError(err.plugin, err, { showStack: true }));
  };

require('events').EventEmitter.defaultMaxListeners = 100;

var isDist = function() {
  var ind = process.argv.indexOf("--dist");
  return (ind > -1);
}();

var conf = {
  dist: {
    dir:'dist',
  },
  dev: {
    dir: 'dev',
  },
  src: {
    react: [
      'src/js/components/**/*.jsx',
    ],
    jade: [
      'src/*.jade'
    ],
    jadeWatch: [
      'src/**/*.jade'
    ],
    docs: [
      'docs/**/*.png'
    ],
    styles: [
      'src/**/*.{css,less}'
    ],
    stylesRoot: [
      'src/style/app.less',
      'src/style/app-ie.less',
      // 'bower_components/bootstrap/less/bootstrap.less',
    ],
    fonts: [
      'src/**/*.{ttf,eot,woff,woff2}',
      'bower_components/bootstrap/fonts/*.{ttf,eot,woff,woff2}',
    ],
    images: [
      'src/**/*.{png,jpg,gif,svg,ico}'
    ],
    libs: [
      "bower_components/jquery/dist/jquery.js",
      "bower_components/underscore/underscore.js",
      "bower_components/react/react-with-addons.js",
      "bower_components/react/react-dom.js",
      "bower_components/classnames/index.js",
    ],
    polyfills: [
      "bower_components/console-polyfill/index.js",
      "bower_components/es5shim/es5shim.js",
      "bower_components/html5shiv/html5shiv.js",
    ],
    services: [
      'src/js/services/**/*.js'
    ],
  },
  dest: {
    js: 'components.js',
    libs: 'libs.js',
    polyfills: 'polyfills.js',
    services: 'services.js',
    css: 'app.css',
    stylesDir: 'style',
    imagesDir: 'style/img',
    fontsDir: 'style/fonts',
    scriptsDir: 'js'
  },
};

if (isDist) {
  conf.dev.dir = './dist';
}


require("./test/gulpfile-gemini")(conf);


var autoprefixerBrowsers = [
  'ie >= 9',
//  'ie_mob >= 10',
  'ff >= 33',
  'chrome >= 39',
  'safari >= 7',
  'opera >= 25',
  'ios >= 7.1',
  'android >= 4.0',
//  'bb >= 10'
];

var packagesOrder = [
  '*jquery*',
  '!*angular*',
  '*angular.js',
  '*angular*'
];

gulp.task('build:dev', function (callback) {
  runSequence('clean:dev',
    'libs:dev', 'polyfills:dev', 'services:dev', 'react:dev',
    'styles:dev', 'html:dev',
    'images:dev', 'fonts:dev',
    callback);
});

gulp.task('build:dist', function (callback) {
  runSequence('clean:dist',
    'libs:dist', 'polyfills:dist', 'services:dist', 'react:dist',
    'styles:dist', 'html:dist',
    'images:dist', 'fonts:dist',
    callback);
});

gulp.task('serve:dev', function (callback) {
  runSequence('build:dev', 'webserver:dev', callback);
});
gulp.task('serve', ['serve:dev']);

gulp.task('serve:dist', function (callback) {
  runSequence('build:dist', 'webserver:dist', callback);
});

gulp.task('clean', ['clean:dev', 'clean:dist']);

gulp.task('clean:dev', function () {
  del.sync([conf.dev.dir + '/*'], {force: true});
});

gulp.task('clean:dist', function () {
  del.sync([conf.dist.dir + '/*'], {force: true});
});

gulp.task('clean:packages', function () {
  del.sync(['node_modules', 'bower_components']);
});


gulp.task('webserver:dev', function() {
  var webserver = gulp.src([conf.dev.dir])
    .pipe(webserver({
      port: 3000,
      livereload: true,

      host: '0.0.0.0',
      directoryListing: {
        enable: true,
        path: conf.dev.dir,
      },
      open: "http://localhost:3000/"
    }));

  return webserver;
});

gulp.task('webserver:dist', function() {
  return gulp.src([conf.dist.dir])
    .pipe(webserver({
      port: 3001,
      livereload: true,
      host: '0.0.0.0',
      directoryListing: {
        enable: true,
        path: conf.dist.dir,
      },
      open: "http://localhost:3001/"
    }));
});


var libTaskDev = function (src, dst, deps) {
  return function() {
    if (!isDist)
      gulp.watch(src, deps);
    var outDir = path.join(conf.dev.dir, conf.dest.scriptsDir);
    mkdirp.sync(outDir);
    return gulp.src(src, {base: '.'})
      .pipe(sourcemaps.init())
      .pipe(concat(dst))
      .pipe(sourcemaps.write())
      .pipe(transform( function () { return exorcist(path.join(outDir, dst + ".map")); }))
      .pipe(gulp.dest(outDir));
  }
}

var libTaskDist = function(src, dst) {
  return function() {
    var outDir = path.join(conf.dist.dir, conf.dest.scriptsDir);
    mkdirp.sync(outDir);
    return gulp.src(src, {base: '.'})
      .pipe(concat(dst))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest(outDir));
  }
}

gulp.task('libs:dev', libTaskDev(conf.src.libs, conf.dest.libs, ['libs:dev']));
gulp.task('polyfills:dev', libTaskDev(conf.src.polyfills, conf.dest.polyfills, ['polyfills:dev']));
gulp.task('services:dev', libTaskDev(conf.src.services, conf.dest.services, ['services:dev']));

gulp.task('libs:dist', libTaskDist(conf.src.libs, conf.dest.libs));
gulp.task('polyfills:dist', libTaskDist(conf.src.polyfills, conf.dest.polyfills));
gulp.task('services:dist', libTaskDist(conf.src.services, conf.dest.services));


gulp.task('styles:dev', function () {
  if (!isDist)
    gulp.watch(conf.src.styles, ['styles:dev']);
  var outDir = path.join(conf.dev.dir, conf.dest.stylesDir);
  mkdirp.sync(outDir);
  return  gulp.src(conf.src.stylesRoot)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', onError)
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer(autoprefixerBrowsers))
    .pipe(sourcemaps.write('.'))
    // .pipe(transform( function () { return exorcist(path.join(outDir,"app.css.map")); }))
    .pipe(gulp.dest(outDir));
});

gulp.task('styles:dist', function () {
  return gulp.src(conf.src.stylesRoot)
    .pipe(less())
    .on('error', function(err) {
      console.error('LESS ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(autoprefixer(autoprefixerBrowsers))
    .pipe(csso())
    .pipe(gulp.dest(path.join(conf.dist.dir, conf.dest.stylesDir)));
});

gulp.task('html:dev', function () {
  if (!isDist)
    gulp.watch(conf.src.jadeWatch, ['html:dev']);

  return gulp.src(conf.src.jade)
    // .pipe(jadeAffected())
    .pipe(jade({
        pretty: true,
    }))
    .on('error', function(err) {
      console.error('Jade ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(gulp.dest(conf.dev.dir));
});

gulp.task('html:dist', function () {
  return gulp.src(conf.src.jade)
    // .pipe(jadeAffected())
    .pipe(jade({pretty: false,}))
    .on('error', function(err) {
      console.error('Jade ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(minifyHtml())
    .pipe(gulp.dest(conf.dist.dir));
});

gulp.task('images:dev', function () {
  if (!isDist)
    gulp.watch(conf.src.images, ['images:dev']);
  return gulp.src(conf.src.images)
    .pipe(imagemin({ optimizationLevel: 3, interlaced: true }))
    .pipe(rename({dirname:""}))
    .pipe(gulp.dest(path.join(conf.dev.dir, conf.dest.imagesDir)));
});

gulp.task('images:dist', function () {
  return gulp.src(conf.src.images)
    .pipe(imagemin({ optimizationLevel: 3, interlaced: true }))
    .pipe(rename({dirname:""}))
    .pipe(gulp.dest(path.join(conf.dist.dir, conf.dest.imagesDir)));
});

gulp.task('fonts:dev', function () {
  if (!isDist)
    gulp.watch(conf.src.fonts, ['fonts:dev']);
  return gulp.src(conf.src.fonts, {base:'.'})
    .pipe(rename({dirname:""}))
    .pipe(gulp.dest(path.join(conf.dev.dir, conf.dest.fontsDir)));
});

gulp.task('fonts:dist', function () {
  return gulp.src(conf.src.fonts, {base:'.'})
    .pipe(rename({dirname:""}))
    .pipe(gulp.dest(path.join(conf.dist.dir, conf.dest.fontsDir)));
});

gulp.task('react:dev', function () {

  if (!isDist)
    gulp.watch(conf.src.react, ['react:dev']);

  var outDir = path.join(conf.dev.dir, conf.dest.scriptsDir);
  mkdirp.sync(outDir);

  return gulp.src(conf.src.react)
    .pipe(react({
        'harmony': true
    }))
    .on('error', function(err) {
      console.error('JSX ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(sourcemaps.init())
    .pipe(concat(conf.dest.js))
    .pipe(sourcemaps.write())
    .pipe(transform( function () { return exorcist(path.join(outDir, conf.dest.js + ".map")); }))
    .pipe(gulp.dest(outDir));
});

gulp.task('react:dist', function () {

  var outDir = path.join(conf.dist.dir, conf.dest.scriptsDir);
  mkdirp.sync(outDir);

  return gulp.src(conf.src.react)
    .pipe(react({
        'harmony': true
    }))
    .on('error', function(err) {
      console.error('JSX ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(concat(conf.dest.js))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(outDir));
});


