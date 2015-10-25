var gulp = require('gulp');
// var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var del = require('del');
var gulpif = require('gulp-if');
var webserver = require('gulp-webserver');
var jade = require('gulp-jade');
var GeminiApi = require('gemini/api');
var selenium = require('selenium-standalone');

var argv = require('yargs').argv;

var testConf = {

  port: 3003,
  url: "http://localhost:3003" ,
  
  webserver: null,
  selenium: null,
  wwwrootServer: 'test/gemini/wwwroot',
  wwwroot: 'test/gemini/wwwroot/test',
  jade: 'test/gemini/src/**/*.jade',
  paths: [
    'test/gemini/test'
  ],
}

var geminiApi = new GeminiApi({
  system: {
    projectRoot: './test',
    sourceRoot: './src',
  },
  rootUrl: testConf.url,
  gridUrl: 'http://localhost:4444/wd/hub',
  screenshotsDir: 'gemini/screens',
  browsers: {
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        // version: "45.0",
      }
    },

    // firefox: {
    //   desiredCapabilities: {
    //     browserName: firefox,
    //     version: "39.0",
    //   }
    // },
  },
  sets:{
    all: {
      files: [
        "gemini/test",
      ],
      // browsers: [
      //   "chrome",
      // ],
    },
  }
 });

var isGather = argv.gather;
// var isGather = function() {
//   var ind = process.argv.indexOf("--gather");
//   return (ind > -1);
// }();


module.exports = function (conf) {

gulp.task('gemini', function (done) {
  runSequence(
    'test-clean',
    'test-html',
    // 'build:dev',
    'testserver-start',
    'selenium-start',
    isGather ? 'test-gather' : 'test-run',
    'selenium-stop',
    function () {
      cleanup();
      done();
    });
});

function logger (message) { 
  console.log(message);
}

function cleanup () {
  if (testConf.webserver) {
    // console.log('cleanup webserver', testConf.webserver.emit('kill'));
    testConf.webserver.emit('kill');
    testConf.webserver = null;
  }
  // if (testConf.testWatch) {
  //   testConf.testWatch.emit('kill');
  //   testConf.testWatch = null;
  // }
}


gulp.task('test-clean', function () {
  del.sync([testConf.wwwroot + '/*'], {force: true});
});

gulp.task('test-run', function(done) {
  return geminiApi.test(testConf.paths, {
    reporters: [
      'flat',
      'html',
    ],
  })
    // .done(done, done);
});

gulp.task('test-gather', function(done) {
  return geminiApi.gather(testConf.paths, {
  })
    // .done(done, done);

});


gulp.task('selenium-install', function (done) {
  selenium.install({logger: logger}, done);
});

gulp.task('selenium-start', function (done) {
  selenium.start(function (err, child) {
    if (err) return done(err);
    testConf.selenium = child;
    done();
  });
});

gulp.task('selenium-stop', function(done) {
  testConf.selenium.kill();
  done();
});

gulp.task('testserver-start', function() {
  testConf.webserver = gulp.src([conf.dev.dir, testConf.wwwrootServer])
    .pipe(webserver({
      port: testConf.port,
      livereload: false,

      // host: '0.0.0.0',
      directoryListing: false,
      open: false,
    }));

  return testConf.webserver;
});


gulp.task('test-html', function () {
  // testConf.testWatch = gulp.watch(testConf.jade, ['test-html']);

  return gulp.src(testConf.jade)
    .pipe(jade({
        pretty: true,
    }))
    .on('error', function(err) {
      console.error('Jade ERROR in ' + err.fileName);
      console.error(err.message);
      this.end();
    })
    .pipe(gulp.dest(testConf.wwwroot));
});


}