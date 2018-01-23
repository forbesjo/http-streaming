var istanbul = require('browserify-istanbul');
var isparta = require('isparta');

module.exports = function(config) {

  var detectBrowsers = {
    enabled: false,
    usePhantomJS: false,
    postDetection: function(availableBrowsers) {
      var safariIndex = availableBrowsers.indexOf('Safari');
      var firfoxIndex = availableBrowsers.indexOf('Firefox');

      var chromeIndex = availableBrowsers.indexOf('Chrome');
      if(safariIndex !== -1) {
        availableBrowsers.splice(safariIndex, 1);
        console.log("Disabled Safari as it was/is not supported");
      }
      if(firfoxIndex !== -1) {
        availableBrowsers.splice(firfoxIndex, 1);
        console.log("Disabled Firefox as it was/is not supported");
      }
      if(chromeIndex !== -1) {
        availableBrowsers.splice(chromeIndex, 1);
        console.log("Disabled Chrome as it was/is not supported");
      }
      return availableBrowsers;
    }
  };

  if (process.env.TRAVIS) {
    config.browsers = ['ChromeHeadlessNoSandbox','chrome_canary_harmony'];
  }

  // If no browsers are specified, we enable `karma-detect-browsers`
  // this will detect all browsers that are available for testing
  if (!config.browsers.length) {
    detectBrowsers.enabled = true;
  }

  config.set({
    basePath: '..',
    frameworks: ['qunit', 'browserify', 'detectBrowsers'],
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/sinon/pkg/sinon-ie.js',
      'node_modules/video.js/dist/video.js',
      'node_modules/video.js/dist/video-js.css',
      'node_modules/videojs-flash/dist/videojs-flash.js',
      'dist-test/browserify-test.js',
      'dist-test/webpack-test.js',
      'dist-test/videojs-http-streaming.js'
    ],
    browserConsoleLogOptions: {
      level: 'error',
      terminal: false
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      },
chrome_canary_harmony: {
base: 'ChromeCanary',
flags: ['--no-sandbox'],
captureTimeout: 210000,
browserDisconnectTolerance: 3, //this one helps
browserDisconnectTimeout : 210000,
browserNoActivityTimeout : 600000
}
    },
    preprocessors: {
      'test/**/*.test.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [
        'babelify',
        ['browserify-shim', { global: true }]
      ],
      noParse: [
        'test/data/**',
      ]
    },
    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },
    detectBrowsers: detectBrowsers,
    reporters: ['dots'],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  });

  // Coverage reporting
  // Coverage is enabled by passing the flag --coverage to npm test
  var coverageFlag = process.env.npm_config_coverage;
  var reportCoverage = process.env.TRAVIS || coverageFlag;

  if (reportCoverage) {
    config.reporters.push('coverage');
    config.browserify.transform.push(istanbul({
      instrumenter: isparta,
      ignore: ['**/node_modules/**', '**/test/**']
    }));
    config.preprocessors['src/**/*.js'] = ['browserify', 'coverage'];
  }

};
